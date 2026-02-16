import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Helper to pick random skin based on weights
function pickRandomSkin(skins: any[]) {
    // Reuse logic from open route or simplify
    // Basic weighted random
    const RARITY_WEIGHTS: Record<string, number> = {
        "common": 79.92,
        "uncommon": 15.98,
        "rare": 3.2,
        "mythical": 0.64,
        "legendary": 0.26,
        "ancient": 0.06,
        "contraband": 0.04
    };

    const rand = Math.random() * 100;
    let selectedRarity = "common";
    let cumulative = 0;

    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
        cumulative += weight;
        if (rand <= cumulative) {
            selectedRarity = rarity;
            break;
        }
    }

    let possible = skins.filter(s => s.rarity === selectedRarity);
    if (possible.length === 0) possible = skins;

    return possible[Math.floor(Math.random() * possible.length)];
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { battleId } = await req.json();
    if (!battleId) return NextResponse.json({ error: "Missing battleId" }, { status: 400 });

    try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        // Check battle
        const battle = await prisma.caseBattle.findUnique({
            where: { id: battleId },
            include: { creator: true } // Need creator info? Not really, just ID.
        });

        if (!user || !battle) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (battle.status !== "WAITING") return NextResponse.json({ error: "Battle not available" }, { status: 400 });
        if (battle.creatorId === user.id) return NextResponse.json({ error: "Cannot create battle against yourself (yet)" }, { status: 400 }); // Optional restriction

        // Check rounds count
        const rounds = await prisma.caseBattleRound.findMany({ where: { battleId: battle.id } });
        const roundsCount = rounds.length;
        const totalCost = battle.casePrice * roundsCount;

        if (user.tebCoins < totalCost) {
            return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
        }

        // Get case skins for simulation
        const csCase = await prisma.case.findUnique({
            where: { id: battle.caseId },
            include: { skins: true }
        });

        if (!csCase) return NextResponse.json({ error: "Case data missing" }, { status: 500 });

        // EXECUTE BATTLE
        const result = await prisma.$transaction(async (tx) => {
            // 1. Deduct Joiner Balance
            await tx.user.update({
                where: { id: user.id },
                data: { tebCoins: { decrement: totalCost } }
            });

            // 2. Simulate Rolls
            const roundResults = [];
            let creatorTotal = 0;
            let joinerTotal = 0;

            for (const round of rounds) {
                const creatorSkin = pickRandomSkin(csCase.skins);
                const joinerSkin = pickRandomSkin(csCase.skins);

                creatorTotal += creatorSkin.price;
                joinerTotal += joinerSkin.price;

                roundResults.push({
                    id: round.id,
                    creatorSkinId: creatorSkin.id,
                    joinerSkinId: joinerSkin.id,
                    creatorSkin, joinerSkin
                });
            }

            // 3. Determine Winner
            let winnerId = null;
            if (creatorTotal > joinerTotal) {
                winnerId = battle.creatorId;
            } else if (joinerTotal > creatorTotal) {
                winnerId = user.id;
            } else {
                // Coin flip
                winnerId = Math.random() > 0.5 ? battle.creatorId : user.id;
            }

            // 4. Distribute Rewards (Winner takes ALL)
            for (const r of roundResults) {
                await tx.userItem.create({ data: { userId: winnerId, skinId: r.creatorSkin.id, status: "INVENTORY" } });
                await tx.userItem.create({ data: { userId: winnerId, skinId: r.joinerSkin.id, status: "INVENTORY" } });
            }

            // 5. Update Battle and Rounds
            const updatedBattle = await tx.caseBattle.update({
                where: { id: battleId },
                data: {
                    status: "FINISHED",
                    joinerId: user.id,
                    winnerId: winnerId,
                },
                include: { rounds: true }
            });

            // Update rounds individually
            for (const r of roundResults) {
                await tx.caseBattleRound.update({
                    where: { id: r.id },
                    data: {
                        creatorSkinId: r.creatorSkinId,
                        joinerSkinId: r.joinerSkinId
                    }
                });
            }

            return updatedBattle;
        });

        return NextResponse.json({ battle: result });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
