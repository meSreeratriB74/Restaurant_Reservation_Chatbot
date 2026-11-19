
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatInput from "./ChatInput";
import { sendMessage } from "../services/chatService";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (text) => {
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setLoading(true);

    try {
      const reply = await sendMessage(text);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Server error. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-xl rounded-xl flex flex-col">

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        <div className="p-3 bg-yellow-100 text-black">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {"# Markdown Test\n\n**This text should be bold.**\n\n- Item One\n- Item Two"}
  </ReactMarkdown>
</div>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[90%] break-words ${
              msg.sender === "user"
                ? "bg-blue-500 text-white ml-auto"
                : "bg-gray-100 text-black"
            }`}
          >
            {msg.sender === "user" ? (
              <p className="whitespace-pre-wrap">{msg.text}</p>
            ) : (
              <div className="text-sm leading-6 space-y-2">

                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-xl font-bold mb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold mb-2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-bold mt-3 mb-1">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-2">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold">
                        {children}
                      </strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 mb-2 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 mb-2 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li>{children}</li>
                    ),
                    hr: () => (
                      <hr className="my-3 border-gray-300" />
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3">
                        <table className="w-full border-collapse text-sm">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border border-gray-300 bg-gray-200 p-2 text-left font-bold">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="border border-gray-300 p-2">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>

              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="text-sm text-gray-400 italic">
            AI is typing...
          </div>
        )}

      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} />

    </div>
  );
};

export default ChatBox;
