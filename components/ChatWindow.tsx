
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

interface User {
    id: string;
    name: string | null;
    image: string | null;
}

interface Message {
    id: string;
    content: string;
    createdAt: Date;
    sender: User;
}

interface ChatWindowProps {
    conversationId: string;
    initialMessages: Message[];
    currentUser: User;
    otherUser: User;
}

export function ChatWindow({
    conversationId,
    initialMessages,
    currentUser,
    otherUser,
}: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling for new messages
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/conversations/${conversationId}/messages`);
                if (res.ok) {
                    const data = await res.json();
                    // Ideally we should merge or check for dupes, but replacing is okay for MVP if simple
                    // But replacing might reset scroll position if not careful.
                    // Let's just setMessages if length is different or last message is different
                    setMessages(data);
                }
            } catch (error) {
                console.error("Polling error", error);
            }
        }, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, [conversationId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const tempMessage: Message = {
            id: "temp-" + Date.now(),
            content: newMessage,
            createdAt: new Date(),
            sender: currentUser
        };

        setMessages([...messages, tempMessage]);
        setNewMessage("");

        try {
            const res = await fetch(`/api/conversations/${conversationId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: tempMessage.content }),
            });

            if (res.ok) {
                const savedMessage = await res.json();
                setMessages((prev) =>
                    prev.map((m) => (m.id === tempMessage.id ? savedMessage : m))
                );
                router.refresh(); // Refresh server text (sidebar list etc)
            } else {
                // Handle error (remove temp message)
                setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
                alert("Failed to send message");
            }
        } catch (error) {
            console.error("Send error", error);
            setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden">
                    {otherUser.image ? (
                        <img src={otherUser.image} alt={otherUser.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-indigo-300 font-bold">{otherUser.name?.[0]}</span>
                    )}
                </div>
                <div>
                    <h2 className="font-bold text-white">{otherUser.name}</h2>
                    <p className="text-xs text-green-400">Online (Simulated)</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                    const isMe = message.sender.id === currentUser.id;
                    return (
                        <div
                            key={message.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-2xl p-3 ${isMe
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-white/10 text-gray-200 rounded-bl-none"
                                    }`}
                            >
                                <p>{message.content}</p>
                                <div className={`text-[10px] mt-1 ${isMe ? "text-indigo-200" : "text-gray-400"}`}>
                                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: pl })}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-black/20 flex gap-4">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button
                    type="button" // Change to submit
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                    </svg>
                </button>
            </form>
        </div>
    );
}
