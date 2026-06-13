import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { messages, system, resources } = await req.json();
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
        system: system,
        messages: apiMessages,
      }),
    });
    const data = await response.json();
    const reply = data.content?.map((b) => b.text || "").join("") || "No response.";
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
