"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { ChevronLeft, Coins, RotateCcw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// Symbols: 
// 💰 (Money Bag) - High Value
// 💎 (Diamond) - Mid Value
// 🍇 (Grapes) - Low Value
// 🍋 (Lemon) - Low Value
// 🍒 (Cherry) - Low Value
// 🔔 (Bell) - Bonus

const SYMBOLS = ["💰", "💎", "🍇", "🍋", "🍒", "🔔"];

export default function LeTebSlotsPage() {
    const [balance, setBalance] = useState<number | null>(null);
    const [bet, setBet] = useState(10);
    const [spinning, setSpinning] = useState(false);
    const [reels, setReels] = useState<string[][]>([
        ["?", "?", "?"],
        ["?", "?", "?"],
        ["?", "?", "?"],
        ["?", "?", "?"],
        ["?", "?", "?"]
    ]);
    const [winAmount, setWinAmount] = useState<number | null>(null);
    const [message, setMessage] = useState("");

    // Initial fetch of balance
    const fetchBalance = async () => {
        try {
            const res = await fetch("/api/user/me");
            if (res.ok) {
                const data = await res.json();
                setBalance(data.tebCoins);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchBalance();
    }, []);

    const spin = async () => {
        if (balance === null || balance < bet) return;
        setSpinning(true);
        setWinAmount(null);
        setMessage("");
        setBalance(balance - bet); // Optimistic update

        // Simulate API call for now (will implement backend next)
        // await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const res = await fetch("/api/games/le-teb/spin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bet }),
            });

            const data = await res.json();

            if (res.ok) {
                // Determine result from API
                // For animation, we can spin reels
                setReels(data.reels); // Assuming API returns 5x3 grid
                setBalance(data.newBalance);
                if (data.winAmount > 0) {
                    setWinAmount(data.winAmount);
                    setMessage(`Wygrałeś ${data.winAmount} TC!`);
                } else {
                    setMessage("Spróbuj ponownie!");
                }
            } else {
                setMessage("Błąd gry.");
                setBalance(balance); // Revert
            }

        } catch (e) {
            setMessage("Błąd połączenia.");
            setBalance(balance);
        } finally {
            setSpinning(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#1e1b4b] text-white flex flex-col items-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }}></div>
            </div>

            {/* Header */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-8 bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md z-10">
                <Link href="/games" className="text-gray-400 hover:text-white flex items-center gap-2 transition group">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
                    Powrót
                </Link>
                <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-white/5">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="text-gray-400 text-sm font-medium">Saldo:</span>
                    <span className="text-yellow-500 font-bold text-xl tabular-nums tracking-wide">
                        {typeof balance === 'number' ? balance.toLocaleString() : "..."} TC
                    </span>
                </div>
            </div>

            {/* Slot Machine Display */}
            <div className="relative w-full max-w-4xl bg-gradient-to-b from-slate-800 to-slate-900 rounded-[3rem] p-8 border-8 border-slate-700 shadow-2xl z-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-8 py-2 rounded-full border-4 border-slate-700 shadow-xl z-30">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent transform -rotate-2">
                        LE TEB
                    </h1>
                </div>

                {/* Reels Info */}
                <div className="bg-black/50 rounded-3xl p-6 border border-white/10 shadow-inner relative overflow-hidden">
                    <div className="grid grid-cols-5 gap-2 md:gap-4 relative z-10">
                        {reels.map((col, colIndex) => (
                            <div key={colIndex} className="flex flex-col gap-2 md:gap-4">
                                {col.map((symbol, rowIndex) => (
                                    <div key={`${colIndex}-${rowIndex}`} className="aspect-square bg-slate-800 rounded-xl flex items-center justify-center text-4xl md:text-6xl border border-white/5 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                                        <motion.div
                                            key={spinning ? `spin-${symbol}` : symbol}
                                            initial={spinning ? { y: -100, opacity: 0, filter: "blur(10px)" } : { y: 0, opacity: 1, filter: "blur(0px)" }}
                                            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                                            transition={{ duration: 0.3, delay: colIndex * 0.1 + rowIndex * 0.05 }}
                                        >
                                            {symbol}
                                        </motion.div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Win Line Overlay (Example) */}
                    <AnimatePresence>
                        {winAmount !== null && winAmount > 0 && (
                            <motion.div
                                key="win-overlay"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 rounded-3xl"
                            >
                                <div className="text-center">
                                    <div className="text-yellow-400 font-black text-6xl drop-shadow-[0_0_20px_rgba(250,204,21,0.5)] animate-bounce">
                                        BIG WIN!
                                    </div>
                                    <div className="text-white font-bold text-3xl mt-4">
                                        +{winAmount} TC
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                        <button onClick={() => setBet(Math.max(10, bet - 10))} disabled={spinning} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-xl transition disabled:opacity-50">-</button>
                        <div className="text-center w-24">
                            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Stawka</div>
                            <div className="text-2xl font-bold text-yellow-500">{bet}</div>
                        </div>
                        <button onClick={() => setBet(bet + 10)} disabled={spinning} className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold text-xl transition disabled:opacity-50">+</button>
                    </div>

                    <button
                        onClick={spin}
                        disabled={spinning || (balance !== null && balance < bet)}
                        className="flex-1 w-full max-w-sm py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-2xl font-black text-2xl shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:shadow-[0_0_50px_rgba(234,88,12,0.6)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
                        {spinning ? "KRECENIE..." : "SPIN"}
                    </button>

                    <div className="flex items-center gap-2">
                        <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition border border-white/5" title="Auto Spin (Wkrótce)">
                            <RotateCcw className="w-6 h-6 text-gray-400" />
                        </button>
                        <button className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition border border-white/5" title="Turbo (Wkrótce)">
                            <Zap className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
