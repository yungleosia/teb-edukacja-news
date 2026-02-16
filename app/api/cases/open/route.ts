import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const RARITY_WEIGHTS: Record<string, number> = {
    "common": 79.92,
    "uncommon": 15.98,
    "rare": 3.2,
    "mythical": 0.64,
    "legendary": 0.26,
    "ancient": 0.06,
    "contraband": 0.04 // Extremely rare
};

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId } = await req.json();

    if (!caseId) {
        return NextResponse.json({ error: "Missing Case ID" }, { status: 400 });
    }

    try {
        // 1. Fetch User & Case
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });
        const csCase = await prisma.case.findUnique({
            where: { id: caseId },
            include: { skins: true }
        });

        if (!user || !csCase) {
            return NextResponse.json({ error: "User or Case not found" }, { status: 404 });
        }

        // 2. Check Balance
        if (user.tebCoins < csCase.price) {
            return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
        }

        // 3. Deduct Balance
        await prisma.user.update({
            where: { id: user.id },
            data: { tebCoins: { decrement: csCase.price } }
        });

        // 4. Determine Rarity
        // Normalize weights if skins don't cover all rarities? 
        // Simplification: Filter skins by available rarities in this case, then re-distribute weights or just use absolute weights?
        // Better: Roll a number 0-100. Check against thresholds. 
        // THEN pick a random skin from that rarity.

        const rand = Math.random() * 100;
        let selectedRarity = "common";
        let cumulative = 0;

        // Sort weights for reliable accumulation
        const sortedRarities = Object.entries(RARITY_WEIGHTS).sort((a, b) => a[1] - b[1]); // Ascending? No, needs standard probability check.

        // Standard accumulation:
        // Common (80) -> 0..80
        // Uncommon (16) -> 80..96

        for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
            cumulative += weight;
            if (rand <= cumulative) {
                selectedRarity = rarity;
                break;
            }
        }

        // 5. Select Skin
        let possibleSkins = csCase.skins.filter(s => s.rarity === selectedRarity);

        // Fallback: If case has no skins of selected rarity (e.g. only ancient), pick random from ALL skins.
        if (possibleSkins.length === 0) {
            possibleSkins = csCase.skins;
        }

        const wonSkin = possibleSkins[Math.floor(Math.random() * possibleSkins.length)];

        // 6. Give Item
        const userItem = await prisma.userItem.create({
            data: {
                userId: user.id,
                skinId: wonSkin.id,
                status: "INVENTORY"
            }
        });

        // 7. Return Result
        // We might want to return "rolledItems" for animation (like a spinner stripping past)
        // We can generate some fake items for the spinner + the real winner at the end.

        const updatedUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { tebCoins: true }
        });

        return NextResponse.json({
            wonSkin,
            newBalance: updatedUser?.tebCoins,
            userItem
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
