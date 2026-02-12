
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

interface Conversation {
    id: string;
    updatedAt: Date;
    users: {
        id: string;
        name: string | null;
        image: string | null;
    }[];
    messages: {
        body: string | null;
        image: string | null;
        createdAt: Date;
    }[];
}

interface ConversationListProps {
    conversations: Conversation[];
    currentUserId: string;
}

export function ConversationList({ conversations, currentUserId }: ConversationListProps) {
    const pathname = usePathname();

    return (
        <div className="w-full md:w-80 border-r border-white/5 bg-black/20 overflow-y-auto h-full hidden md:block">
            <div className="p-4 border-b border-white/5">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                    Messages
                </h2>
            </div>
            <div className="flex flex-col">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        No conversations yet.
                    </div>
                ) : (
                    conversations.map((conversation) => {
                        const otherUser = conversation.users.find((u) => u.id !== currentUserId);
                        const lastMessage = conversation.messages[0];
                        const isActive = pathname === `/messages/${conversation.id}`;

                        return (
                            <Link
                                key={conversation.id}
                                href={`/messages/${conversation.id}`}
                                className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-3 items-center ${isActive ? "bg-white/10 border-l-2 border-l-indigo-500" : ""
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {otherUser?.image ? (
                                        <img src={otherUser.image} alt={otherUser.name || "User"} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-indigo-300 font-bold">{otherUser?.name?.[0] || "?"}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={`font-medium truncate ${isActive ? "text-white" : "text-gray-300"}`}>
                                            {otherUser?.name || "User"}
                                        </span>
                                        {lastMessage && (
                                            <span className="text-xs text-gray-600">
                                                {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true, locale: pl })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        {lastMessage ? (lastMessage.body || (lastMessage.image ? "📷 Sent an image" : "")) : "Start a conversation"}
                                    </p>
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
