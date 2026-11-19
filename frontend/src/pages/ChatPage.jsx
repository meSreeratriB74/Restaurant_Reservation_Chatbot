import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import ChatInput from "../components/ChatInput";

const QUICK_REPLIES = [
  "Book a table for 2 tonight",
  "Check availability this weekend",
  "What do you recommend?",
];

const formatTime = (date = new Date()) =>
  date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const markdownComponents = {
  h1: ({ children }) => <h1 className="rc-h1">{children}</h1>,
  h2: ({ children }) => <h2 className="rc-h2">{children}</h2>,
  h3: ({ children }) => <h3 className="rc-h3">{children}</h3>,
  p: ({ children }) => <p className="rc-p">{children}</p>,
  strong: ({ children }) => <strong className="rc-strong">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="rc-link">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="rc-ul">{children}</ul>,
  ol: ({ children }) => <ol className="rc-ol">{children}</ol>,
  li: ({ children }) => <li className="rc-li">{children}</li>,
  hr: () => <hr className="rc-hr" />,
  blockquote: ({ children }) => (
    <blockquote className="rc-quote">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="rc-table-wrap">
      <table className="rc-table">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="rc-thead">{children}</thead>,
  th: ({ children }) => <th className="rc-th">{children}</th>,
  td: ({ children }) => <td className="rc-td">{children}</td>,
};

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Welcome! I can help you book a table or check availability. What would you like to do?",
      time: formatTime(),
    },
  ]);

  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (message) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: String(message), time: formatTime() },
    ]);

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
  message,
  history: [
    ...messages,
    {
      sender: "user",
      text: String(message),
    },
  ],
});

      let botReply = "Sorry, I couldn't understand that. Could you rephrase?";

      if (typeof res.data === "string") {
        botReply = res.data;
      } else if (typeof res.data?.reply === "string") {
        botReply = res.data.reply;
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply, time: formatTime() },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Something went wrong on our side. Please try again in a moment.",
          time: formatTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showQuickReplies = messages.length === 1 && !loading;

  return (
    <div className="rc-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

        .rc-page {
          --ink: #14302a;
          --ink-soft: #1f4a40;
          --brass: #c9a24a;
          --brass-deep: #9a7623;
          --paper: #fbfaf7;
          --line: #e7e3da;
          --text: #26302d;
          --muted: #6d756f;
          --bot-bg: #ffffff;
          --user-bg: #14302a;

          height: 100vh;
          height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
          color: var(--text);
          background:
            radial-gradient(900px 500px at 10% -10%, #e4ece7 0%, transparent 60%),
            radial-gradient(800px 500px at 100% 110%, #f1e7cf 0%, transparent 60%),
            #eef0ec;
        }

        .rc-shell {
          width: 100%;
          max-width: 720px;
          height: min(100%, 880px);
          display: flex;
          flex-direction: column;
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 20px;
          overflow: hidden;
          box-shadow:
            0 1px 2px rgba(20, 48, 42, 0.06),
            0 24px 60px -20px rgba(20, 48, 42, 0.28);
          animation: rcRise 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }

        @keyframes rcRise {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: none; }
        }

        /* ---------- Header ---------- */
        .rc-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 24px;
          background: var(--ink);
          color: #f4f1e8;
          border-bottom: 3px solid var(--brass);
        }

        .rc-logo {
          flex: none;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 20px;
          background: var(--ink-soft);
          border: 1px solid rgba(201, 162, 74, 0.55);
        }

        .rc-title {
          margin: 0;
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 600;
          font-size: 20px;
          letter-spacing: 0.01em;
          line-height: 1.2;
        }

        .rc-subtitle {
          margin: 3px 0 0;
          font-size: 12.5px;
          color: #b9c8c1;
        }

        .rc-status {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #cfdcd5;
        }

        .rc-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.6);
          animation: rcPulse 2.4s infinite;
        }

        @keyframes rcPulse {
          0%   { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.55); }
          70%  { box-shadow: 0 0 0 8px rgba(74, 222, 128, 0); }
          100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }

        /* ---------- Conversation ---------- */
        .rc-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 24px 24px 12px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          background:
            linear-gradient(var(--paper), var(--paper));
          scrollbar-width: thin;
          scrollbar-color: #cfc8b6 transparent;
        }

        .rc-scroll::-webkit-scrollbar { width: 8px; }
        .rc-scroll::-webkit-scrollbar-track { background: transparent; }
        .rc-scroll::-webkit-scrollbar-thumb {
          background: #d6d0bf;
          border-radius: 8px;
          border: 2px solid var(--paper);
        }
        .rc-scroll::-webkit-scrollbar-thumb:hover { background: #bfb79f; }

        .rc-row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          animation: rcMsg 0.28s ease-out both;
        }
        .rc-row.user { justify-content: flex-end; }

        @keyframes rcMsg {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: none; }
        }

        .rc-avatar {
          flex: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 14px;
          background: var(--ink);
          border: 1px solid rgba(201, 162, 74, 0.6);
        }

        .rc-col {
          display: flex;
          flex-direction: column;
          max-width: min(86%, 560px);
        }
        .rc-row.user .rc-col { align-items: flex-end; }

        .rc-bubble {
          padding: 12px 16px;
          font-size: 14.5px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .rc-bubble.bot {
          background: var(--bot-bg);
          border: 1px solid var(--line);
          border-radius: 4px 18px 18px 18px;
          box-shadow: 0 1px 2px rgba(20, 48, 42, 0.05);
        }

        .rc-bubble.user {
          background: var(--user-bg);
          color: #f7f5ee;
          border-radius: 18px 18px 4px 18px;
          white-space: pre-wrap;
          box-shadow: 0 6px 16px -8px rgba(20, 48, 42, 0.55);
        }

        .rc-time {
          margin-top: 5px;
          padding: 0 4px;
          font-size: 11px;
          color: var(--muted);
        }

        /* ---------- Quick replies ---------- */
        .rc-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 0 0 0 40px;
        }

        .rc-chip {
          font: inherit;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 8px 14px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .rc-chip:hover {
          background: var(--ink);
          border-color: var(--ink);
          color: #fff;
        }

        /* ---------- Typing indicator ---------- */
        .rc-typing {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 14px 16px;
          background: var(--bot-bg);
          border: 1px solid var(--line);
          border-radius: 4px 18px 18px 18px;
        }

        .rc-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--brass-deep);
          animation: rcBounce 1.3s infinite ease-in-out both;
        }
        .rc-dot:nth-child(2) { animation-delay: -0.2s; }
        .rc-dot:nth-child(3) { animation-delay: -0.4s; }
        .rc-dot:nth-child(1) { animation-delay: -0.6s; }

        @keyframes rcBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40%           { transform: translateY(-4px); opacity: 1; }
        }

        /* ---------- Footer ---------- */
        .rc-footer {
          padding: 12px 16px 14px;
          background: #fff;
          border-top: 1px solid var(--line);
        }

        /* ---------- Markdown ---------- */
        .rc-md > :first-child { margin-top: 0 !important; }
        .rc-md > :last-child  { margin-bottom: 0 !important; }

        .rc-h1, .rc-h2, .rc-h3 {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 600;
          color: var(--ink);
          line-height: 1.25;
        }
        .rc-h1 { font-size: 20px; margin: 6px 0 10px; }
        .rc-h2 { font-size: 17.5px; margin: 14px 0 8px; }
        .rc-h3 { font-size: 15.5px; margin: 12px 0 6px; }

        .rc-p { margin: 0 0 10px; }
        .rc-strong { font-weight: 600; color: var(--ink); }

        .rc-link {
          color: var(--ink-soft);
          text-decoration: underline;
          text-decoration-color: var(--brass);
          text-underline-offset: 3px;
        }
        .rc-link:hover { color: var(--brass-deep); }

        .rc-ul, .rc-ol { margin: 0 0 10px; padding-left: 22px; }
        .rc-ul { list-style: disc; }
        .rc-ol { list-style: decimal; }
        .rc-ul > .rc-li::marker { color: var(--brass-deep); }
        .rc-ol > .rc-li::marker { color: var(--brass-deep); font-weight: 600; }
        .rc-li { padding-left: 4px; margin-bottom: 4px; }

        .rc-hr {
          margin: 14px 0;
          border: 0;
          border-top: 1px solid var(--line);
        }

        .rc-quote {
          margin: 0 0 10px;
          padding: 4px 0 4px 14px;
          border-left: 3px solid var(--brass);
          color: var(--muted);
        }

        .rc-table-wrap {
          margin: 10px 0 12px;
          overflow-x: auto;
          border: 1px solid var(--line);
          border-radius: 10px;
        }
        .rc-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
          text-align: left;
        }
        .rc-thead { background: #f3efe3; }
        .rc-th {
          padding: 9px 12px;
          font-weight: 600;
          color: var(--ink);
          border-bottom: 1px solid var(--line);
          white-space: nowrap;
        }
        .rc-td {
          padding: 9px 12px;
          border-bottom: 1px solid #f0ece2;
        }
        .rc-table tbody tr:last-child .rc-td { border-bottom: 0; }
        .rc-table tbody tr:hover { background: #faf7ee; }

        /* ---------- Focus & motion ---------- */
        .rc-chip:focus-visible,
        .rc-link:focus-visible {
          outline: 2px solid var(--brass-deep);
          outline-offset: 2px;
        }

        @media (prefers-reduced-motion: reduce) {
          .rc-shell, .rc-row, .rc-status-dot, .rc-dot { animation: none !important; }
        }

        /* ---------- Small screens ---------- */
        @media (max-width: 640px) {
          .rc-page { padding: 0; }
          .rc-shell { height: 100%; max-width: none; border-radius: 0; border: 0; }
          .rc-header { padding: 14px 16px; }
          .rc-status span:last-child { display: none; }
          .rc-scroll { padding: 18px 14px 10px; }
          .rc-col { max-width: 90%; }
          .rc-chips { padding-left: 0; }
        }
      `}</style>

      <div className="rc-shell">
        {/* Header */}
        <header className="rc-header">
          <div className="rc-logo" aria-hidden="true">🍽️</div>
          <div>
            <h1 className="rc-title">Rannabari</h1>
            <p className="rc-subtitle">
              Where Bengal Meets Beyond
            </p>
          </div>
          <div className="rc-status" role="status">
            <span className="rc-status-dot" />
            <span>Online</span>
          </div>
        </header>

        {/* Conversation */}
        <main className="rc-scroll" aria-live="polite">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rc-row ${msg.sender === "user" ? "user" : "bot"}`}
            >
              {msg.sender === "bot" && (
                <div className="rc-avatar" aria-hidden="true">🍴</div>
              )}

              <div className="rc-col">
                <div
                  className={`rc-bubble ${
                    msg.sender === "user" ? "user" : "bot"
                  }`}
                >
                  {msg.sender === "user" ? (
                    msg.text
                  ) : (
                    <div className="rc-md">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {msg.time && <span className="rc-time">{msg.time}</span>}
              </div>
            </div>
          ))}

          {showQuickReplies && (
            <div className="rc-chips">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="rc-chip"
                  onClick={() => handleSend(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="rc-row bot">
              <div className="rc-avatar" aria-hidden="true">🍴</div>
              <div className="rc-typing" aria-label="Assistant is typing">
                <span className="rc-dot" />
                <span className="rc-dot" />
                <span className="rc-dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        {/* Input */}
        <footer className="rc-footer">
          <ChatInput onSend={handleSend} />
        </footer>
      </div>
    </div>
  );
};

export default ChatPage;