import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const SYMBOLS = ["💰", "💎", "🍇", "🍋", "🍒", "🔔"];
const SYMBOL_VALUES: Record<string, number> = {
    "💰": 50,
    "💎": 20,
    "🔔": 15,
    "🍇": 10,
    "🍋": 5,
    "🍒": 2
};

// 5x3 Grid
const ROWS = 3;
const COLS = 5;

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bet } = body;

    if (!bet || bet < 0) {
        return NextResponse.json({ error: "Invalid bet" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user?.email! },
        });

        if (!user || user.tebCoins < bet) {
            return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
        }

        // Generate Reels
        const reels: string[][] = [];
        for (let i = 0; i < COLS; i++) {
            const col: string[] = [];
            for (let j = 0; j < ROWS; j++) {
                const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
                col.push(SYMBOLS[randomIndex]);
            }
            reels.push(col);
        }

        // Calculate Win (Simple logic: 3+ adjacent symbols from left or total count for specific symbols)
        // For simplicity: Check for 3+ matched symbols in a row anywhere? Or scatter?
        // Let's do simple: Check counts of symbols.
        // If 3 of x: 2x bet * multiplier
        // If 4 of x: 5x bet * multiplier
        // If 5 of x: 10x bet * multiplier

        // Actually Le Bandit uses clusters, but let's stick to "Matching symbols on at least 3 reels" for now or just counts to be generous for MVP.

        let winAmount = 0;
        const symbolCounts: Record<string, number> = {};

        reels.flat().forEach(s => {
            symbolCounts[s] = (symbolCounts[s] || 0) + 1;
        });

        Object.entries(symbolCounts).forEach(([symbol, count]) => {
            if (count >= 3) {
                const baseValue = SYMBOL_VALUES[symbol];
                const multiplier = count - 2; // 3->1x, 4->2x, 5->3x...
                winAmount += baseValue * multiplier * (bet / 10); // Scale with bet
            }
        });

        // Round to integer
        winAmount = Math.floor(winAmount);

        const newBalance = user.tebCoins - bet + winAmount;

        await prisma.user.update({
            where: { email: session.user?.email! },
            data: { tebCoins: newBalance },
        });

        return NextResponse.json({
            reels,
            winAmount,
            newBalance,
            gameState: "finished"
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
