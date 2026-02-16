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
        // Hardcore Mode Tuning:
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
        // Hardcore Rules:
        // - Minimum 4 matches to get ANYTHING.
        // - 4 matches = ~35%-40% of bet (Loss)
        // - 5 matches = ~60%-80% of bet (Loss)
        // - 6 matches = ~120% of bet (Small Profit)

        const symbolCounts: Record<string, number> = {};
        reels.flat().forEach(s => {
            if (s !== "💳") { // Don't count bonus symbol for coin wins
                symbolCounts[s] = (symbolCounts[s] || 0) + 1;
            }
        });

        Object.entries(symbolCounts).forEach(([symbol, count]) => {
            // Only pay for 4 or more
            if (count >= 4) {
                // PREFERRED: Direct percentage calculation based on tier.
                let returnPercentage = 0;

                if (symbol === "🍒" || symbol === "🍋" || symbol === "🍇" || symbol === "🔔") {
                    // Standard / Low Tier
                    if (count === 4) returnPercentage = 0.40; // 40% of bet (Loss)
                    else if (count === 5) returnPercentage = 0.80; // 80% of bet (Loss)
                    else if (count === 6) returnPercentage = 1.50; // 50% Profit
                    else if (count >= 7) returnPercentage = 3.00; // Big Win
                } else {
                    // High Tier (💰, 💎)
                    // Matches of 4+ for these are VERY rare.
                    if (count === 4) returnPercentage = 1.0; // Break even
                    else if (count === 5) returnPercentage = 3.0; // Nice win
                    else if (count >= 6) returnPercentage = 10.0; // Jackpot
                }

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
