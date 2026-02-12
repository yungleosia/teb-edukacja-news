"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export function Navbar() {
    const { data: session } = useSession()
    const [activeUsers, setActiveUsers] = useState(0)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [userAvatar, setUserAvatar] = useState<string | null>(null)

    // Fetch user avatar
    useEffect(() => {
        if (!session) return

        const fetchAvatar = async () => {
            try {
                const res = await fetch("/api/user/me")
                if (res.ok) {
                    const data = await res.json()
                    setUserAvatar(data.image)
                }
            } catch (error) {
                console.error("Failed to fetch avatar", error)
            }
        }

        fetchAvatar()

        const handleAvatarUpdate = () => {
            fetchAvatar()
        }

        window.addEventListener("avatar-updated", handleAvatarUpdate)
        return () => window.removeEventListener("avatar-updated", handleAvatarUpdate)
    }, [session])

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Heartbeat logic
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

        fetchHeartbeat()
        const interval = setInterval(fetchHeartbeat, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 top-0 left-0 glass-nav py-4 ${isScrolled ? "bg-[#0f172a]/80" : "bg-[#0f172a]/40"}`}>
            <div className="container mx-auto px-6 flex justify-between items-center relative">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition z-20">
                    <span className="text-gradient">TEB</span> News
                </Link>

                {/* Active Users - Desktop: Centered, Mobile: Hidden */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
                    <div className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeUsers > 0 ? "bg-green-400" : "bg-red-500"} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${activeUsers > 0 ? "bg-green-500" : "bg-red-600"}`}></span>
                    </div>
                    <span className={`text-xs font-mono font-bold tracking-wider ${activeUsers > 0 ? "text-green-400" : "text-red-500"}`}>
                        {activeUsers} ONLINE
                    </span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-8 items-center z-20">
                    <Link href="/forum" className="text-sm font-medium text-gray-300 hover:text-white transition tracking-wide uppercase hover:underline underline-offset-4 decoration-indigo-500">
                        Forum
                    </Link>
                    <Link href="/marketplace" className="text-sm font-medium text-gray-300 hover:text-white transition tracking-wide uppercase hover:underline underline-offset-4 decoration-indigo-500">
                        Giełda
                    </Link>
                    <Link href="/daily" className="text-sm font-bold text-yellow-500 hover:text-yellow-400 transition tracking-wide uppercase hover:underline underline-offset-4 decoration-yellow-500 flex items-center gap-1">
                        🎁 Daily
                    </Link>
                    {session?.user?.role === "ADMIN" && (
                        <Link href="/admin" className="text-sm font-medium text-orange-400 hover:text-orange-300 transition tracking-wide uppercase">
                            Admin
                        </Link>
                    )}
                    {session ? (
                        <Link href="/profile" className="flex items-center gap-3 pl-4 border-l border-white/10 hover:opacity-80 transition group">
                            <div className="flex flex-col text-right">
                                <span className="text-xs text-gray-400 group-hover:text-indigo-400 transition">Welcome,</span>
                                <span className="text-sm font-bold text-white leading-none">{session.user?.name}</span>
                                <div className="flex items-center justify-end gap-1 mt-1 text-xs font-medium text-yellow-500">
                                    <span>{session.user?.tebCoins}</span>
                                    <span className="text-[10px] uppercase">Coins</span>
                                </div>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold ring-2 ring-white/10 shadow-lg shadow-indigo-500/20 group-hover:ring-indigo-500/50 transition overflow-hidden">
                                {userAvatar ? (
                                    <img src={userAvatar} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    session.user?.name?.[0] || "U"
                                )}
                            </div>
                        </Link>
                    ) : (
                        <Link href="/login" className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition backdrop-blur-sm hover:scale-105 active:scale-95">
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden z-20 text-white p-2"
                >
                    {isMobileMenuOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-0 left-0 w-full h-screen bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center space-y-8 z-10 animate-in fade-in duration-200">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold mb-4">
                        <span className="text-gradient">TEB</span> News
                    </Link>

                    <Link href="/forum" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-gray-300 hover:text-white">
                        Forum
                    </Link>

                    <Link href="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-gray-300 hover:text-white">
                        Giełda
                    </Link>

                    <Link href="/daily" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-yellow-500 hover:text-yellow-400 flex items-center gap-2">
                        🎁 Daily Drop
                    </Link>

                    {session?.user?.role === "ADMIN" && (
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-orange-400">
                            Admin Dashboard
                        </Link>
                    )}

                    {session ? (
                        <Link href="/profile" className="flex flex-col items-center gap-4 mt-8 pt-8 border-t border-white/10 w-48 hover:opacity-80 transition" onClick={() => setIsMobileMenuOpen(false)}>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-bold overflow-hidden">
                                {userAvatar ? (
                                    <img src={userAvatar} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                                ) : (
                                    session.user?.name?.[0] || "U"
                                )}
                            </div>
                            <span className="text-lg font-bold">{session.user?.name}</span>
                        </Link>
                    ) : (
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-8 py-3 rounded-full bg-indigo-600 text-white font-bold">
                            Login
                        </Link>
                    )}
                </div>
            )}
        </nav>
    )
}
