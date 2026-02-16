"use client";

import { useState, useEffect } from "react";
import { Case, Skin } from "@prisma/client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Coins, Package, Shield, Swords } from "lucide-react";

type CaseWithSkins = Case & { skins: Skin[] };

export default function CasesPage() {
    const [cases, setCases] = useState<CaseWithSkins[]>([]);
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
        fetch("/api/cases").then(res => res.json()).then(setCases);
        fetch("/api/user/me").then(res => res.json()).then(data => setBalance(data.tebCoins));
    }, []);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0f172a] text-white flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-6xl flex justify-between items-center mb-12">
                <Link href="/games" className="text-gray-400 hover:text-white flex items-center gap-2 transition group">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
                    Powrót do gier
                </Link>
                <div className="flex items-center gap-6">
                    <Link href="/games/cases/inventory" className="text-indigo-400 hover:text-indigo-300 font-medium">
                        Twój Ekwipunek
                    </Link>
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        <span className="text-yellow-500 font-bold text-xl tabular-nums">
                            {typeof balance === 'number' ? balance.toLocaleString() : "..."} TC
                        </span>
                    </div>

                    <Link
                        href="/games/cases/battles"
                        className="group relative px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg hover:shadow-purple-500/30 hover:scale-105 transition-all flex items-center gap-2 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <Swords className="w-5 h-5" />
                        Stwórz Bitwę
                    </Link>
                </div>
            </div>

            <h1 className="text-4xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                CS2 Cases
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                {cases.map((csCase) => (
                    <Link href={`/games/cases/${csCase.id}`} key={csCase.id}>
                        <motion.div
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="bg-[#1e293b] rounded-3xl p-6 border border-white/5 hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-all flex flex-col items-center gap-4 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="w-48 h-48 relative z-10">
                                <img src={csCase.image} alt={csCase.name} className="w-full h-full object-contain drop-shadow-2xl" />
                            </div>

                            <div className="text-center z-10">
                                <h2 className="text-2xl font-bold text-gray-100 group-hover:text-yellow-400 transition-colors">{csCase.name}</h2>
                                <p className="text-green-400 font-bold mt-2 text-xl flex items-center justify-center gap-1">
                                    <Coins className="w-4 h-4" />
                                    {csCase.price} TC
                                </p>
                            </div>

                            <div className="w-full flex gap-2 overflow-x-auto pb-2 mt-4 opacity-50 group-hover:opacity-100 transition-opacity noscrollbar">
                                {csCase.skins.slice(0, 5).map(skin => (
                                    <div key={skin.id} className="w-12 h-12 flex-shrink-0 bg-black/40 rounded-lg p-1 border border-white/5" title={skin.name}>
                                        <img src={skin.image} className="w-full h-full object-contain" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
