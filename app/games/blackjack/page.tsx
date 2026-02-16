"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateHandValue } from "@/lib/blackjack";
import { motion, AnimatePresence } from "framer-motion";
import { PlayingCard, CardSuit } from "@/components/ui/playing-card";
import { cn } from "@/lib/utils";
import { ChevronLeft, Coins, RotateCcw, Shield, TriangleAlert } from "lucide-react";

type Card = {
    suit: CardSuit;
    value: string;
    numericValue: number;
    hidden?: boolean;
};

type GameState = "betting" | "playing" | "dealerTurn" | "finished";

export default function BlackjackPage() {
    const router = useRouter();
    const [gameState, setGameState] = useState<GameState>("betting");
    const [balance, setBalance] = useState<number | null>(null);
    const [bet, setBet] = useState(10);
    const [customBet, setCustomBet] = useState("10"); // String for input handling

    // Server state (the "truth")
    const [serverPlayerHand, setServerPlayerHand] = useState<Card[]>([]);
    const [serverDealerHand, setServerDealerHand] = useState<Card[]>([]);

    // Display state (for animation)
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [winAmount, setWinAmount] = useState<number | null>(null);

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

    // Sync customBet input with bet state, but allow typing
    useEffect(() => {
        const val = parseInt(customBet);
        if (!isNaN(val)) {
            setBet(val);
        }
    }, [customBet]);

    // Effect to handle sequential dealing animation
    useEffect(() => {
        if (serverPlayerHand.length > playerHand.length || serverDealerHand.length > dealerHand.length) {
            const timeout = setTimeout(() => {
                if (serverPlayerHand.length > playerHand.length) {
                    setPlayerHand([...playerHand, serverPlayerHand[playerHand.length]]);
                } else if (serverDealerHand.length > dealerHand.length) {
                    setDealerHand([...dealerHand, serverDealerHand[dealerHand.length]]);
                }
            }, 400);
            return () => clearTimeout(timeout);
        }
    }, [serverPlayerHand, serverDealerHand, playerHand, dealerHand]);


    const handleDeal = async () => {
        if (balance === null) return;
        const betAmount = parseInt(customBet);

        if (isNaN(betAmount) || betAmount <= 0) {
            setMessage("Nieprawidłowa stawka!");
            return;
        }

        if (betAmount > balance) {
            setMessage("Brak wystarczających środków!");
            return;
        }

        setLoading(true);
        setMessage("");
        setWinAmount(null);

        // Reset hands
        setPlayerHand([]);
        setDealerHand([]);
        setServerPlayerHand([]);
        setServerDealerHand([]);

        try {
            const res = await fetch("/api/games/blackjack/deal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bet: betAmount }),
            });

            const data = await res.json();

            if (res.ok) {
                setServerPlayerHand(data.playerHand);
                setServerDealerHand(data.dealerHand);
                setBalance(data.newBalance);
                setGameState(data.gameState);
                if (data.message) setMessage(data.message);
            } else {
                setMessage(data.error || "Coś poszło nie tak.");
            }
        } catch (error) {
            setMessage("Błąd połączenia.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: "hit" | "stand" | "double") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/games/blackjack/${action}`, {
                method: "POST",
            });

            const data = await res.json();

            if (res.ok) {
                setServerPlayerHand(data.playerHand);
                setServerDealerHand(data.dealerHand);
                setGameState(data.gameState);

                if (data.newBalance !== undefined) {
                    const diff = data.newBalance - (balance || 0);
                    if (diff > 0) setWinAmount(diff);
                    setBalance(data.newBalance);
                }

                if (data.message) setMessage(data.message);
            } else {
                setMessage(data.error || "Błąd akcji.");
            }
        } catch (e) {
            setMessage("Błąd gry.");
        } finally {
            setLoading(false);
        }
    };

    const playerScore = calculateHandValue(playerHand);
    const dealerScore = calculateHandValue(dealerHand);

    // Dealing state check
    const isDealing = playerHand.length < serverPlayerHand.length || dealerHand.length < serverDealerHand.length;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0f172a] text-white flex flex-col items-center relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-10 pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 to-[#0f172a] pointer-events-none"></div>

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
                        {balance !== null ? balance.toLocaleString() : "..."} TC
                    </span>
                </div>
            </div>

            {/* Game Table */}
            <div className="relative w-full max-w-5xl aspect-[16/9] min-h-[600px] bg-[#1a4731] rounded-[3rem] border-[16px] border-[#2d2116] shadow-2xl flex flex-col items-center justify-between p-8 overflow-hidden z-20">

                {/* Table Felt Texture & Vignette */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] opacity-40 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>

                {/* Dealer Area */}
                <div className="flex flex-col items-center z-30 w-full mt-8">
                    <div className="bg-black/20 px-4 py-1 rounded-full mb-4 border border-white/5 backdrop-blur-sm">
                        <span className="text-emerald-100/70 text-xs font-bold tracking-widest uppercase">Krupier</span>
                    </div>
                    <div className="flex justify-center -space-x-12 h-[160px] min-w-[120px]">
                        <AnimatePresence>
                            {dealerHand.map((card, i) => (
                                <PlayingCard
                                    key={`${i}-${card.suit}-${card.value}`}
                                    index={i}
                                    suit={card.suit}
                                    value={card.value}
                                    hidden={card.hidden}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                    {dealerHand.length > 0 && (
                        <div className="mt-2 bg-black/60 px-3 py-1 rounded-lg border border-white/10 text-white font-mono text-sm">
                            {dealerHand.some(c => c.hidden) ? "?" : dealerScore}
                        </div>
                    )}
                </div>

                {/* Center / Message Area */}
                <div className="flex-1 flex items-center justify-center w-full z-40 my-4 relative">
                    <AnimatePresence mode="wait">
                        {message && (
                            <motion.div
                                key="message-box"
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                className="px-8 py-4 bg-black/80 rounded-2xl border border-white/20 text-white font-bold text-lg shadow-2xl backdrop-blur-md max-w-md text-center"
                            >
                                {message}
                            </motion.div>
                        )}
                        {/* Win Overlay */}
                        {winAmount !== null && winAmount > 0 && gameState === 'finished' && (
                            <motion.div
                                key="win-overlay"
                                initial={{ scale: 0, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-5xl font-black px-12 py-6 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.5)] border-4 border-yellow-200 transform -rotate-3 mb-12">
                                    +{winAmount} TC
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Player Area */}
                <div className="flex flex-col items-center z-30 w-full mb-8">
                    {playerHand.length > 0 && (
                        <div className="mb-2 bg-black/60 px-3 py-1 rounded-lg border border-white/10 text-white font-mono text-sm">
                            {playerScore}
                        </div>
                    )}
                    <div className="flex justify-center -space-x-12 h-[160px] min-w-[120px] mb-8">
                        <AnimatePresence>
                            {playerHand.map((card, i) => (
                                <PlayingCard
                                    key={`${i}-${card.suit}-${card.value}`}
                                    index={i}
                                    suit={card.suit}
                                    value={card.value}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="bg-black/20 px-4 py-1 rounded-full mb-6 border border-white/5 backdrop-blur-sm">
                        <span className="text-indigo-200/70 text-xs font-bold tracking-widest uppercase">Gracz</span>
                    </div>

                    {/* Controls */}
                    <div className="h-24 flex items-end">
                        <AnimatePresence mode="wait">
                            {gameState === "betting" ? (
                                <motion.div
                                    key="betting-controls"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <div className="flex items-center gap-4 bg-black/50 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
                                        <button onClick={() => setCustomBet(Math.max(10, parseInt(customBet) - 10).toString())} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition border border-white/5">-</button>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={customBet}
                                                onChange={(e) => setCustomBet(e.target.value)}
                                                className="w-24 bg-transparent text-center text-2xl font-bold text-yellow-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-bold tracking-wider">STAWKA</span>
                                        </div>
                                        <button onClick={() => setCustomBet((parseInt(customBet) + 10).toString())} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition border border-white/5">+</button>
                                    </div>
                                    <button
                                        onClick={handleDeal}
                                        disabled={loading || balance === null || parseInt(customBet) > (balance ?? 0)}
                                        className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {loading ? "Rozdawanie..." : "ROZDAJ"}
                                    </button>
                                </motion.div>
                            ) : gameState === "finished" && !isDealing ? (
                                <motion.button
                                    key="replay-btn"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => {
                                        setGameState("betting");
                                        setPlayerHand([]);
                                        setDealerHand([]);
                                        setServerPlayerHand([]);
                                        setServerDealerHand([]);
                                        setMessage("");
                                        setWinAmount(null);
                                    }}
                                    className="px-10 py-3 bg-white text-black hover:bg-gray-100 rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    Zagraj ponownie
                                </motion.button>
                            ) : !isDealing && (
                                <motion.div
                                    key="game-controls"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-4"
                                >
                                    <button
                                        onClick={() => handleAction("hit")}
                                        disabled={loading}
                                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex flex-col items-center leading-none gap-1"
                                    >
                                        <span>DOBIERZ</span>
                                        <span className="text-[10px] opacity-70 font-normal">HIT</span>
                                    </button>
                                    <button
                                        onClick={() => handleAction("stand")}
                                        disabled={loading}
                                        className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold shadow-lg shadow-red-500/20 transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex flex-col items-center leading-none gap-1"
                                    >
                                        <span>CZEKAJ</span>
                                        <span className="text-[10px] opacity-70 font-normal">STAND</span>
                                    </button>
                                    {playerHand.length === 2 && balance && balance >= bet && (
                                        <button
                                            onClick={() => handleAction("double")}
                                            disabled={loading}
                                            className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-bold shadow-lg shadow-yellow-500/20 transition hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 flex flex-col items-center leading-none gap-1"
                                        >
                                            <span>PODWÓJ</span>
                                            <span className="text-[10px] opacity-70 font-normal">DOUBLE</span>
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
