
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BuyButton({ itemId, price }: { itemId: string, price: number }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleBuy = async () => {
        if (!confirm(`Czy na pewno chcesz kupić ten przedmiot za ${price} TEBCoins?`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/marketplace/${itemId}/buy`, {
                method: "POST",
            });

            const data = await res.json();

            if (res.ok) {
                alert("Zakup udany! 🎉");
                router.refresh();
            } else {
                alert(`Błąd: ${data.error}`);
            }
        } catch (error) {
            alert("Wystąpił błąd połączenia.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleBuy}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold text-lg rounded-xl transition shadow-lg shadow-orange-500/20 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {loading ? "Przetwarzanie..." : `Kup teraz za ${price} Coins`}
        </button>
    );
}
