import { NextResponse } from "next/server";

// NOTE: In-memory rate limiting resets on every deploy and doesn't share state
// across serverless instances. Fine for low pre-launch traffic, but must be
// replaced with Upstash Rate Limit + KV before public launch.
const rateMap = new Map();
const RATE_LIMIT = 20;      // requests
const RATE_WINDOW = 60_000; // per minute (ms)

const SYSTEM = `You are Vanism.ai Copilot, an expert van life travel assistant. Be concise and practical.

When and only when you are proposing a specific driving route from one named location to another, append the following block on its own line at the very end of your reply — do not include it on general advice, questions, or non-routing responses:
---PLAN---
{"origin":"<start location>","destination":"<end location>","distance_miles":<number>,"drive_time_minutes":<number>}
---END---`;
const MAX_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 2000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip) ?? { count: 0, start: now };
  if (now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  rateMap.set(ip, entry);
  return false;
}

export async function POST(req) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const { messages, resources } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages must be a non-empty array." }, { status: 400 });
    }
    if (messages.length > MAX_MESSAGES) {
      return NextResponse.json({ error: `Conversation too long (max ${MAX_MESSAGES} messages).` }, { status: 400 });
    }
    for (const m of messages) {
      if (typeof m.content !== "string" || m.content.length > MAX_MESSAGE_LENGTH) {
        return NextResponse.json({ error: `Message content exceeds ${MAX_MESSAGE_LENGTH} character limit.` }, { status: 400 });
      }
    }

    const contextNote = resources
      ? `\n\n[Van resources: Water ${resources.water}%, Power ${resources.power}%, Fuel ${resources.fuel}%, Budget $${resources.budget} remaining]`
      : "";
    const apiMessages = messages.map((m, i) => ({
      role: m.role,
      content: i === messages.length - 1 && m.role === "user"
        ? m.content + contextNote
        : m.content,
    }));
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM,
        messages: apiMessages,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("Anthropic error:", response.status, JSON.stringify(data));
      return NextResponse.json({ reply: `Error ${response.status}: ${data.error?.message || "Unknown error"}` });
    }
    const raw = data.content?.map((b) => b.text || "").join("") || "No response.";
    const PLAN_RE = /\n?---PLAN---\n(\{[\s\S]*?\})\n---END---/;
    const planMatch = raw.match(PLAN_RE);
    const reply = raw.replace(PLAN_RE, "").trim();
    let plan = null;
    if (planMatch) {
      try { plan = JSON.parse(planMatch[1]); } catch { /* malformed JSON — drop silently */ }
    }
    return NextResponse.json({ reply, plan });
  } catch (err) {
    console.error("Copilot route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
