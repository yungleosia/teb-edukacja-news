"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

interface UserProps {
    name: string | null
    email: string | null
    image: string | null
    role: string
    createdAt: Date
}

export function ProfileHeader({ user }: { user: UserProps }) {
    const router = useRouter()
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click()
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 1024 * 1024) { // 1MB limit
            alert("Plik jest zbyt duży (max 1MB)")
            return
        }

        setIsUploading(true)

        // Convert to Base64
        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64String = reader.result as string

            try {
                const res = await fetch("/api/user/image", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: base64String }),
                })

                if (!res.ok) {
                    throw new Error("Failed to upload")
                }

                router.refresh()
            } catch (error) {
                console.error("Upload error:", error)
                alert("Wystąpił błąd podczas wysyłania zdjęcia.")
            } finally {
                setIsUploading(false)
            }
        }
        reader.readAsDataURL(file)
    }

    return (
        <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative group cursor-pointer" onClick={handleImageClick}>
                <div className={`w-32 h-32 rounded-full overflow-hidden flex items-center justify-center text-5xl font-bold text-white shadow-2xl ring-4 ring-white/10 group-hover:ring-indigo-500 transition-all ${isUploading ? 'opacity-50' : ''}`}>
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

                {/* Upload Overlay */}
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            <div className="text-center md:text-left space-y-2 z-10">
                <h1 className="text-4xl font-bold text-white">{user.name}</h1>
                <p className="text-gray-400 font-mono transition-all duration-300 blur-sm hover:blur-none select-all">
                    {user.email}
                </p>
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
