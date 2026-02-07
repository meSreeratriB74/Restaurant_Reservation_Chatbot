import { useState } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

const ChatWindow = () => {
const [messages, setMessages] = useState([
    { sender: "bot", message: "Hello! How can I help with your reservation?" },
]);

const handleSend = (text) => {
    setMessages((prev) => [
    ...prev,
    { sender: "user", message: text },
    { sender: "bot", message: "Booking feature coming soon 😊" },
    ]);
};

return (
    <div className="flex flex-col h-screen max-w-md mx-auto border">
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
        <MessageBubble
            key={index}
            sender={msg.sender}
            message={msg.message}
        />
        ))}
    </div>
    <ChatInput onSend={handleSend} />
    </div>
);
};

export default ChatWindow;
