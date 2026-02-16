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

    const { caseId } = await req.json();
    if (!caseId) return NextResponse.json({ error: "Missing caseId" }, { status: 400 });

    try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        const csCase = await prisma.case.findUnique({
            where: { id: caseId },
            include: { skins: true }
        });

        if (!user || !csCase) return NextResponse.json({ error: "Not found" }, { status: 404 });

        if (user.tebCoins < csCase.price) {
            return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
        }

        // Ensure Bot User Exists
        // We can create a dedicated bot user or use a fixed ID if known.
        // Let's create/find a Bot user.
        let botUser = await prisma.user.findUnique({ where: { email: "bot@teb-news.pl" } });
        if (!botUser) {
            botUser = await prisma.user.create({
                data: {
                    email: "bot@teb-news.pl",
                    name: "GabeN AI 🤖",
                    password: "bot-password-secure-hash", // Dummy
                    role: "USER",
                    image: "https://i.imgur.com/8xL1WjC.png" // Gaben or Robot image
                }
            });
        }

        // EXECUTE BATTLE (Instant Creation + Finish)
        const result = await prisma.$transaction(async (tx) => {
            // 1. Deduct User Balance
            await tx.user.update({
                where: { id: user.id },
                data: { tebCoins: { decrement: csCase.price } }
            });

            // 2. Simulate Rolls
            const userSkin = pickRandomSkin(csCase.skins);
            const botSkin = pickRandomSkin(csCase.skins);

            // 3. Determine Winner
            let winnerId = null;
            if (userSkin.price > botSkin.price) {
                winnerId = user.id;
            } else if (botSkin.price > userSkin.price) {
                winnerId = botUser!.id;
            } else {
                // Coin flip
                winnerId = Math.random() > 0.5 ? user.id : botUser!.id;
            }

            // 4. Distribute Rewards (Winner takes BOTH)
            if (winnerId === user.id) {
                await tx.userItem.create({ data: { userId: user.id, skinId: userSkin.id, status: "INVENTORY" } });
                await tx.userItem.create({ data: { userId: user.id, skinId: botSkin.id, status: "INVENTORY" } });
            }
            // If bot wins, items are lost to the void (or we give them to bot, but bot doesn't need inventory really)
            // Just don't give them to user.

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
                        create: {
                            roundNum: 1,
                            creatorSkinId: userSkin.id,
                            joinerSkinId: botSkin.id
                        }
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
