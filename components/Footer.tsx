"use client";

import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();

    // Hide footer on messages pages
    if (pathname?.startsWith("/messages")) {
        return null;
    }

    return (
        <footer className="relative mt-20 border-t border-white/5 bg-black/40 backdrop-blur-lg">
            {/* Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

            <div className="container mx-auto px-6 py-12">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-2xl font-bold tracking-tighter mb-4">
                            <span className="text-gradient">TEB</span> News
                        </h2>
                        <p className="text-gray-400 max-w-sm">
                            Platforma społecznościowa dla uczniów TEB Edukacja.
                            Dziel się wiedzą, dyskutuj i bądź na bieżąco.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4 text-white">Nawigacja</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="/" className="hover:text-indigo-400 transition">Strona Główna</a></li>
                            <li><a href="/forum" className="hover:text-indigo-400 transition">Forum</a></li>
                            <li><a href="/login" className="hover:text-indigo-400 transition">Logowanie</a></li>
                            <li><a href="/register" className="hover:text-indigo-400 transition">Rejestracja</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4 text-white">Kontakt</h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-indigo-400 transition">Pomoc</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition">Regulamin</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition">Polityka Prywatności</a></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} TEB News. Wszystkie prawa zastrzeżone.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        {/* Placeholder Social Icons */}
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-600 transition cursor-pointer">
                            FB
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-pink-600 transition cursor-pointer">
                            IG
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-500 transition cursor-pointer">
                            TW
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
