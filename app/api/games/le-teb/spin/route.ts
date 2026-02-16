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

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bet } = body;

    if (!bet || bet < 0) {
        return NextResponse.json({ error: "Invalid bet" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user has free spins
        const hasFreeSpins = user.leTebFreeSpins > 0;

        if (!hasFreeSpins && user.tebCoins < bet) {
            return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
        }

        let currentBalance = user.tebCoins;
        let currentFreeSpins = user.leTebFreeSpins;

        // Deduct cost if not a free spin
        if (hasFreeSpins) {
            currentFreeSpins--;
        } else {
            currentBalance -= bet;
        }

        // Generate Reels
        // Impossible Mode Tuning:
        // Flattened weights for low-tier symbols to increase entropy and reduce "clumping".
        // 💳 (Bonus): 1 
        // 💰 (Money): 2
        // 💎 (Gem): 6
        // 🔔 (Bell): 12
        // 🍇 (Grapes): 12
        // 🍋 (Lemon): 12
        // 🍒 (Cherry): 12
        // Total Weight: 57

        const WEIGHTS: Record<string, number> = {
            "💳": 1,
            "💰": 2,
            "💎": 6,
            "🔔": 12,
            "🍇": 12,
            "🍋": 12,
            "🍒": 12
        };

        const generateWeightedSymbol = () => {
            const totalWeight = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
            let random = Math.random() * totalWeight;

            for (const symbol of Object.keys(WEIGHTS)) {
                random -= WEIGHTS[symbol];
                if (random < 0) return symbol;
            }
            return "🍒"; // Fallback
        };

        const reels: string[][] = [];
        for (let i = 0; i < COLS; i++) {
            const col: string[] = [];
            for (let j = 0; j < ROWS; j++) {
                col.push(generateWeightedSymbol());
            }
            reels.push(col);
        }

        // Calculate Win
        let winAmount = 0;

        // 1. Calculate Bonus (Free Spins) independently
        // Count 💳 symbols
        let bonusSymbolCount = 0;
        reels.flat().forEach(s => {
            if (s === "💳") bonusSymbolCount++;
        });

        let freeSpinsWon = 0;
        if (bonusSymbolCount === 3) freeSpinsWon = 7;
        else if (bonusSymbolCount === 4) freeSpinsWon = 10;
        else if (bonusSymbolCount >= 5) freeSpinsWon = 20;

        // 2. Calculate Coin Win
        // Impossible Rules:
        // - Minimum 5 matches to get ANYTHING. (4 matches = 0)
        // - 5 matches = ~50% of bet (Loss)
        // - 6 matches = ~100% of bet (Break even)
        // - 7 matches = ~200% of bet (Profit)

        const symbolCounts: Record<string, number> = {};
        reels.flat().forEach(s => {
            if (s !== "💳") { // Don't count bonus symbol for coin wins
                symbolCounts[s] = (symbolCounts[s] || 0) + 1;
            }
        });

        Object.entries(symbolCounts).forEach(([symbol, count]) => {
            // Only pay for 5 or more (Impossible Mode)
            // Exception: High tier symbols might pay for 4? No, user wants user to "mostly get nothing".
            // Let's stick to 5+ for low/mid tier. 
            // Maybe 4+ for high tier only? User said "mostly nothing". Let's enable 4+ for high tier, 5+ for low.

            let returnPercentage = 0;

            if (symbol === "🍒" || symbol === "🍋" || symbol === "🍇" || symbol === "🔔") {
                // Low/Mid Tier - Need 5 matches minimum
                if (count < 5) returnPercentage = 0;
                else if (count === 5) returnPercentage = 0.50; // 50% of bet (Loss)
                else if (count === 6) returnPercentage = 1.00; // Break Even
                else if (count === 7) returnPercentage = 2.00; // Profit x2
                else if (count >= 8) returnPercentage = 5.00; // Big Win
            } else {
                // High Tier (💰, 💎) - Slightly more generous but still hard
                if (count === 4) returnPercentage = 0.5; // Loss (50%)
                else if (count === 5) returnPercentage = 1.5; // Profit (x1.5)
                else if (count >= 6) returnPercentage = 5.0; // Jackpot
            }

            // If count matches criteria:
            if (returnPercentage > 0) {
                winAmount += bet * returnPercentage;
            }
        });

        winAmount = Math.floor(winAmount);

        const newBalance = currentBalance + winAmount;
        const newFreeSpins = currentFreeSpins + freeSpinsWon;

        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                tebCoins: newBalance,
                leTebFreeSpins: newFreeSpins
            },
        });

        return NextResponse.json({
            reels,
            winAmount,
            newBalance,
            freeSpinsLeft: newFreeSpins,
            freeSpinsWon,
            gameState: "finished"
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
