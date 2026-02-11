import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Prisma } from "@prisma/client"

type UserWithRelations = Prisma.UserGetPayload<{
    include: {
        _count: {
            select: {
                posts: true,
                comments: true,
                likes: true,
            }
        },
        posts: {
            take: 5,
            orderBy: { createdAt: 'desc' }
        }
    }
}>

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        redirect("/login")
    }

    const user: UserWithRelations | null = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            _count: {
                select: {
                    posts: true,
                    comments: true,
                    likes: true, // Likes GIVEN
                }
            },
            posts: {
                take: 5,
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!user) {
        return <div>User not found</div>
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl ring-4 ring-white/10">
                        {user.name?.[0] || "U"}
                    </div>

                    <div className="text-center md:text-left space-y-2 z-10">
                        <h1 className="text-4xl font-bold text-white">{user.name}</h1>
                        <p className="text-gray-400 font-mono">{user.email}</p>
                        <div className="flex gap-2 justify-center md:justify-start mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === "ADMIN" ? "bg-red-500/20 text-red-400 border border-red-500/20" : "bg-blue-500/20 text-blue-400 border border-blue-500/20"}`}>
                                {user.role}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-xs border border-white/5">
                                Member since {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center card-hover">
                        <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-cyan-400 mb-2">
                            {user._count.posts}
                        </span>
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Forum Posts</span>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center card-hover">
                        <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-400 mb-2">
                            {user._count.comments}
                        </span>
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Comments</span>
                    </div>
                    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center card-hover">
                        <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-yellow-400 mb-2">
                            {user._count.likes}
                        </span>
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Likes Given</span>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-panel p-8 rounded-3xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-indigo-500 rounded-full inline-block"></span>
                        Recent Activity
                    </h2>

                    {user.posts.length > 0 ? (
                        <div className="space-y-4">
                            {user.posts.map(post => (
                                <Link href="/forum" key={post.id} className="block group">
                                    <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg group-hover:text-indigo-400 transition">{post.title}</h3>
                                            <p className="text-gray-400 text-sm line-clamp-1">{post.content}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono whitespace-nowrap ml-4">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p>No posts yet.</p>
                            <Link href="/forum" className="text-indigo-400 hover:text-indigo-300 underline mt-2 inline-block">
                                Start a discussion
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
