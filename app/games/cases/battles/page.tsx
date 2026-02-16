"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Case, CaseBattle, User } from "@prisma/client";
import { Coins, Plus, Swords, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import SkinImage from "../components/SkinImage";

type BattleWithDetails = CaseBattle & {
    creator: User;
    joiner: User | null;
    case: Case;
};

export default function BattlesLobbyPage() {
    const { data: session } = useSession();
    const [battles, setBattles] = useState<BattleWithDetails[]>([]);
    const [cases, setCases] = useState<Case[]>([]);
    const [creating, setCreating] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBattles();
        // Poll every 5s
        const interval = setInterval(fetchBattles, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchBattles = async () => {
        try {
            const res = await fetch("/api/battles");
            const data = await res.json();
            setBattles(data);
            setLoading(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (caseId: string) => {
        if (!confirm("Utworzyć bitwę za cenę skrzynki?")) return;

        try {
            const res = await fetch("/api/battles/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ caseId })
            });
            const data = await res.json();
            if (data.battle) {
                window.location.href = `/games/cases/battles/${data.battle.id}`;
            } else {
                alert(data.error || "Błąd");
            }
        } catch (e) {
            alert("Błąd połączenia");
        }
    };

    const loadCases = async () => {
        if (cases.length > 0) {
            setCreating(true);
            return;
        }
        const res = await fetch("/api/cases");
        setCases(await res.json());
        setCreating(true);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0f172a] text-white flex flex-col items-center">
            <div className="w-full max-w-6xl flex justify-between items-center mb-8">
                <Link href="/games/cases" className="text-gray-400 hover:text-white flex items-center gap-2 transition">
                    &larr; Skrzynki
                </Link>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Swords className="w-8 h-8 text-yellow-500" /> Case Battles
                </h1>
                <button
                    onClick={loadCases}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition"
                >
                    <Plus className="w-5 h-5" /> Utwórz Bitwę
                </button>
            </div>

            {/* Battles List */}
            <div className="w-full max-w-6xl grid gap-4">
                {battles.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-12 bg-white/5 rounded-xl border border-white/5">
                        Brak aktywnych bitew. Utwórz pierwszą!
                    </div>
                )}

                {battles.map(battle => (
                    <div key={battle.id} className="bg-[#1e293b] border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-[#253248] transition group">
                        {/* Box Info */}
                        <div className="flex items-center gap-4">
                            <SkinImage src={battle.case.image} className="w-16 h-16 object-contain" />
                            <div>
                                <h3 className="font-bold">{battle.case.name}</h3>
                                <p className="text-yellow-500 text-sm font-bold flex items-center gap-1">
                                    <Coins className="w-3 h-3" /> {battle.case.price} TC
                                </p>
                            </div>
                        </div>

                        {/* Players */}
                        <div className="flex items-center gap-8">
                            {/* Creator */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {battle.creator.image ? <img src={battle.creator.image} /> : <UserIcon className="w-4 h-4" />}
                                </div>
                                <span className="font-medium text-sm">{battle.creator.name || "Anon"}</span>
                            </div>

                            <div className="text-gray-500 font-bold">VS</div>

                            {/* Joiner */}
                            <div className="flex items-center gap-2">
                                {battle.joiner ? (
                                    <>
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                            {battle.joiner.image ? <img src={battle.joiner.image} /> : <UserIcon className="w-4 h-4" />}
                                        </div>
                                        <span className="font-medium text-sm">{battle.joiner.name || "Anon"}</span>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 opacity-50">
                                        <div className="w-8 h-8 rounded-full bg-gray-800 border border-dashed border-gray-500 flex items-center justify-center">
                                            ?
                                        </div>
                                        <span className="text-sm">Czeka...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action */}
                        <div>
                            {battle.status === "WAITING" ? (
                                battle.creatorId === session?.user?.id ? (
                                    <Link href={`/games/cases/battles/${battle.id}`} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 font-bold transition">
                                        Twoja
                                    </Link>
                                ) : (
                                    <Link href={`/games/cases/battles/${battle.id}`} className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 font-bold transition">
                                        Dołącz
                                    </Link>
                                )
                            ) : (
                                <Link href={`/games/cases/battles/${battle.id}`} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold transition">
                                    Oglądaj
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {creating && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1e293b] w-full max-w-2xl rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Wybierz skrzynkę</h2>
                            <button onClick={() => setCreating(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {cases.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => handleCreate(c.id)}
                                    className="bg-[#0f172a] hover:bg-[#253248] border border-white/5 hover:border-yellow-500/50 rounded-xl p-4 flex flex-col items-center gap-3 transition group"
                                >
                                    <SkinImage src={c.image} className="w-24 h-24 object-contain group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <p className="font-bold">{c.name}</p>
                                        <p className="text-yellow-500 text-sm font-bold">{c.price} TC</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
