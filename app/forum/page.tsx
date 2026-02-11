"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface ForumPost {
    id: string
    title: string
    content: string
    createdAt: string
    author: {
        name: string | null
        email: string
    }
}

export default function ForumPage() {
    const { data: session } = useSession()
    const [posts, setPosts] = useState<ForumPost[]>([])
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [message, setMessage] = useState("")

    const fetchPosts = async () => {
        const res = await fetch("/api/forum")
        const data = await res.json()
        setPosts(data)
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage("")

        if (!session) {
            setMessage("You must be logged in to post.")
            return
        }

        try {
            const res = await fetch("/api/forum", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, content }),
            })

            if (res.ok) {
                setMessage("Post created successfully!")
                setTitle("")
                setContent("")
                fetchPosts()
            } else {
                setMessage("Failed to create post.")
            }
        } catch (error) {
            setMessage("An error occurred.")
        }
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black text-gray-100">
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>

            <div className="container mx-auto px-6 pt-32 pb-12 relative z-10">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                            Community Forum
                        </h1>
                        <p className="text-gray-400 mt-2">Join the discussion about TEB Edukacja</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Create Post Section */}
                    <div className="lg:col-span-1">
                        <div className="glass-panel p-6 rounded-2xl sticky top-32">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                                Start a Topic
                            </h2>

                            {session ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {message && (
                                        <div className={`p-3 rounded-lg text-sm ${message.includes("success") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                                            {message}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
                                            placeholder="What's on your mind?"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows={4}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition resize-none"
                                            placeholder="Share your thoughts..."
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20"
                                    >
                                        Post Topic
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 mb-6">You need to be logged in to create a post.</p>
                                    <Link href="/login" className="inline-block w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition border border-white/10">
                                        Login to Post
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Discussions List */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-200 mb-6">Recent Discussions</h2>

                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div key={post.id} className="glass-panel p-6 rounded-2xl hover:bg-white/[0.04] transition group">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-gray-100 group-hover:text-indigo-400 transition">{post.title}</h3>
                                        <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 leading-relaxed mb-6">{post.content}</p>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 border-t border-white/5 pt-4">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] text-white font-bold">
                                            {(post.author.name || post.author.email || "U")[0].toUpperCase()}
                                        </div>
                                        <span>Posted by <span className="text-gray-300">{post.author.name || post.author.email || "Unknown"}</span></span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="glass-panel p-12 rounded-2xl text-center">
                                <div className="text-6xl mb-4">💬</div>
                                <h3 className="text-xl font-bold text-white mb-2">No discussions yet</h3>
                                <p className="text-gray-400">Be the first to start a conversation!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
