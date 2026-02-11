"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface NewsItem {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    name: string | null
  }
}

export default function Home() {
  const { data: session } = useSession()
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    fetch("/api/news")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch news")
        }
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setNews(data)
        } else {
          console.error("Expected array but got:", data)
          setNews([])
        }
      })
      .catch((err) => {
        console.error(err)
        setNews([])
      })
  }, [])

  return (

    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none"></div>



      <main className="container mx-auto px-6 py-32 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-4">
            Future of <span className="text-gradient">Education</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Exclusive updates and insights from the TEB ecosystem.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 perspective-1000">
          {news.map((item) => (
            <div key={item.id} className="glass-panel p-8 rounded-2xl card-hover group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition group-hover:bg-indigo-500/20"></div>

              <div className="relative">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    News
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-300 transition">{item.title}</h2>
                <p className="text-gray-400 mb-6 leading-relaxed line-clamp-3 font-light text-sm">{item.content}</p>

                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[10px] text-gray-300 border border-white/10">
                    {item.author.name?.[0] || "?"}
                  </div>
                  <span className="text-xs text-gray-500 uppercase tracking-widest">{item.author.name || "Unknown"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {news.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-1 rounded-full bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-4">
              <span className="px-6 py-2 block text-gray-500 text-sm tracking-widest uppercase">No streams active</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
