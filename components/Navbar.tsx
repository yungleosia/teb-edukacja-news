"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export function Navbar() {
    const { data: session } = useSession()
    const [activeUsers, setActiveUsers] = useState(0)

    useEffect(() => {
        // Generate or get visitor ID
        let visitorId = localStorage.getItem("visitorId")
        if (!visitorId) {
            visitorId = Math.random().toString(36).substring(2) + Date.now().toString(36)
            localStorage.setItem("visitorId", visitorId)
        }

        const fetchHeartbeat = async () => {
            try {
                const res = await fetch("/api/visitor/heartbeat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ visitorId }),
                })
                if (res.ok) {
                    const data = await res.json()
                    setActiveUsers(data.count)
                }
            } catch (e) {
                console.error("Heartbeat error", e)
            }
        }

        // Initial fetch
        fetchHeartbeat()

        // Poll every 30 seconds
        const interval = setInterval(fetchHeartbeat, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <nav className="glass-nav fixed w-full z-50 transition-all duration-300 top-0 left-0">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center relative">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition z-10">
                    <span className="text-gradient">TEB</span> News
                </Link>

                {/* Active Users - Centered */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                    <div className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeUsers > 0 ? "bg-green-400" : "bg-red-500"} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${activeUsers > 0 ? "bg-green-500" : "bg-red-600"}`}></span>
                    </div>
                    <span className={`text-xs font-mono font-bold tracking-wider ${activeUsers > 0 ? "text-green-400" : "text-red-500"}`}>
                        {activeUsers} ONLINE
                    </span>
                </div>

                {/* Navigation Links */}
                <div className="space-x-8 flex items-center z-10">
                    <Link href="/forum" className="text-sm font-medium text-gray-300 hover:text-white transition tracking-wide uppercase">
                        Forum
                    </Link>
                    {session?.user?.role === "ADMIN" && (
                        <Link href="/admin" className="text-sm font-medium text-gray-300 hover:text-white transition tracking-wide uppercase">
                            Admin
                        </Link>
                    )}
                    {session ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-white/10">
                                {session.user?.name?.[0] || "U"}
                            </div>
                        </div>
                    ) : (
                        <Link href="/login" className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition backdrop-blur-sm">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
