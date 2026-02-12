"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

interface User {
    id: string
    name: string
    email: string
    role: "USER" | "ADMIN"
    tebCoins: number
    lastIp?: string
}

interface NewsItem {
    id: string
    title: string
    content: string
    createdAt: string
}

export default function AdminDashboard() {
    const { data: session } = useSession()
    const [activeTab, setActiveTab] = useState<"news" | "users">("news")
    const [users, setUsers] = useState<User[]>([])
    const [news, setNews] = useState<NewsItem[]>([])
    const [newsTitle, setNewsTitle] = useState("")
    const [newsContent, setNewsContent] = useState("")
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (activeTab === "users") fetchUsers()
        if (activeTab === "news") fetchNews()
    }, [activeTab])

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users")
            const data = await res.json()
            setUsers(data)
        } catch (e) {
            console.error("Failed to fetch users")
        }
    }

    const fetchNews = async () => {
        try {
            const res = await fetch("/api/news")
            const data = await res.json()
            setNews(data)
        } catch (e) {
            console.error("Failed to fetch news")
        }
    }

    const handleCreateNews = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch("/api/news", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newsTitle, content: newsContent, isAdmin: true }), // Simple check, middleware handles real auth
            })
            if (res.ok) {
                setMessage("News created!")
                setNewsTitle("")
                setNewsContent("")
                fetchNews()
            } else {
                setMessage("Failed to create news")
            }
        } catch (e) {
            setMessage("Error creating news")
        }
    }

    const toggleRole = async (userId: string, currentRole: string) => {
        try {
            const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN"
            const res = await fetch(`/api/admin/users`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, role: newRole }),
            })
            if (res.ok) fetchUsers()
        } catch (e) {
            console.error("Failed to update user")
        }
    }

    const deleteNews = async (newsId: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/news?id=${newsId}`, { method: 'DELETE' })
            if (res.ok) fetchNews()
        } catch (e) { console.error(e) }
    }

    if (!session || session.user.role !== "ADMIN") {
        return <div className="p-10 text-center text-red-500">Access Denied</div>
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black text-gray-100 p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                        Admin Dashboard
                    </h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("news")}
                            className={`px-6 py-2 rounded-full transition ${activeTab === "news" ? "bg-red-500 text-white" : "bg-white/5 hover:bg-white/10"}`}
                        >
                            News Management
                        </button>
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`px-6 py-2 rounded-full transition ${activeTab === "users" ? "bg-red-500 text-white" : "bg-white/5 hover:bg-white/10"}`}
                        >
                            User Management
                        </button>
                    </div>
                </div>

                {/* NEWS TAB */}
                {activeTab === "news" && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <div className="glass-panel p-6 rounded-2xl">
                                <h2 className="text-xl font-bold mb-4">Post New Update</h2>
                                {message && <div className="mb-4 p-2 bg-white/10 rounded">{message}</div>}
                                <form onSubmit={handleCreateNews} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={newsTitle}
                                        onChange={e => setNewsTitle(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3"
                                        required
                                    />
                                    <textarea
                                        placeholder="Content"
                                        value={newsContent}
                                        onChange={e => setNewsContent(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 h-32"
                                        required
                                    />
                                    <button className="w-full bg-gradient-to-r from-red-600 to-orange-600 py-3 rounded-lg font-bold hover:opacity-90">
                                        Publish News
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-bold">Recent News</h2>
                            {news.map(item => (
                                <div key={item.id} className="glass-panel p-4 rounded-xl flex justify-between items-center group">
                                    <div>
                                        <h3 className="font-bold">{item.title}</h3>
                                        <p className="text-sm text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => deleteNews(item.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition">Delete</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === "users" && (
                    <div className="glass-panel p-6 rounded-2xl">
                        <h2 className="text-xl font-bold mb-6">User Database</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/10 text-gray-400">
                                    <tr>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <UserRow key={user.id} user={user} toggleRole={toggleRole} fetchUsers={fetchUsers} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function UserRow({ user, toggleRole, fetchUsers }: { user: User, toggleRole: (id: string, role: string) => void, fetchUsers: () => void }) {
    const [revealIp, setRevealIp] = useState(false);

    const handleAddCoins = async () => {
        const amountStr = prompt(`Ile monet dodać użytkownikowi ${user.name}? (Użyj minusa aby odjąć)`);
        if (!amountStr) return;
        const amount = parseInt(amountStr);
        if (isNaN(amount)) return alert("Nieprawidłowa kwota");

        try {
            const res = await fetch("/api/admin/coins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, amount })
            });
            if (res.ok) {
                fetchUsers();
                alert(`Pomyślnie dodano ${amount} monet.`);
            } else {
                alert("Błąd podczas dodawania monet.");
            }
        } catch (e) {
            alert("Błąd połączenia.");
        }
    };

    return (
        <tr className="border-b border-white/5 hover:bg-white/5 transition">
            <td className="p-3">
                <div className="font-bold">{user.name}</div>
                <div className="text-xs text-yellow-500 font-mono">{user.tebCoins ?? 0} Coins</div>
            </td>
            <td className="p-3">
                <div className="font-mono text-sm text-gray-400">{user.email}</div>
                {user.lastIp && (
                    <div
                        className="text-xs text-indigo-400 font-mono flex items-center gap-1 cursor-pointer select-none"
                        onClick={() => setRevealIp(!revealIp)}
                        title="Click to reveal/hide IP"
                    >
                        <span>IP:</span>
                        <span className={`transition-all duration-300 ${revealIp ? "blur-none" : "blur-sm bg-white/10 px-1 rounded"}`}>
                            {user.lastIp}
                        </span>
                    </div>
                )}
            </td>
            <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === "ADMIN" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>
                    {user.role}
                </span>
            </td>
            <td className="p-3 flex gap-2">
                <button
                    onClick={() => toggleRole(user.id, user.role)}
                    className="text-xs border border-white/10 px-2 py-1 rounded hover:bg-white/10 transition"
                >
                    {user.role === "ADMIN" ? "Demote" : "Promote"}
                </button>
                <button
                    onClick={handleAddCoins}
                    className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded hover:bg-yellow-500/30 transition"
                >
                    Add Coins
                </button>
            </td>
        </tr>
    )
}
