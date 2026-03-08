import { useState } from "react";
import { askTutor } from "../utils/api";
import "./tutorBox.css";

export default function TutorBox({ weakAreas = [] }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "👋 I'm your AI tutor. Ask me anything about your weak topics." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await askTutor(input, weakAreas);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: res.answer || "No response generated." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Tutor failed. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tutor-box">
      <h3>🤖 AI Tutor</h3>

      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`chat ${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Aptitude, DSA, DBMS, OS..."
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
