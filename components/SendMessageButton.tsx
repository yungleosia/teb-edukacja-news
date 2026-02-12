
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SendMessageButtonProps {
    userId: string;
}

export function SendMessageButton({ userId }: SendMessageButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSendMessage = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/conversations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error("Failed to start conversation");
            }

            const conversation = await response.json();
            router.push(`/messages/${conversation.id}`);
        } catch (error) {
            console.error("Error starting conversation:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSendMessage}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? "Loading..." : "Send Message"}
        </button>
    );
}
