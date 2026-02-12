"use client";

import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export function Heartbeat() {
    useEffect(() => {
        const sendHeartbeat = async () => {
            let visitorId = localStorage.getItem("visitorId");
            if (!visitorId) {
                visitorId = uuidv4();
                localStorage.setItem("visitorId", visitorId);
            }

            try {
                await fetch("/api/visitor/heartbeat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ visitorId }),
                });
            } catch (error) {
                console.error("Heartbeat error:", error);
            }
        };

        // Send immediately on mount
        sendHeartbeat();

        // Then every 60 seconds
        const interval = setInterval(sendHeartbeat, 60000);

        return () => clearInterval(interval);
    }, []);

    return null;
}
