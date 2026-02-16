"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Case, CaseBattle, CaseBattleRound, Skin, User } from "@prisma/client";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Coins, Loader2, Swords, Trophy, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import SkinImage from "../../components/SkinImage";

// Types
type SkinWithDetails = Skin;
type RoundWithSkins = CaseBattleRound & {
    creatorSkin: Skin | null;
    joinerSkin: Skin | null;
};
type BattleFull = CaseBattle & {
    creator: User;
    joiner: User | null;
    winner: User | null;
    case: Case & { skins: Skin[] };
    rounds: RoundWithSkins[];
};


function Roulette({ winningSkin, allSkins, start, index }: { winningSkin: Skin | null, allSkins: Skin[], start: boolean, index: number }) {
    const controls = useAnimation();
    const [strip, setStrip] = useState<Skin[]>([]);
    const [status, setStatus] = useState<"IDLE" | "SPINNING" | "DONE">("IDLE");

    useEffect(() => {
        if (allSkins.length === 0 || !winningSkin) return;

        // Generate strip once
        const LANDING = 45;
        const newStrip = Array(50).fill(null).map(() => allSkins[Math.floor(Math.random() * allSkins.length)]);
        newStrip[LANDING] = winningSkin;
        setStrip(newStrip);
    }, [allSkins, winningSkin]);

    useEffect(() => {
        if (start && status === "IDLE" && strip.length > 0) {
            setStatus("SPINNING");

            const LANDING = 45;
            const CARD_WIDTH = 128;
            const GAP = 8;
            const TOTAL_WIDTH = CARD_WIDTH + GAP;
            const randomOffset = Math.floor(Math.random() * 80) - 40;
            const targetX = -((LANDING * TOTAL_WIDTH) + (CARD_WIDTH / 2)) + randomOffset;

            // Stagger start slightly based on index?
            // setTimeout(() => {
            controls.start({
                x: targetX,
                transition: { duration: 5, ease: [0.1, 0.8, 0.25, 1], delay: index * 0.2 } // Slight stagger
            }).then(() => {
                setStatus("DONE");
            });
            // }, index * 200);
        }
    }, [start, status, strip, controls, index]);

    // If no winning skin (e.g. still waiting), show question mark or empty
    if (!winningSkin) {
        return (
            <div className="h-40 bg-[#0b1120] border-b border-white/5 flex items-center justify-center relative">
                <div className="text-gray-600 font-bold text-4xl opacity-20">?</div>
            </div>
        );
    }

    return (
        <div className="h-40 bg-[#0b1120] border-b border-white/5 flex items-center relative overflow-hidden group">
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-yellow-500 z-30 shadow-[0_0_10px_orange]"></div>

            {/* Round Number Badge */}
            <div className="absolute left-2 top-2 z-40 bg-black/50 px-2 py-1 rounded text-[10px] text-gray-400 font-mono">
                R{index + 1}
            </div>

            {status !== "IDLE" ? (
                <motion.div
                    className="flex gap-2 px-[50%]"
                    animate={controls}
                    initial={{ x: 0 }}
                >
                    {strip.map((skin, i) => (
                        <div key={i} className={cn("w-32 h-32 bg-[#1e293b] border rounded-lg flex-shrink-0 flex flex-col items-center justify-center p-2 relative",
                            skin.rarity === 'ancient' ? 'border-red-500 bg-red-900/10' : 'border-blue-500 bg-blue-900/10'
                        )}>
                            <SkinImage src={skin.image} className="w-20 h-20 object-contain" />
                            {/* Overlay Price */}
                            <div className="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[10px] text-yellow-500 font-mono">
                                {skin.price}
                            </div>
                        </div>
                    ))}
                </motion.div>
            ) : (
                <div className="w-full flex justify-center opacity-50">
                    Oczekiwanie...
                </div>
            )}

            {/* Result Overlay (when done) */}
            {status === "DONE" && (
                <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-center">
                        <p className="font-bold text-sm text-white">{winningSkin.name}</p>
                        <p className="text-yellow-500 font-bold">{winningSkin.price} TC</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BattleArenaPage() {
    const { id } = useParams() as { id: string };
    const { data: session } = useSession();
    const [battle, setBattle] = useState<BattleFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [spinStarted, setSpinStarted] = useState(false);

    useEffect(() => {
        if (!id) return;

        let interval: NodeJS.Timeout;

        const fetchBattle = async () => {
            try {
                const res = await fetch(`/api/battles/${id}`);
                const data = await res.json();

                if (data.error) {
                    console.error(data.error);
                    return;
                }

                setBattle(prev => {
                    // Detect transition to FINISHED to trigger spin
                    if (prev?.status !== "FINISHED" && data.status === "FINISHED") {
                        // Start spinning shortly after receiving data
                        setTimeout(() => setSpinStarted(true), 100);
                    }
                    // If we load page and it's already finished
                    if (!prev && data.status === "FINISHED") {
                        // Maybe just show results immediately? or spin?
                        // Let's spin for effect
                        setTimeout(() => setSpinStarted(true), 100);
                    }
                    return data;
                });

                setLoading(false);

            } catch (e) {
                console.error(e);
            }
        };

        fetchBattle();
        interval = setInterval(fetchBattle, 2000);

        return () => clearInterval(interval);
    }, [id]);

    const handleJoin = async () => {
        if (!battle || joining) return;
        if (!confirm(`Dołączyć do bitwy za ${battle.casePrice * battle.rounds.length} TC?`)) return;

        setJoining(true);
        try {
            const res = await fetch("/api/battles/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ battleId: battle.id })
            });
            const data = await res.json();
            if (data.error) {
                alert(data.error);
                setJoining(false);
            }
        } catch (e) {
            alert("Błąd");
            setJoining(false);
        }
    };

    if (loading || !battle) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

    const creatorTotal = battle.rounds.reduce((sum, r) => sum + (r.creatorSkin?.price || 0), 0);
    const joinerTotal = battle.rounds.reduce((sum, r) => sum + (r.joinerSkin?.price || 0), 0);

    // Calculate totals for currently shown results vs final? 
    // The Roulette component handles visual "revealing", but here we just show total.
    // It's fine to show total immediately or maybe we should hide it until spin done?
    // For simplicity, showing total immediately or conditionally.

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0f172a] text-white flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-6xl flex justify-between items-center mb-8">
                <Link href="/games/cases/battles" className="text-gray-400 hover:text-white flex items-center gap-2 transition">
                    &larr; Lobby
                </Link>
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {battle.case.name} Battle
                    </h1>
                    <div className="flex gap-4 text-sm text-gray-400">
                        <span>{battle.rounds.length} Rundy</span>
                        <span className="text-yellow-500 font-bold">{battle.casePrice * battle.rounds.length} TC</span>
                    </div>
                </div>
                <div className="w-20"></div>
            </div>

            {/* Arena */}
            <div className="w-full max-w-6xl grid grid-cols-2 gap-8 relative">

                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="bg-red-600 text-white font-black text-2xl w-16 h-16 rounded-full flex items-center justify-center border-4 border-[#0f172a] shadow-xl">
                        VS
                    </div>
                </div>

                {/* Left: Creator */}
                <div className={cn("bg-[#1e293b] rounded-3xl border-2 overflow-hidden flex flex-col",
                    battle.status === "FINISHED" && creatorTotal > joinerTotal ? "border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]" : "border-white/10"
                )}>
                    {/* User Header */}
                    <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-black/20 z-10 relative">
                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                            {battle.creator.image ? <img src={battle.creator.image} /> : <UserIcon />}
                        </div>
                        <div>
                            <p className="font-bold">{battle.creator.name}</p>
                            <p className="text-xs text-gray-500">Kreator</p>
                        </div>
                        <div className="ml-auto">
                            <p className={cn("font-bold text-xl", creatorTotal > joinerTotal ? "text-yellow-500" : "text-gray-500")}>
                                {creatorTotal} TC
                            </p>
                        </div>
                    </div>

                    {/* Roulettes List */}
                    <div className="flex-1 flex flex-col bg-[#0b1120]">
                        {battle.rounds.map((round, i) => (
                            <Roulette
                                key={round.id}
                                index={i}
                                winningSkin={round.creatorSkin}
                                allSkins={battle.case.skins}
                                start={spinStarted}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Joiner */}
                <div className={cn("bg-[#1e293b] rounded-3xl border-2 overflow-hidden flex flex-col",
                    battle.status === "FINISHED" && joinerTotal > creatorTotal ? "border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]" : "border-white/10"
                )}>
                    {battle.joiner ? (
                        <>
                            {/* User Header */}
                            <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-black/20 z-10 relative">
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {battle.joiner.image ? <img src={battle.joiner.image} /> : <UserIcon />}
                                </div>
                                <div>
                                    <p className="font-bold">{battle.joiner.name || "Przeciwnik"}</p>
                                    <p className="text-xs text-gray-500">Dołączył</p>
                                </div>
                                <div className="ml-auto">
                                    <p className={cn("font-bold text-xl", joinerTotal > creatorTotal ? "text-yellow-500" : "text-gray-500")}>
                                        {joinerTotal} TC
                                    </p>
                                </div>
                            </div>

                            {/* Roulettes List */}
                            <div className="flex-1 flex flex-col bg-[#0b1120]">
                                {battle.rounds.map((round, i) => (
                                    <Roulette
                                        key={round.id}
                                        index={i}
                                        winningSkin={round.joinerSkin}
                                        allSkins={battle.case.skins}
                                        start={spinStarted}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-6 p-8 min-h-[400px]">
                            <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                                <span className="text-4xl text-gray-600">?</span>
                            </div>
                            <h3 className="text-xl text-gray-400">Oczekiwanie na gracza...</h3>
                            <button
                                onClick={handleJoin}
                                disabled={joining}
                                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition flex items-center gap-2"
                            >
                                <Swords className="w-5 h-5" /> Dołącz za {battle.casePrice * battle.rounds.length} TC
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
