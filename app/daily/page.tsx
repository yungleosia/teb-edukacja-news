
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

    const handleClaim = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/daily", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setReward(data.reward);
                setCanClaim(false);
                setTimeRemaining(24 * 60 * 60 * 1000); // Reset timer roughly
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Błąd połączenia");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-10 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>

                <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Daily Drop 🎁</h1>
                <p className="text-gray-400 mb-8">Odbierz swoją codzienną nagrodę!</p>

                {loading ? (
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-48 w-48 bg-white/10 rounded-full mb-4"></div>
                        <div className="h-8 w-32 bg-white/10 rounded mb-2"></div>
                    </div>
                ) : reward ? (
                    <div className="animate-in zoom-in duration-500">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-yellow-400 mb-2">{reward.message}</h2>
                        {reward.type === "COINS" && (
                            <p className="text-white text-lg">Dodano do Twojego portfela!</p>
                        )}
                        {reward.type === "ITEM" && (
                            <p className="text-white text-lg">Przedmiot dodany do Twojego ekwipunku!</p>
                        )}
                        <Link href="/marketplace" className="inline-block mt-8 text-indigo-400 hover:text-white transition">
                            Wróć do giełdy
                        </Link>
                    </div>
                ) : canClaim ? (
                    <div>
                        <div className="text-9xl mb-8 animate-bounce cursor-pointer hover:scale-110 transition duration-300" onClick={handleClaim}>
                            📦
                        </div>
                        <button
                            onClick={handleClaim}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition transform hover:-translate-y-1 active:scale-95"
                        >
                            Odbierz Nagrodę
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="text-8xl mb-6 opacity-50 grayscale">
                            🔒
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Wróć później</h3>
                        <p className="text-gray-400 mb-6">
                            Kolejny drop za: <br />
                            <span className="text-yellow-500 font-mono text-2xl">
                                {timeRemaining > 0 ? new Date(timeRemaining).toISOString().substr(11, 8) : "24h"}
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
