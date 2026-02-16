import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Helper to pick random skin based on weights
function pickRandomSkin(skins: any[]) {
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

    const { caseId, rounds: reqRounds } = await req.json();
    if (!caseId) return NextResponse.json({ error: "Missing caseId" }, { status: 400 });

    try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        const csCase = await prisma.case.findUnique({
            where: { id: caseId },
            include: { skins: true }
        });

        if (!user || !csCase) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const roundsCount = Number(reqRounds) || 1;
        const totalCost = csCase.price * roundsCount;

        if (user.tebCoins < totalCost) {
            return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
        }

        // Ensure Bot User Exists
        let botUser = await prisma.user.findUnique({ where: { email: "bot@teb-news.pl" } });
        if (!botUser) {
            botUser = await prisma.user.create({
                data: {
                    email: "bot@teb-news.pl",
                    name: "GabeN AI 🤖",
                    password: "bot-password-secure-hash", // Dummy
                    role: "USER",
                    image: "https://i.imgur.com/8xL1WjC.png"
                }
            });
        }

        // EXECUTE BATTLE (Instant Creation + Finish)
        const result = await prisma.$transaction(async (tx) => {
            // 1. Deduct User Balance
            await tx.user.update({
                where: { id: user.id },
                data: { tebCoins: { decrement: totalCost } }
            });

            // 2. Simulate Rolls
            const roundData = [];
            let creatorTotal = 0;
            let joinerTotal = 0;

            for (let i = 0; i < roundsCount; i++) {
                const userSkin = pickRandomSkin(csCase.skins);
                const botSkin = pickRandomSkin(csCase.skins);

                creatorTotal += userSkin.price;
                joinerTotal += botSkin.price;

                roundData.push({
                    roundNum: i + 1,
                    creatorSkinId: userSkin.id,
                    joinerSkinId: botSkin.id,
                    creatorSkin: userSkin, // temp for processing
                    joinerSkin: botSkin    // temp for processing
                });
            }

            // 3. Determine Winner
            let winnerId = null;
            if (creatorTotal > joinerTotal) {
                winnerId = user.id;
            } else if (joinerTotal > creatorTotal) {
                winnerId = botUser!.id;
            } else {
                // Coin flip
                winnerId = Math.random() > 0.5 ? user.id : botUser!.id;
            }

            // 4. Distribute Rewards (Winner takes ALL from ALL rounds)
            if (winnerId === user.id) {
                for (const round of roundData) {
                    await tx.userItem.create({ data: { userId: user.id, skinId: round.creatorSkin.id, status: "INVENTORY" } });
                    await tx.userItem.create({ data: { userId: user.id, skinId: round.joinerSkin.id, status: "INVENTORY" } });
                }
            }

            // 5. Create Battle Record (FINISHED immediately)
            return await tx.caseBattle.create({
                data: {
                    caseId: csCase.id,
                    casePrice: csCase.price,
                    creatorId: user.id,
                    joinerId: botUser!.id,
                    winnerId: winnerId,
                    status: "FINISHED",
                    createdAt: new Date(),
                    rounds: {
                        create: roundData.map(r => ({
                            roundNum: r.roundNum,
                            creatorSkinId: r.creatorSkinId,
                            joinerSkinId: r.joinerSkinId
                        }))
                    }
                }
            });
        });

        // Return battle ID to redirect
        return NextResponse.json({ battle: result });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
