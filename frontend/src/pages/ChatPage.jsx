import axios from "axios";
import { useEffect, useRef, useState } from "react";
import ChatInput from "../components/ChatInput";

const ChatPage = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "🍽️ Welcome to our restaurant! I can help you book a table or check availability.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (message) => {
    // User message (always string)
    setMessages((prev) => [...prev, { sender: "user", text: String(message) }]);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        message,
      });

      // ✅ SAFELY EXTRACT STRING ONLY
      let botReply = "🤖 Sorry, I couldn’t understand that.";

      if (typeof res.data === "string") {
        botReply = res.data;
      } else if (typeof res.data?.reply === "string") {
        botReply = res.data.reply;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botReply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Server error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-orange-200 via-amber-100 to-yellow-200">
      <style>{`
        /* Custom Scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #eeff01, #ff0000);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Chat bubble hover effect */
        .chat-bubble {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .chat-bubble:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        /* Typing animation dots */
        @keyframes bounceDelay {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .typing-dot {
          background-color: #2a54ff;
          border-radius: 50%;
          width: 6px;
          height: 6px;
          display: inline-block;
          margin: 0 2px;
          animation: bounceDelay 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(2) {
          animation-delay: -0.32s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: -0.16s;
        }
      `}</style>

      <div className="w-full max-w-2xl h-[92vh] rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md flex flex-col overflow-hidden border border-white/30">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 px-6 py-4 text-white flex items-center justify-between shadow-lg shadow-orange-500/40">
          <div>
            <h1 className="text-xl font-bold tracking-wide">
              🍴 Smart Restaurant Assistant
            </h1>
            <p className="text-xs text-orange-100">
              Book • Check availability • Get recommendations
            </p>
          </div>
          <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent">

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`chat-bubble max-w-[75%] px-4 py-3 text-sm leading-relaxed rounded-2xl shadow-lg ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white rounded-br-none"
                    : "bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {String(msg.text)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 italic">
              🤖 AI is typing
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          )}

          <div ref={bottomRef}></div>
        </div>

        {/* Footer / Input */}
        <div className="bg-white border-t border-orange-200">
          <ChatInput onSend={handleSend} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
