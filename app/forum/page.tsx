"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Comment {
    id: string
    content: string
    createdAt: string
    author: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
}

interface Attachment {
    id: string
    name: string
    type: string
    size: number
}

interface ForumPost {
    id: string
    title: string
    content: string
    createdAt: string
    author: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
    _count: {
        comments: number
        likes: number
    }
    isLiked: boolean
    attachments: Attachment[]
}

interface FileData {
    name: string
    type: string
    size: number
    data: string // Base64
}

export default function ForumPage() {
    const { data: session } = useSession()
    const [posts, setPosts] = useState<ForumPost[]>([])
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [message, setMessage] = useState("")
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/forum")
            const data = await res.json()
            if (Array.isArray(data)) {
                setPosts(data)
            } else {
                setPosts([])
            }
        } catch (e) {
            console.error("Failed to fetch posts")
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        fetchPosts()
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)])
        }
    }

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data:image/...;base64, prefix to get raw base64
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    const prepareFiles = async (): Promise<FileData[]> => {
        if (selectedFiles.length === 0) return []

        setIsUploading(true)
        const filesData: FileData[] = []

        for (const file of selectedFiles) {
            try {
                const base64 = await convertToBase64(file);
                filesData.push({
                    name: file.name,
                    type: file.type || "application/octet-stream",
                    size: file.size,
                    data: base64
                })
            } catch (e) {
                console.error("Failed to process file", file.name)
            }
        }

        setIsUploading(false)
        return filesData
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage("")

        if (!session) {
            setMessage("You must be logged in to post.")
            return
        }

        try {
            const attachmentsData = await prepareFiles()

            const res = await fetch("/api/forum", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    content,
                    attachments: attachmentsData
                }),
            })

            if (res.ok) {
                setMessage("Post created successfully!")
                setTitle("")
                setContent("")
                setSelectedFiles([])
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Załączniki</label>
                                        <div className="flex flex-col gap-2">
                                            <label className="cursor-pointer bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white hover:bg-white/10 transition flex items-center justify-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                <span>Wybierz pliki</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                />
                                            </label>

                                            {selectedFiles.length > 0 && (
                                                <div className="space-y-2 mt-2">
                                                    {selectedFiles.map((file, i) => (
                                                        <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-sm">
                                                            <span className="truncate max-w-[200px] text-gray-300">{file.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(i)}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isUploading}
                                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUploading ? "Wysyłanie..." : "Opublikuj temat"}
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
                                <ForumPostCard key={post.id} post={post} />
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

function ForumPostCard({ post: initialPost }: { post: ForumPost }) {
    const { data: session } = useSession()
    const [post, setPost] = useState(initialPost)
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState<Comment[]>([])
    const [loadingComments, setLoadingComments] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [submittingComment, setSubmittingComment] = useState(false)

    const handleLike = async () => {
        if (!session) return;

        // Optimistic update
        const wasLiked = post.isLiked;
        setPost(prev => ({
            ...prev,
            isLiked: !prev.isLiked,
            _count: {
                ...prev._count,
                likes: prev.isLiked ? prev._count.likes - 1 : prev._count.likes + 1
            }
        }));

        try {
            const res = await fetch(`/api/forum/${post.id}/like`, { method: "POST" });
            if (!res.ok) {
                // Revert on failure
                setPost(prev => ({
                    ...prev,
                    isLiked: wasLiked,
                    _count: {
                        ...prev._count,
                        likes: wasLiked ? prev._count.likes + 1 : prev._count.likes - 1
                    }
                }));
            }
        } catch (e) {
            // Revert
            setPost(prev => ({
                ...prev,
                isLiked: wasLiked,
                _count: {
                    ...prev._count,
                    likes: wasLiked ? prev._count.likes + 1 : prev._count.likes - 1
                }
            }));
        }
    }

    const toggleComments = async () => {
        if (!showComments && comments.length === 0) {
            setLoadingComments(true);
            try {
                const res = await fetch(`/api/forum/${post.id}/comment`);
                const data = await res.json();
                setComments(data);
            } catch (e) {
                console.error("Failed to load comments");
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    }

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !session) return;

        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/forum/${post.id}/comment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                const addedComment = await res.json();
                setComments([...comments, addedComment]);
                setNewComment("");
                setPost(prev => ({
                    ...prev,
                    _count: { ...prev._count, comments: prev._count.comments + 1 }
                }));
            }
        } catch (e) {
            console.error("Failed to post comment");
        } finally {
            setSubmittingComment(false);
        }
    }

    return (
        <div className="glass-panel p-6 rounded-2xl hover:bg-white/[0.04] transition group">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-100 group-hover:text-indigo-400 transition">{post.title}</h3>
                <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">
                    {new Date(post.createdAt).toLocaleDateString()}
                </span>
            </div>

            <p className="text-gray-400 leading-relaxed mb-6 whitespace-pre-wrap">{post.content}</p>

            {post.attachments && post.attachments.length > 0 && (
                <div className="mb-6 grid grid-cols-2 gap-2">
                    {post.attachments.map((att, i) => (
                        <a
                            key={i}
                            href={`/api/file/${att.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={att.name}
                            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 transition group/file"
                        >
                            <div className="w-10 h-10 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-200 truncate group-hover/file:text-indigo-400 transition">{att.name}</p>
                                <p className="text-xs text-gray-500">{Math.round(att.size / 1024)} KB</p>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3 hover:text-indigo-400 transition group/author">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-[10px] text-white font-bold overflow-hidden ring-1 ring-white/10 group-hover/author:ring-indigo-500 transition">
                            {post.author.image ? (
                                <img src={post.author.image} alt={post.author.name || "User"} className="w-full h-full object-cover" />
                            ) : (
                                (post.author.name || post.author.email || "U")[0].toUpperCase()
                            )}
                        </div>
                        <span>Posted by <span className="text-gray-300 group-hover/author:text-indigo-400 transition">{post.author.name || post.author.email || "Unknown"}</span></span>
                    </Link>

                    {(session?.user?.id === post.author.id || session?.user?.role === "ADMIN") && (
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm("Czy na pewno chcesz usunąć ten (i tylko ten) post?")) return;
                                try {
                                    const res = await fetch(`/api/forum/${post.id}`, { method: "DELETE" });
                                    if (res.ok) window.location.reload();
                                } catch (err) { alert("Błąd usuwania"); }
                            }}
                            className="text-gray-600 hover:text-red-500 transition p-1 hover:bg-red-500/10 rounded ml-2"
                            title="Usuń post"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 text-sm transition ${post.isLiked ? "text-pink-500" : "text-gray-400 hover:text-pink-400"}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                        <span>{post._count?.likes || 0}</span>
                    </button>

                    <button
                        onClick={toggleComments}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-400 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>{post._count?.comments || 0}</span>
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-6 pt-6 border-t border-white/5 space-y-6 animate-in fade-in slide-in-from-top-2">
                    {comments.length > 0 && (
                        <div className="space-y-4">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex gap-3">
                                    <Link href={`/profile/${comment.author.id}`} className="flex-shrink-0 group/comment-author">
                                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-gray-300 overflow-hidden ring-1 ring-white/10 group-hover/comment-author:ring-indigo-500 transition">
                                            {comment.author.image ? (
                                                <img src={comment.author.image} alt={comment.author.name || "User"} className="w-full h-full object-cover" />
                                            ) : (
                                                (comment.author.name || comment.author.email || "U")[0].toUpperCase()
                                            )}
                                        </div>
                                    </Link>
                                    <div className="bg-white/5 rounded-lg rounded-tl-none p-3 text-sm flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <Link href={`/profile/${comment.author.id}`} className="font-semibold text-gray-300 text-xs hover:text-indigo-400 transition">
                                                {comment.author.name || "Unknown"}
                                            </Link>
                                            <span className="text-[10px] text-gray-600">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-400">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {loadingComments && <div className="text-center text-xs text-gray-500">Loading comments...</div>}
                    {!loadingComments && comments.length === 0 && <div className="text-center text-xs text-gray-500">No comments yet.</div>}

                    {session ? (
                        <form onSubmit={handleAddComment} className="flex gap-3 relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full bg-black/20 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition"
                                disabled={submittingComment}
                            />
                            <button
                                type="submit"
                                disabled={submittingComment || !newComment.trim()}
                                className="absolute right-1 top-1 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white disabled:opacity-50 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </form>
                    ) : (
                        <div className="text-center text-xs text-gray-600">Login to comment</div>
                    )}
                </div>
            )}
        </div>
    )
}
