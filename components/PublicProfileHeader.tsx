
interface UserProps {
    name: string | null
    email: string | null
    image: string | null
    role: string
    createdAt: Date
}

export function PublicProfileHeader({ user }: { user: UserProps }) {
    return (
        <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative group">
                <div className={`w-32 h-32 rounded-full overflow-hidden flex items-center justify-center text-5xl font-bold text-white shadow-2xl ring-4 ring-white/10`}>
                    {user.image ? (
                        <img
                            src={user.image}
                            alt={user.name || "User"}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
                            {user.name?.[0] || "U"}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center md:text-left space-y-2 z-10 flex-1">
                <h1 className="text-4xl font-bold text-white">{user.name}</h1>
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
    )
}
