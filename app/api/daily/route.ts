
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const COOLDOWN_HOURS = 24;

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { lastDailyDrop: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date();
    const lastDrop = user.lastDailyDrop ? new Date(user.lastDailyDrop) : null;
    let canClaim = true;
    let timeRemaining = 0;

    if (lastDrop) {
        const diff = now.getTime() - lastDrop.getTime();
        const hoursDiff = diff / (1000 * 60 * 60);
        if (hoursDiff < COOLDOWN_HOURS) {
            canClaim = false;
            timeRemaining = (COOLDOWN_HOURS * 60 * 60 * 1000) - diff;
        }
    }

    return NextResponse.json({ canClaim, timeRemaining });
}

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { lastDailyDrop: true, tebCoins: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const now = new Date();
    const lastDrop = user.lastDailyDrop ? new Date(user.lastDailyDrop) : null;

    if (lastDrop) {
        const diff = now.getTime() - lastDrop.getTime();
        const hoursDiff = diff / (1000 * 60 * 60);
        if (hoursDiff < COOLDOWN_HOURS) {
            return NextResponse.json({ error: "Cooldown active" }, { status: 400 });
        }
    }

    // Drop Logic
    const rand = Math.random() * 100; // 0 - 100
    let reward = { type: "COINS", amount: 0, message: "" };

    // Legendarny: Mento 8c (0.5%) -> 0 - 0.5
    // Teb coins – bardzo mało 10 (40%) -> 0.5 - 40.5
    // Teb coins – mało 20 (25%) -> 40.5 - 65.5
    // Teb coins – średnio 40 (15%) -> 65.5 - 80.5
    // Teb coins – sporo 80 (10%) -> 80.5 - 90.5
    // Teb coins – dużo 120 (5%) -> 90.5 - 95.5
    // Teb coins – bardzo dużo 160 (3%) -> 95.5 - 98.5
    // Teb coins – mega dużo 200 (1.5%) -> 98.5 - 100

    if (rand < 0.5) {
        reward = { type: "ITEM", amount: 0, message: "Legendarny: Mento 8c" };
        // Grant Item
        await prisma.marketplaceItem.create({
            data: {
                title: "Mento 8c",
                description: "Legendarny przedmiot z Daily Drop. Smakuje jak zwycięstwo.",
                price: 1000,
                category: "Inne",
                imageUrl: "https://placehold.co/400x400/indigo/white?text=Mento+8c", // Placeholder
                status: "AVAILABLE",
                sellerId: session.user.id
            }
        });
    } else if (rand < 40.5) {
        reward = { type: "COINS", amount: 10, message: "10 TEBCoins (Bardzo mało)" };
    } else if (rand < 65.5) {
        reward = { type: "COINS", amount: 20, message: "20 TEBCoins (Mało)" };
    } else if (rand < 80.5) {
        reward = { type: "COINS", amount: 40, message: "40 TEBCoins (Średnio)" };
    } else if (rand < 90.5) {
        reward = { type: "COINS", amount: 80, message: "80 TEBCoins (Sporo!)" };
    } else if (rand < 95.5) {
        reward = { type: "COINS", amount: 120, message: "120 TEBCoins (Dużo!)" };
    } else if (rand < 98.5) {
        reward = { type: "COINS", amount: 160, message: "160 TEBCoins (Bardzo dużo!)" };
    } else {
        reward = { type: "COINS", amount: 200, message: "200 TEBCoins (MEGA DUŻO!)" };
    }

    // Grant Coins if type is COINS
    if (reward.type === "COINS") {
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                tebCoins: { increment: reward.amount },
                lastDailyDrop: now
            }
        });
    } else {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { lastDailyDrop: now }
        });
    }

    return NextResponse.json({ success: true, reward });
}
