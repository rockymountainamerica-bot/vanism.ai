"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function VanlifeAI() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([
    { role: "assistant", content: "Copilot online. Where are you headed?" }
  ]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!msg.trim() || loading) return;
    const next = [...chat, { role: "user", content: msg }];
    setChat(next);
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, system: "You are Vanism.ai Copilot, an expert van life travel assistant." })
      });
      const data = await res.json();
      setChat(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setChat(prev => [...prev, { role: "assistant", content: "No signal." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ background: "#0C0D0B", minHeight: "100vh" }}>
      <div style={{ color: "#E8E2D4", fontFamily: "Georgia, serif", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", height: "100vh" }}>
        <div style={{ padding: "16px", borderBottom: "1px solid #252820", background: "#131410" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Vanism.ai</div>
          <div style={{ fontSize: 10, color: "#7A9E7E", letterSpacing: "0.2em" }}>COPILOT ACTIVE</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {chat.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? "#3D5940" : "#181A15", border: "1px solid #252820", borderRadius: 10, padding: "10px 14px", maxWidth: "80%", fontSize: 13, lineHeight: 1.6 }}>
              {m.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                  table: ({ children }) => <table style={{ borderCollapse: "collapse", fontSize: 12, margin: "6px 0", width: "100%" }}>{children}</table>,
                  th: ({ children }) => <th style={{ border: "1px solid #252820", padding: "4px 8px", textAlign: "left", background: "#0C0D0B" }}>{children}</th>,
                  td: ({ children }) => <td style={{ border: "1px solid #252820", padding: "4px 8px" }}>{children}</td>,
                  h1: ({ children }) => <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, marginTop: 4 }}>{children}</div>,
                  h2: ({ children }) => <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, marginTop: 8 }}>{children}</div>,
                  h3: ({ children }) => <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, marginTop: 6 }}>{children}</div>,
                  p: ({ children }) => <p style={{ margin: "4px 0" }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ margin: "4px 0", paddingLeft: 18 }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: "4px 0", paddingLeft: 18 }}>{children}</ol>,
                  li: ({ children }) => <li style={{ margin: "2px 0" }}>{children}</li>,
                  strong: ({ children }) => <strong style={{ color: "#B5C9B7" }}>{children}</strong>,
                  hr: () => <hr style={{ border: "none", borderTop: "1px solid #252820", margin: "8px 0" }} />,
                  code: ({ children }) => <code style={{ background: "#0C0D0B", padding: "1px 4px", borderRadius: 3, fontSize: 12 }}>{children}</code>,
                }}>{m.content}</ReactMarkdown>
              ) : m.content}
            </div>
          ))}
          {loading && <div style={{ color: "#7A7568", fontSize: 12 }}>reading the road...</div>}
        </div>
        <div style={{ display: "flex", gap: 8, padding: 14, borderTop: "1px solid #252820" }}>
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask the copilot..." style={{ flex: 1, background: "#131410", border: "1px solid #252820", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#E8E2D4", outline: "none" }} />
          <button onClick={send} style={{ background: "#7A9E7E", border: "none", borderRadius: 8, padding: "10px 16px", color: "#0C0D0B", fontWeight: 700, cursor: "pointer" }}>GO</button>
        </div>
      </div>
    </div>
  );
}
