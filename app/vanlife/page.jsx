"use client";
import { useState } from "react";

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
        body: JSON.stringify({ messages: next, system: "You are Vanlife.ai Copilot, an expert van life travel assistant." })
      });
      const data = await res.json();
      setChat(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setChat(prev => [...prev, { role: "assistant", content: "No signal." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ background: "#0C0D0B", minHeight: "100vh", color: "#E8E2D4", fontFamily: "Georgia, serif", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ padding: "16px", borderBottom: "1px solid #252820", background: "#131410" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Vanlife.ai</div>
        <div style={{ fontSize: 10, color: "#7A9E7E", letterSpacing: "0.2em" }}>COPILOT ACTIVE</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {chat.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", background: m.role === "user" ? "#3D5940" : "#181A15", border: "1px solid #252820", borderRadius: 10, padding: "10px 14px", maxWidth: "80%", fontSize: 13, lineHeight: 1.6 }}>
            {m.content}
          </div>
        ))}
        {loading && <div style={{ color: "#7A7568", fontSize: 12 }}>reading the road...</div>}
      </div>
      <div style={{ display: "flex", gap: 8, padding: 14, borderTop: "1px solid #252820" }}>
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask the copilot..." style={{ flex: 1, background: "#131410", border: "1px solid #252820", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#E8E2D4", outline: "none" }} />
        <button onClick={send} style={{ background: "#7A9E7E", border: "none", borderRadius: 8, padding: "10px 16px", color: "#0C0D0B", fontWeight: 700, cursor: "pointer" }}>GO</button>
      </div>
    </div>
  );
}
