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
        // Add Bonus Symbol 💳
        const EXTENDED_SYMBOLS = [...SYMBOLS, "💳"];
        const reels: string[][] = [];
        for (let i = 0; i < COLS; i++) {
            const col: string[] = [];
            for (let j = 0; j < ROWS; j++) {
                // Adjust weights? For now equal chance
                const randomIndex = Math.floor(Math.random() * EXTENDED_SYMBOLS.length);
                col.push(EXTENDED_SYMBOLS[randomIndex]);
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
        // User requested rebalancing:
        // "zmiejsz szanse na wygrywanie ... jak krecisz za 150 to czasem ma ci wypasc 70 albo np 20"
        // Interpretation: 
        // - High chance of LOSS (0 win)
        // - Moderate chance of PARTIAL win (< bet)
        // - Low chance of PROFIT (> bet)

        // To achieve this deterministically while keeping the "slot" feel, we can:
        // A. Use the symbols to determine win, but adjust symbol weights so matches are rare.
        // B. Decide the win outcome FIRST, then rig the reels. (Harder to implement nicely)
        // C. Use the current symbol logic but tweak the multiplier/values to be very low, so even a match pays little.

        // Let's go with C (Symbol logic) but make it harder.
        // Current logic: 3 of a kind everywhere pays.
        // Let's make it: 3 of a kind pays heavily reduced amount (partial win).
        // 4 or 5 of a kind pays profit.

        const symbolCounts: Record<string, number> = {};
        reels.flat().forEach(s => {
            if (s !== "💳") { // Don't count bonus symbol for coin wins
                symbolCounts[s] = (symbolCounts[s] || 0) + 1;
            }
        });

        // Adjusted Values for rebalancing
        // 3 matches = ~10-50% of bet (Partial win)
        // 4 matches = ~80-150% of bet (Break even / small profit)
        // 5 matches = Big win

        Object.entries(symbolCounts).forEach(([symbol, count]) => {
            // Only pay for 3 or more
            if (count >= 3) {
                const baseValue = SYMBOL_VALUES[symbol] || 0;

                // Multiplier logic rework
                // 3 count: very low multiplier (e.g. 0.2)
                // 4 count: medium multiplier (e.g. 1.0)
                // 5+ count: high multiplier (e.g. 3.0)

                let multiplier = 0;
                if (count === 3) multiplier = 0.4; // 3 cherries (2 value) * 0.4 * (bet/10) = very low. 
                // Example: Bet 100. Base bet unit = 10. 
                // 3x 💰 (50) -> 50 * 0.4 * 10 = 200 (2x bet). Too high.

                // Let's rethink logic based on "bet" directly.
                // value * multiplier * (bet / 10 is implied scaling)

                // Revised Multipliers to force low wins often
                if (count === 3) multiplier = 0.1; // 3 matches: 10% of value
                else if (count === 4) multiplier = 0.5;
                else if (count >= 5) multiplier = 2.0;

                // Special case for high value symbols?
                if (symbol === "💰" || symbol === "💎") {
                    // increase slightly for rare symbols
                    multiplier *= 1.5;
                }

                winAmount += baseValue * multiplier * (bet / 5);
            }
        });

        // Force clamp "Partial wins" if they accidentally get too high? 
        // Nah, randomness is fine. But let's check matches.

        // If NO matches, win is 0.
        // With random reels, matches of 3 are somewhat common. 
        // Let's verify math:
        // Bet 100.
        // 3x 🍇(10). 10 * 0.1 * (100/5) = 1 * 20 = 20. (Loss of 80). CORRECT.
        // 3x 💰(50). 50 * 0.1 * 1.5 * 20 = 7.5 * 20 = 150. (Profit 50). Rare event.
        // 4x 🍒(2). 2 * 0.5 * 20 = 20. (Loss of 80).
        // Looks like "Partial Win" is the norm for small matches now.

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
