
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistance, addHours } from "date-fns";
import { pl } from "date-fns/locale";

export default function DailyDropPage() {
    const [loading, setLoading] = useState(true);
    const [canClaim, setCanClaim] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [reward, setReward] = useState<{ type: string; amount: number; message: string } | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResult, setSpinResult] = useState<any[]>([]); // Items for the spinner
    const [showRewardModal, setShowRewardModal] = useState(false);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await fetch("/api/daily");
            if (res.ok) {
                const data = await res.json();
                setCanClaim(data.canClaim);
                setTimeRemaining(data.timeRemaining);
            }
        } catch (error) {
            console.error("Failed to check daily status", error);
        } finally {
            setLoading(false);
        }
    };

    const generateSpinnerItems = (winningItem: { type: string; amount: number; message: string }) => {
        const items = [];
        const possibleItems = [
            { type: "COINS", amount: 10, color: "bg-blue-500", label: "10 Coins" },
            { type: "COINS", amount: 50, color: "bg-purple-500", label: "50 Coins" },
            { type: "COINS", amount: 100, color: "bg-yellow-500", label: "100 Coins" },
            { type: "ITEM", amount: 1, color: "bg-red-600", label: "Legendary" },
            { type: "COINS", amount: 5, color: "bg-gray-500", label: "5 Coins" },
        ];

        // Generate 50 random items
        for (let i = 0; i < 50; i++) {
            items.push(possibleItems[Math.floor(Math.random() * possibleItems.length)]);
        }

        // Place winning item at index 40 (fixed position for animation target)
        const winner = winningItem.type === "COINS"
            ? possibleItems.find(i => i.amount === winningItem.amount && i.type === "COINS")
            : possibleItems.find(i => i.type === "ITEM");

        if (winner) {
            items[40] = winner;
        } else {
            // Fallback if specific winner config not found (should usually match)
            items[40] = { type: winningItem.type, amount: winningItem.amount, color: "bg-green-500", label: winningItem.message };
        }

        return items;
    };

    const handleClaim = async () => {
        if (!canClaim || isSpinning) return;
        setLoading(true);

        try {
            const res = await fetch("/api/daily", { method: "POST" });
            const data = await res.json();

            if (res.ok) {
                const items = generateSpinnerItems(data.reward);
                setSpinResult(items);
                setReward(data.reward);
                setCanClaim(false);
                setLoading(false);
                setIsSpinning(true);

                // Animation timing
                setTimeout(() => {
                    setIsSpinning(false);
                    setShowRewardModal(true);
                    setTimeRemaining(24 * 60 * 60 * 1000);
                }, 6000); // 6 seconds spin (5s animation + 1s buffer)
            } else {
                alert(data.error);
                setLoading(false);
            }
        } catch (error) {
            alert("Błąd połączenia");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-10 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-[#0f172a] border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>

                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Daily Drop 🎁</h1>
                <p className="text-gray-400 mb-8">Odbierz swoją codzienną nagrodę!</p>

                {isSpinning ? (
                    <div className="relative w-full overflow-hidden h-40 bg-black/50 rounded-xl mb-8 border-y-4 border-yellow-500/20">
                        {/* Center Marker */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-500 z-20 transform -translate-x-1/2 shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>

                        {/* Spinner Tape */}
                        <div className="flex items-center h-full absolute left-1/2"
                            style={{
                                transform: `translateX(-${(40 * 128) + 64}px)`, // 40 items * 128px width + half item offest
                                transition: "transform 5s cubic-bezier(0.1, 0, 0.2, 1)"
                            }}>
                            {spinResult.map((item, index) => (
                                <div key={index} className="w-32 flex-shrink-0 p-2 flex flex-col items-center justify-center">
                                    <div className={`w-24 h-24 rounded-lg ${item.color} flex items-center justify-center shadow-lg border-2 border-white/10`}>
                                        <span className="text-xs font-bold text-white shadow-black drop-shadow-md">{item.label}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : showRewardModal ? (
                    <div className="animate-in zoom-in duration-500 py-10">
                        <div className="text-6xl mb-4 animate-bounce">🎉</div>
                        <h2 className="text-3xl font-bold text-yellow-400 mb-2">{reward?.message}</h2>
                        <div className="text-gray-300 mb-6">Gratulacje! Nagroda została dodana do konta.</div>
                        <button
                            onClick={() => setShowRewardModal(false)}
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold transition"
                        >
                            Zamknij
                        </button>
                    </div>
                ) : loading ? (
                    <div className="animate-pulse flex flex-col items-center py-10">
                        <div className="h-40 w-full bg-white/5 rounded-xl mb-4"></div>
                    </div>
                ) : canClaim ? (
                    <div className="py-10">
                        <div className="text-9xl mb-8 animate-bounce cursor-pointer hover:scale-110 transition duration-300 select-none" onClick={handleClaim}>
                            📦
                        </div>
                        <button
                            onClick={handleClaim}
                            className="w-full max-w-xs mx-auto py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition transform hover:-translate-y-1 active:scale-95"
                        >
                            Otwórz Skrzynkę
                        </button>
                    </div>
                ) : (
                    <div className="py-10">
                        <div className="text-8xl mb-6 opacity-30 grayscale select-none">
                            🔒
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Wróć później</h3>
                        <p className="text-gray-400 mb-6">
                            Kolejny drop za: <br />
                            <span className="text-yellow-500 font-mono text-2xl">
                                {timeRemaining > 0 ? new Date(Math.max(0, timeRemaining)).toISOString().substr(11, 8) : "24h"}
                            </span>
                        </p>
                        <Link href="/" className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition">
                            Wróć na główną
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
