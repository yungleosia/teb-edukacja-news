"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { pl } from "date-fns/locale";
import { useSession } from "next-auth/react";

interface User {
    id: string;
    name: string | null;
    image: string | null;
    lastSeen: Date | string | null;
}

interface Message {
    id: string;
    body: string | null;
    image: string | null;
    createdAt: Date;
    sender: User;
    senderId: string;
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
    otherUser: initialOtherUser,
}: ChatWindowProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [otherUser, setOtherUser] = useState<User>(initialOtherUser);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling for new messages and user status
    useEffect(() => {
        if (!conversationId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/conversations/${conversationId}/messages`);
                if (res.ok) {
                    const data = await res.json();
                    // Handle both old array format (fallback) and new object format
                    if (Array.isArray(data)) {
                        setMessages(data);
                    } else {
                        setMessages(data.messages);
                        const updatedOther = data.users.find((u: User) => u.id === otherUser.id);
                        if (updatedOther) {
                            setOtherUser(prev => ({ ...prev, ...updatedOther }));
                        }
                    }
                }
            } catch (error) {
                console.error("Polling error", error);
            }
        }, 3000); // 3 seconds

        return () => clearInterval(interval);
    }, [conversationId, otherUser.id]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit for base64
                alert("Zdjęcie jest za duże! Max 1MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedImage) || isSending) return;

        setIsSending(true);

        try {
            const res = await fetch(`/api/conversations/${conversationId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    body: newMessage,
                    image: selectedImage
                }),
            });

            if (res.ok) {
                const savedMessage = await res.json();
                setMessages((prev) => [...prev, savedMessage]);
                setNewMessage("");
                setSelectedImage(null);
                router.refresh();
            } else {
                alert("Failed to send message");
            }
        } catch (error) {
            console.error("Send error", error);
        } finally {
            setIsSending(false);
        }
    };

    const isOnline = otherUser.lastSeen
        ? differenceInMinutes(new Date(), new Date(otherUser.lastSeen)) < 2
        : false;

    if (!conversationId) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0f172a]/50">
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
                    <div className="flex items-center gap-2">
                        {isOnline ? (
                            <>
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <p className="text-xs text-green-400">Online</p>
                            </>
                        ) : (
                            <p className="text-xs text-gray-400">
                                {otherUser.lastSeen
                                    ? `Last seen ${formatDistanceToNow(new Date(otherUser.lastSeen), { addSuffix: true, locale: pl })}`
                                    : "Offline"}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">No messages yet. Say hi! 👋</div>
                ) : (
                    messages.map((message) => {
                        const isMe = message.senderId === session?.user?.id;
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
                                    {!isMe && <div className="text-xs text-gray-400 mb-1">{message.sender.name}</div>}

                                    {message.image && (
                                        <div className="mb-2 rounded-lg overflow-hidden">
                                            <img src={message.image} alt="Attachment" className="max-w-full h-auto" />
                                        </div>
                                    )}

                                    {message.body && <p className="break-words">{message.body}</p>}

                                    <div className={`text-[10px] mt-1 text-right ${isMe ? "text-indigo-200" : "text-gray-400"}`}>
                                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: pl })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-black/20">
                {selectedImage && (
                    <div className="mb-2 p-2 bg-white/5 rounded-lg flex items-center justify-between">
                        <span className="text-sm text-gray-400">Wybrano zdjęcie</span>
                        <button type="button" onClick={() => setSelectedImage(null)} className="text-red-400 text-xs hover:text-red-300">Usuń</button>
                    </div>
                )}
                <div className="flex gap-4">
                    <label className="p-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition cursor-pointer flex items-center justify-center">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                        📷
                    </label>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <button
                        type="submit"
                        disabled={(!newMessage.trim() && !selectedImage) || isSending}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50"
                    >
                        {isSending ? (
                            <span className="animate-spin">⌛</span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                            </svg>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
