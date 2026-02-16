"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { calculateHandValue } from "@/lib/blackjack";

type Card = {
    suit: "hearts" | "diamonds" | "clubs" | "spades";
    value: string;
    numericValue: number;
    hidden?: boolean;
};

type GameState = "betting" | "playing" | "dealerTurn" | "finished";

export default function BlackjackPage() {
    const router = useRouter();
    const [gameState, setGameState] = useState<GameState>("betting");
    const [balance, setBalance] = useState<number | null>(null); // Fetched from API
    const [bet, setBet] = useState(10);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

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

    const handleDeal = async () => {
        if (balance === null) {
            setMessage("Ładowanie salda...");
            return;
        }

        if (bet > balance) {
            setMessage("Brak wystarczających środków!");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/games/blackjack/deal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bet }),
            });

            const data = await res.json();

            if (res.ok) {
                setPlayerHand(data.playerHand);
                setDealerHand(data.dealerHand);
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
                setPlayerHand(data.playerHand);
                setDealerHand(data.dealerHand);
                setGameState(data.gameState);
                if (data.newBalance !== undefined) setBalance(data.newBalance); // Only updated on finish
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

    // Render helper for cards
    const renderCard = (card: Card, index: number) => {
        // Animation delay based on index for "dealing" effect
        const animationStyle = {
            animationDelay: `${index * 150}ms`,
            animationFillMode: 'both'
        };

        if (card.hidden) {
            return (
                <div key={`hidden-${index}`} style={animationStyle} className="w-24 h-36 bg-indigo-900 rounded-xl border-2 border-indigo-400 flex items-center justify-center shadow-xl transform hover:-translate-y-2 transition duration-300 ml-[-40px] first:ml-0 relative overflow-hidden animate-in slide-in-from-top-10 fade-in duration-500">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                    <div className="text-4xl select-none">TEB</div>
                </div>
            );
        }

        const isRed = card.suit === "hearts" || card.suit === "diamonds";
        const suitIcon = {
            hearts: "♥",
            diamonds: "♦",
            clubs: "♣",
            spades: "♠"
        }[card.suit];

        return (
            <div key={`${card.value}-${card.suit}-${index}`} style={animationStyle} className={`w-24 h-36 bg-white rounded-xl flex flex-col items-center justify-between p-2 shadow-xl transform hover:-translate-y-2 transition duration-300 ml-[-40px] first:ml-0 animate-in slide-in-from-top-10 fade-in duration-500 ${isRed ? "text-red-600" : "text-black"}`}>
                <div className="self-start font-bold text-xl select-none">{card.value}</div>
                <div className="text-4xl select-none">{suitIcon}</div>
                <div className="self-end font-bold text-xl transform rotate-180 select-none">{card.value}</div>
            </div>
        );
    };

    const playerScore = calculateHandValue(playerHand);
    const dealerScore = calculateHandValue(dealerHand);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0f172a] text-white flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-4xl flex justify-between items-center mb-8 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
                <Link href="/games" className="text-gray-400 hover:text-white flex items-center gap-2 transition">
                    ← Powrót
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">Twoje saldo:</span>
                    <span className="text-yellow-500 font-bold text-xl">{balance !== null ? balance : "..."} TC</span>
                </div>
            </div>

            {/* Game Table */}
            <div className="relative w-full max-w-4xl min-h-[500px] bg-emerald-900/40 rounded-[3rem] border-8 border-emerald-900 shadow-2xl flex flex-col items-center justify-center p-8 overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-800/50 via-transparent to-transparent pointer-events-none"></div>

                {/* Dealer Area */}
                <div className="mb-12 flex flex-col items-center z-10 w-full">
                    <div className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-4 flex items-center gap-2">
                        Krupier
                        {dealerHand.length > 0 && (
                            <span className="bg-black/40 px-2 py-0.5 rounded text-white text-xs border border-white/10">
                                {dealerHand.some(c => c.hidden) ? "?" : dealerScore}
                            </span>
                        )}
                    </div>
                    <div className="flex justify-center pl-[40px] min-h-[144px]">
                        {dealerHand.map((card, i) => renderCard(card, i))}
                    </div>
                </div>

                {/* Message Center */}
                <div className="h-12 flex items-center justify-center z-10 my-4">
                    {message && (
                        <div className="px-6 py-2 bg-black/60 rounded-full border border-white/10 text-white font-bold animate-pulse">
                            {message}
                        </div>
                    )}
                </div>

                {/* Player Area */}
                <div className="flex flex-col items-center z-10 w-full">
                    <div className="text-indigo-400 font-bold tracking-widest uppercase text-sm mb-4 flex items-center gap-2">
                        Ty
                        {playerHand.length > 0 && (
                            <span className="bg-black/40 px-2 py-0.5 rounded text-white text-xs border border-white/10">
                                {playerScore}
                            </span>
                        )}
                    </div>
                    <div className="flex justify-center pl-[40px] mb-8 min-h-[144px]">
                        {playerHand.map((card, i) => renderCard(card, i))}
                    </div>

                    {/* Controls */}
                    {gameState === "betting" && (
                        <div className="flex flex-col items-center gap-6 animate-in slide-in-from-bottom-4 fade-in">
                            <div className="flex items-center gap-4 bg-black/30 p-2 rounded-xl">
                                <button onClick={() => setBet(Math.max(10, bet - 10))} className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition">-</button>
                                <span className="text-2xl font-bold w-20 text-center text-yellow-500">{bet}</span>
                                <button onClick={() => setBet(bet + 10)} className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition">+</button>
                            </div>
                            <button
                                onClick={handleDeal}
                                disabled={loading}
                                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Rozdawanie..." : "ROZDAJ"}
                            </button>
                        </div>
                    )}

                    {gameState === "playing" && (
                        <div className="flex gap-4 animate-in slide-in-from-bottom-4 fade-in">
                            <button
                                onClick={() => handleAction("hit")}
                                disabled={loading}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition hover:-translate-y-1 active:translate-y-0"
                            >
                                DOBIERZ
                            </button>
                            <button
                                onClick={() => handleAction("stand")}
                                disabled={loading}
                                className="px-8 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold shadow-lg shadow-red-500/20 transition hover:-translate-y-1 active:translate-y-0"
                            >
                                CZEKAJ
                            </button>
                            {playerHand.length === 2 && balance && balance >= bet && (
                                <button
                                    onClick={() => handleAction("double")}
                                    disabled={loading}
                                    className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-bold shadow-lg shadow-yellow-500/20 transition hover:-translate-y-1 active:translate-y-0"
                                >
                                    PODWÓJ
                                </button>
                            )}
                        </div>
                    )}

                    {gameState === "finished" && (
                        <button
                            onClick={() => {
                                setGameState("betting");
                                setPlayerHand([]);
                                setDealerHand([]);
                                setMessage("");
                            }}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition animate-bounce"
                        >
                            ZAGRAJ PONOWNIE
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
