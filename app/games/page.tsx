import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function GamesPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 bg-[#0f172a] text-white overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400">
                            ARCADE
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        Witaj w strefie gier. Postaw swoje <span className="text-yellow-500 font-bold">TebCoins</span> i sprawdź swoje szczęście.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Blackjack Card */}
                    <Link href="/games/blackjack" className="group relative block h-96 rounded-3xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10"></div>

                        {/* Image Placeholder or CSS Art */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-110 transition duration-700 opacity-60 group-hover:opacity-80"></div>

                        <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                            <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold mb-3 backdrop-blur-md">
                                POPULARNE
                            </div>
                            <h2 className="text-3xl font-bold mb-2 group-hover:text-purple-400 transition">Blackjack</h2>
                            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                Klasyczna gra karciana. Pokonaj krupiera uzyskując 21 punktów.
                            </p>
                            <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm">
                                <span>GRAJ TERAZ</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </div>
                        </div>
                    </Link>

                    {/* Coming Soon Card */}
                    <div className="relative h-96 rounded-3xl overflow-hidden border border-white/5 bg-white/5 opacity-50 cursor-not-allowed grayscale hover:grayscale-0 transition duration-500">
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <span className="px-4 py-2 rounded-full bg-black/50 border border-white/10 text-gray-400 font-mono text-sm backdrop-blur-md">
                                COMING SOON
                            </span>
                        </div>
                        <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                            <h2 className="text-3xl font-bold mb-2 text-gray-600">Ruletka</h2>
                            <p className="text-gray-600 text-sm">Wkrótce...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
