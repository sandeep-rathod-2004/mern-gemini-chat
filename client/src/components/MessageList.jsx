import React, { useEffect, useRef } from "react";

export default function MessageList({ messages, userId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const el = messagesEndRef.current;
    if (!el) return;
    const parent = el.parentNode;
    const isAtBottom =
      parent.scrollHeight - parent.scrollTop - parent.clientHeight < 50;
    if (isAtBottom) el.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <ul className="space-y-2">
      {messages.map((msg) => (
        <li
          key={msg._id || Math.random()}
          className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`px-4 py-2 rounded-lg max-w-xs break-words ${
              msg.senderId === userId
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-white"
            }`}
          >
            <p className="text-sm font-semibold">
              {msg.senderName || "Unknown"}
            </p>
            <p className="mt-1">{msg.text}</p>
            <p className="text-xs text-gray-300 mt-1">
              {formatTime(msg.createdAt || Date.now())}
            </p>
          </div>
        </li>
      ))}
      <div ref={messagesEndRef}></div>
    </ul>
  );
}
