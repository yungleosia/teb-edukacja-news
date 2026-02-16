"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Case, CaseBattle, CaseBattleRound, Skin, User } from "@prisma/client";
import { motion, useAnimation } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Coins, Loader2, Swords, Trophy, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

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

export default function BattleArenaPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const [battle, setBattle] = useState<BattleFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    // Animation Controls
    const creatorControls = useAnimation();
    const joinerControls = useAnimation();
    const [rouletteState, setRouletteState] = useState<"IDLE" | "SPINNING" | "DONE">("IDLE");

    // Strips
    const [creatorStrip, setCreatorStrip] = useState<Skin[]>([]);
    const [joinerStrip, setJoinerStrip] = useState<Skin[]>([]);

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

                // If finished and we haven't spun yet, Trigger Spin!
                // But only if we have rounds data.
                if (data.status === "FINISHED" && data.rounds.length > 0) {
                    // Check if local state is already synced
                    setBattle(prev => {
                        if (prev?.status !== "FINISHED") {
                            // Transitioning to FINISHED
                            // Trigger spin logic in effect? 
                            // Or just set state here and let effect handle?
                            // Better to handle in a dedicated check.
                            return data;
                        }
                        return data;
                    });
                } else {
                    setBattle(data);
                }

                setLoading(false);

                // Stop polling if finished and done spinning
                if (data.status === "FINISHED") {
                    // clearInterval(interval); // Keep polling? No need.
                }

            } catch (e) {
                console.error(e);
            }
        };

        fetchBattle();
        interval = setInterval(fetchBattle, 2000); // Poll fast for battle updates

        return () => clearInterval(interval);
    }, [id]);

    // Handle Spin Trigger
    useEffect(() => {
        if (battle?.status === "FINISHED" && battle.rounds.length > 0 && rouletteState === "IDLE" && battle.case) {
            startSpin(battle);
        }
    }, [battle, rouletteState]);

    const startSpin = (b: BattleFull) => {
        setRouletteState("SPINNING");

        // Logic similar to single open, but for TWO strips.
        // Round 1 (Single round for V1)
        const round = b.rounds[0];
        if (!round) return;

        const creatorWin = round.creatorSkin;
        const joinerWin = round.joinerSkin;

        if (!creatorWin || !joinerWin) return; // Should not happen

        // Generate Strips
        const skins = b.case.skins;
        const LANDING = 45;

        const cStrip = Array(50).fill(null).map(() => skins[Math.floor(Math.random() * skins.length)]);
        cStrip[LANDING] = creatorWin;
        setCreatorStrip(cStrip);

        const jStrip = Array(50).fill(null).map(() => skins[Math.floor(Math.random() * skins.length)]);
        jStrip[LANDING] = joinerWin;
        setJoinerStrip(jStrip);

        // Animate
        const CARD_WIDTH = 128; // Smaller cards for battle (w-32)
        const GAP = 8;
        const TOTAL_WIDTH = CARD_WIDTH + GAP;

        // Offset logic
        const offset = Math.floor(Math.random() * 50) - 25;
        const targetX = -(LANDING * TOTAL_WIDTH) + 150; // Center roughly (tuning needed)

        // Simultaneous
        Promise.all([
            creatorControls.start({ x: targetX, transition: { duration: 5, ease: [0.1, 0.8, 0.25, 1] } }),
            joinerControls.start({ x: targetX, transition: { duration: 5, ease: [0.1, 0.8, 0.25, 1] } })
        ]).then(() => {
            setRouletteState("DONE");
        });
    };

    const handleJoin = async () => {
        if (!battle || joining) return;
        if (!confirm(`Dołączyć do bitwy za ${battle.casePrice} TC?`)) return;

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
            } else {
                // Battle updated, polling/effect will pick it up
            }
        } catch (e) {
            alert("Błąd");
            setJoining(false);
        }
    };

    if (loading || !battle) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;

    const creatorTotal = battle.rounds.reduce((sum, r) => sum + (r.creatorSkin?.price || 0), 0);
    const joinerTotal = battle.rounds.reduce((sum, r) => sum + (r.joinerSkin?.price || 0), 0);
    const iAmCreator = session?.user?.email === battle.creator?.email; // Use email or ID, user object might vary, logic relies on populated.
    // Wait, API returns creator object. schema has email.

    // Hack: Assuming ID match or name match if session ID not avail in client easily
    // We strictly need fetching session or relying on ID if exposed.
    // Let's assume session.user.email is consistent.

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
                    <span className="text-yellow-500 font-bold">{battle.casePrice} TC</span>
                </div>
                <div className="w-20"></div> {/* Spacer */}
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
                    rouletteState === "DONE" && creatorTotal > joinerTotal ? "border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]" : "border-white/10"
                )}>
                    {/* User Header */}
                    <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-black/20">
                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                            {battle.creator.image ? <img src={battle.creator.image} /> : <UserIcon />}
                        </div>
                        <div>
                            <p className="font-bold">{battle.creator.name}</p>
                            <p className="text-xs text-gray-500">Kreator</p>
                        </div>
                        <div className="ml-auto">
                            {rouletteState === "DONE" && (
                                <p className={cn("font-bold text-xl", creatorTotal > joinerTotal ? "text-yellow-500" : "text-gray-500")}>
                                    {creatorTotal} TC
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Roulette Area */}
                    <div className="h-64 relative overflow-hidden bg-[#0b1120] flex items-center">
                        {/* Center Line */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-500 z-30 shadow-[0_0_10px_orange]"></div>

                        {rouletteState !== "IDLE" ? (
                            <motion.div
                                className="flex gap-2 px-[50%]"
                                animate={creatorControls}
                                initial={{ x: 0 }}
                            >
                                {creatorStrip.map((skin, i) => (
                                    <div key={i} className={cn("w-32 h-40 bg-[#1e293b] border rounded-lg flex-shrink-0 flex flex-col items-center justify-center p-2",
                                        skin.rarity === 'ancient' ? 'border-red-500 bg-red-900/10' : 'border-blue-500 bg-blue-900/10'
                                    )}>
                                        <img src={skin.image} className="w-20 h-20 object-contain" />
                                        <p className="text-[10px] text-center truncate w-full">{skin.name}</p>
                                        <p className="text-[10px] text-yellow-500 font-bold">{skin.price}</p>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 animate-pulse">
                                Oczekiwanie na start...
                            </div>
                        )}
                    </div>

                    {/* Result (if done) */}
                    <div className="p-4 bg-black/20 min-h-[100px] flex items-center justify-center">
                        {rouletteState === "DONE" && battle.rounds[0]?.creatorSkin && (
                            <div className="flex items-center gap-4">
                                <img src={battle.rounds[0].creatorSkin.image} className="w-16 h-16 object-contain" />
                                <div className="text-left">
                                    <p className="font-bold text-sm">{battle.rounds[0].creatorSkin.name}</p>
                                    <p className="text-yellow-500 font-bold">{battle.rounds[0].creatorSkin.price} TC</p>
                                </div>
                            </div>
                        )}
                        {creatorTotal > joinerTotal && rouletteState === "DONE" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/10 backdrop-blur-[1px]">
                                <Trophy className="w-24 h-24 text-yellow-500 drop-shadow-2xl animate-bounce" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Joiner */}
                <div className={cn("bg-[#1e293b] rounded-3xl border-2 overflow-hidden flex flex-col",
                    rouletteState === "DONE" && joinerTotal > creatorTotal ? "border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)]" : "border-white/10"
                )}>
                    {battle.joiner ? (
                        <>
                            {/* User Header */}
                            <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-black/20">
                                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {battle.joiner.image ? <img src={battle.joiner.image} /> : <UserIcon />}
                                </div>
                                <div>
                                    <p className="font-bold">{battle.joiner.name || "Przeciwnik"}</p>
                                    <p className="text-xs text-gray-500">Dołączył</p>
                                </div>
                                <div className="ml-auto">
                                    {rouletteState === "DONE" && (
                                        <p className={cn("font-bold text-xl", joinerTotal > creatorTotal ? "text-yellow-500" : "text-gray-500")}>
                                            {joinerTotal} TC
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Roulette Area */}
                            <div className="h-64 relative overflow-hidden bg-[#0b1120] flex items-center">
                                {/* Center Line */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-yellow-500 z-30 shadow-[0_0_10px_orange]"></div>

                                {rouletteState !== "IDLE" ? (
                                    <motion.div
                                        className="flex gap-2 px-[50%]"
                                        animate={joinerControls}
                                        initial={{ x: 0 }}
                                    >
                                        {joinerStrip.map((skin, i) => (
                                            <div key={i} className={cn("w-32 h-40 bg-[#1e293b] border rounded-lg flex-shrink-0 flex flex-col items-center justify-center p-2",
                                                skin.rarity === 'ancient' ? 'border-red-500 bg-red-900/10' : 'border-blue-500 bg-blue-900/10'
                                            )}>
                                                <img src={skin.image} className="w-20 h-20 object-contain" />
                                                <p className="text-[10px] text-center truncate w-full">{skin.name}</p>
                                                <p className="text-[10px] text-yellow-500 font-bold">{skin.price}</p>
                                            </div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500 animate-pulse">
                                        Gotowy...
                                    </div>
                                )}
                            </div>

                            {/* Result (if done) */}
                            <div className="p-4 bg-black/20 min-h-[100px] flex items-center justify-center">
                                {rouletteState === "DONE" && battle.rounds[0]?.joinerSkin && (
                                    <div className="flex items-center gap-4">
                                        <img src={battle.rounds[0].joinerSkin.image} className="w-16 h-16 object-contain" />
                                        <div className="text-left">
                                            <p className="font-bold text-sm">{battle.rounds[0].joinerSkin.name}</p>
                                            <p className="text-yellow-500 font-bold">{battle.rounds[0].joinerSkin.price} TC</p>
                                        </div>
                                    </div>
                                )}
                                {joinerTotal > creatorTotal && rouletteState === "DONE" && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/10 backdrop-blur-[1px]">
                                        <Trophy className="w-24 h-24 text-yellow-500 drop-shadow-2xl animate-bounce" />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
                            <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                                <span className="text-4xl text-gray-600">?</span>
                            </div>
                            <h3 className="text-xl text-gray-400">Oczekiwanie na gracza...</h3>

                            {/* Wait, we need to know if current user is Creator */}
                            {/* Assuming session ID matching creator ID is possible. 
                                Actually, we can check if button should be enabled.
                                If I am creator, disabled.
                                If I am guest, enabled.
                             */}
                            {/* Since we don't have user ID easily in client side w/o exposing, we rely on session.user.email */}
                            {/* But battle.creator doesn't expose Email in API normally for privacy, but here we can? */}
                            {/* Let's just show button. API checks validation. */}

                            <button
                                onClick={handleJoin}
                                disabled={joining}
                                className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition flex items-center gap-2"
                            >
                                <Swords className="w-5 h-5" /> Dołącz za {battle.casePrice} TC
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
