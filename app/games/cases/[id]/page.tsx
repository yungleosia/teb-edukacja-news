"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Case, Skin, UserItem } from "@prisma/client";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Coins, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CaseWithSkins = Case & { skins: Skin[] };

export default function CaseOpeningPage() {
    const { id } = useParams();
    const [csCase, setCsCase] = useState<CaseWithSkins | null>(null);
    const [balance, setBalance] = useState<number | null>(null);
    const [opening, setOpening] = useState(false);
    const [wonSkin, setWonSkin] = useState<Skin | null>(null);
    const [wonItem, setWonItem] = useState<UserItem | null>(null);
    const [rouletteItems, setRouletteItems] = useState<Skin[]>([]);

    const controls = useAnimation();

    useEffect(() => {
        if (id) {
            // Fetch ALL cases to find this one (inefficient but simple given API structure)
            fetch("/api/cases").then(res => res.json()).then(data => {
                const found = data.find((c: CaseWithSkins) => c.id === id);
                setCsCase(found);

                // Prep initial roulette strip - random visually
                if (found) {
                    const initial = Array(50).fill(null).map(() => found.skins[Math.floor(Math.random() * found.skins.length)]);
                    setRouletteItems(initial);
                }
            });

            fetch("/api/user/me").then(res => res.json()).then(data => setBalance(data.tebCoins));
        }
    }, [id]);

    const handleOpen = async () => {
        if (!csCase || opening || (balance || 0) < csCase.price) return;

        setOpening(true);
        setWonSkin(null);
        setWonItem(null);

        try {
            const res = await fetch("/api/cases/open", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ caseId: csCase.id })
            });

            if (!res.ok) throw new Error("Failed");

            const data = await res.json();
            const winner = data.wonSkin as Skin;
            const item = data.userItem as UserItem;

            // Setup Roulette
            // We need the winner to land at index ~45
            const LANDING_INDEX = 45;
            const newStrip = [...rouletteItems];
            newStrip[LANDING_INDEX] = winner;

            // Fill surroundings with randoms to look natural
            for (let i = 0; i < newStrip.length; i++) {
                if (i !== LANDING_INDEX) {
                    newStrip[i] = csCase.skins[Math.floor(Math.random() * csCase.skins.length)];
                }
            }
            setRouletteItems(newStrip);

            // Animate
            // Width of card = 192px (w-48) + gap 16px (gap-4) = 208px
            const CARD_WIDTH = 208;

            const randomOffset = Math.floor(Math.random() * 100) - 50;
            const targetX = -(LANDING_INDEX * CARD_WIDTH) + window.innerWidth / 2 - CARD_WIDTH / 2 + randomOffset;

            await controls.start({
                x: targetX,
                transition: {
                    duration: 5,
                    ease: [0.1, 0.8, 0.25, 1] // Benzier for "spin" feel (fast start, slow end)
                }
            });

            // Show Result Modal
            setTimeout(() => {
                setWonSkin(winner);
                setWonItem(item);
                setBalance(data.newBalance);
                setOpening(false);
            }, 500);

        } catch (e) {
            console.error(e);
            setOpening(false);
        }
    };

    const handleSell = async () => {
        if (!wonItem || !wonSkin) return;

        try {
            const res = await fetch("/api/cases/sell", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId: wonItem.id })
            });

            const data = await res.json();
            if (data.success) {
                setBalance(data.newBalance);
                setWonSkin(null);
                setWonItem(null);
                controls.set({ x: 0 }); // Reset roulette
            } else {
                alert(data.error);
            }
        } catch (e) {
            console.error(e);
            alert("Błąd sprzedaży");
        }
    };

    if (!csCase) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0f172a] text-white flex flex-col items-center overflow-hidden">
            {/* Header */}
            <div className="w-full max-w-6xl flex justify-between items-center mb-12">
                <Link href="/games/cases" className="text-gray-400 hover:text-white flex items-center gap-2 transition group">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
                    Powrót
                </Link>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-500 font-bold text-xl tabular-nums">
                        {typeof balance === 'number' ? balance.toLocaleString() : "..."} TC
                    </span>
                </div>
            </div>

            {/* Roulette Window */}
            <div className="w-full max-w-6xl h-64 bg-[#0b1120] relative overflow-hidden rounded-3xl border-4 border-yellow-500/20 shadow-2xl mb-12 flex items-center">
                {/* Center Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-500 z-30 shadow-[0_0_20px_rgba(234,179,8,1)]"></div>

                <motion.div
                    className="flex gap-4 px-[50vw]" // Start with padding to center initial state? No, rely on x
                    animate={controls}
                    initial={{ x: 0 }}
                >
                    {rouletteItems.map((skin, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-48 h-56 flex-shrink-0 bg-[#1e293b] border-2 rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden",
                                skin.rarity === 'ancient' ? 'border-red-500 bg-red-900/10' :
                                    skin.rarity === 'legendary' ? 'border-pink-500 bg-pink-900/10' :
                                        skin.rarity === 'mythical' ? 'border-purple-500 bg-purple-900/10' :
                                            'border-blue-500 bg-blue-900/10'
                            )}
                        >
                            {/* Rarity Glow */}
                            <div className={cn("absolute inset-0 opacity-20 bg-gradient-to-b from-transparent to-current")} />

                            <img src={skin.image} className="w-32 h-32 object-contain z-10" />
                            <div className="mt-2 text-center z-10">
                                <p className="text-xs text-gray-400 font-bold uppercase truncate w-full px-2">{skin.name}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center gap-6">
                <div className="relative group cursor-pointer" onClick={handleOpen}>
                    <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                    <button
                        disabled={opening || (balance || 0) < csCase.price}
                        className="relative px-16 py-6 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex flex-col items-center leading-none gap-2"
                    >
                        <span>OTWÓRZ</span>
                        <span className="text-xs font-medium opacity-80 text-black flex items-center gap-1">
                            <Coins className="w-3 h-3" /> {csCase.price} TC
                        </span>
                    </button>
                </div>

                {/* Possible Skins */}
                <div className="mt-12 w-full max-w-4xl">
                    <h3 className="text-2xl font-bold mb-6 text-center text-gray-400">Co jest w środku?</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {csCase.skins.sort((a, b) => b.price - a.price).map(skin => (
                            <div key={skin.id} className={cn(
                                "aspect-square bg-white/5 rounded-xl border flex flex-col items-center justify-center p-2 relative group hover:bg-white/10 transition",
                                skin.rarity === 'ancient' ? 'border-red-500/50' :
                                    skin.rarity === 'legendary' ? 'border-pink-500/50' : 'border-blue-500/50'
                            )}>
                                <img src={skin.image} className="w-16 h-16 object-contain mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] text-center text-gray-400 truncate w-full">{skin.name}</p>
                                <p className="text-[10px] text-yellow-500 font-bold">{skin.price} TC</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Win Modal */}
            {wonSkin && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.5, y: 100 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-[#1e293b] w-full max-w-md p-8 rounded-3xl border-2 border-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.3)] flex flex-col items-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-yellow-500/10 to-transparent"></div>

                        <h2 className="text-3xl font-black text-yellow-500 mb-2 z-10">WYGRANA!</h2>
                        <div className="w-64 h-48 my-4 relative z-10">
                            <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full"></div>
                            <img src={wonSkin.image} className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
                        </div>

                        <h3 className="text-xl font-bold text-center mb-2 z-10">{wonSkin.name}</h3>
                        <p className={cn("text-xs font-bold uppercase tracking-widest mb-8 z-10 px-3 py-1 rounded-full bg-black/40",
                            wonSkin.rarity === 'ancient' ? 'text-red-500 border border-red-500/20' : 'text-blue-500 border border-blue-500/20'
                        )}>{wonSkin.rarity}</p>

                        <div className="flex gap-4 w-full z-10 flex-col">
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => {
                                        setWonSkin(null);
                                        setWonItem(null);
                                        controls.set({ x: 0 }); // Reset roulette
                                    }}
                                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition"
                                >
                                    Zachowaj
                                </button>
                                <button
                                    onClick={handleSell}
                                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition flex items-center justify-center gap-2"
                                >
                                    <Coins className="w-4 h-4" />
                                    Sprzedaj ({wonSkin.price} TC)
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    setWonSkin(null);
                                    setWonItem(null);
                                    controls.set({ x: 0 });
                                    handleOpen();
                                }}
                                className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 rounded-xl font-bold transition"
                            >
                                Otwórz kolejną
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
