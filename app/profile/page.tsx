import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Prisma } from "@prisma/client"
import { ProfileHeader } from "@/components/ProfileHeader"

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
        },
        itemsBought: {
            include: {
                seller: {
                    select: { name: true }
                }
            }
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
            },
            itemsBought: {
                include: {
                    seller: {
                        select: { name: true }
                    }
                },
                orderBy: { updatedAt: 'desc' }
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
                <ProfileHeader user={user} />

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

                {/* Inventory Section */}
                <div className="glass-panel p-8 rounded-3xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-2 h-8 bg-emerald-500 rounded-full inline-block"></span>
                        Ekwipunek
                    </h2>

                    {user.itemsBought.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {user.itemsBought.map(item => (
                                <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-2">
                                    {item.imageUrl && (
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                                    )}
                                    <h3 className="font-bold text-lg text-white">{item.title}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                                    <div className="mt-auto pt-2 flex justify-between items-center text-sm">
                                        <span className="text-emerald-400 font-bold">{item.price} TebCoins</span>
                                        <span className="text-gray-500">
                                            Seller: {item.seller.name || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-center py-6">Your inventory is empty.</p>
                    )}
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
