import { useState } from "react";

const ChatInput = ({ onSend }) => {
const [text, setText] = useState("");

const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
};

return (
    <div className="flex gap-2 p-4 border-t">
    <input
        type="text"
        className="flex-1 border rounded px-3 py-2"
        placeholder="Ask for reservation..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
    />
    <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 rounded"
    >
        Send
    </button>
    </div>
);
};

export default ChatInput;
