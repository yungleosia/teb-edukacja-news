"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Coins, Trash2 } from "lucide-react";
import { Skin } from "@prisma/client";
import { cn } from "@/lib/utils";

type UserItemWithSkin = {
    id: string;
    status: string;
    skin: Skin;
    createdAt: string;
};

export default function InventoryPage() {
    const [items, setItems] = useState<UserItemWithSkin[]>([]);
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchInventory = () => {
        fetch("/api/user/inventory").then(res => res.json()).then(setItems).finally(() => setLoading(false));
        fetch("/api/user/me").then(res => res.json()).then(data => setBalance(data.tebCoins));
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleSell = async (itemId: string) => {
        if (!confirm("Na pewno chcesz sprzedać ten przedmiot?")) return;

        try {
            const res = await fetch("/api/cases/sell", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId })
            });
            const data = await res.json();
            if (data.success) {
                setBalance(data.newBalance);
                // Remove from list
                setItems(prev => prev.filter(i => i.id !== itemId));
            } else {
                alert(data.error);
            }
        } catch (e) {
            alert("Błąd sprzedaży");
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0f172a] text-white flex flex-col items-center">
            <div className="w-full max-w-6xl flex justify-between items-center mb-8">
                <Link href="/games/cases" className="text-gray-400 hover:text-white flex items-center gap-2 transition group">
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
                    Wróć do skrzynek
                </Link>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-500 font-bold text-xl tabular-nums">
                        {typeof balance === 'number' ? balance.toLocaleString() : "..."} TC
                    </span>
                </div>
            </div>

            <h1 className="text-3xl font-bold mb-8 w-full max-w-6xl">Twój Ekwipunek</h1>

            {loading ? (
                <div className="text-gray-500">Ładowanie...</div>
            ) : items.length === 0 ? (
                <div className="text-gray-500 flex flex-col items-center gap-4 mt-20">
                    <p>Pusto tutaj...</p>
                    <Link href="/games/cases" className="px-6 py-2 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-500">
                        Otwórz coś!
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full max-w-6xl">
                    {items.map((item) => (
                        <div key={item.id} className={cn(
                            "relative bg-[#1e293b] rounded-xl border p-4 flex flex-col items-center group hover:bg-[#253248] transition",
                            item.skin.rarity === 'ancient' ? 'border-red-500/50' :
                                item.skin.rarity === 'legendary' ? 'border-pink-500/50' : 'border-blue-500/50'
                        )}>
                            <img src={item.skin.image} className="w-24 h-24 object-contain mb-4 group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-bold text-center mb-1 text-gray-200 line-clamp-1">{item.skin.name}</p>
                            <p className={cn("text-[10px] uppercase font-bold tracking-widest mb-4",
                                item.skin.rarity === 'ancient' ? 'text-red-400' : 'text-blue-400'
                            )}>{item.skin.rarity}</p>

                            <button
                                onClick={() => handleSell(item.id)}
                                className="w-full py-2 bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100"
                            >
                                Sprzedaj {item.skin.price} TC
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
