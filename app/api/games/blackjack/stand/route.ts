import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { calculateHandValue, Card } from "@/lib/blackjack";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "secret";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cookieStore = await cookies();
    const token = cookieStore.get("blackjack_state")?.value;

    if (!token) {
        return NextResponse.json({ error: "Game not found" }, { status: 400 });
    }

    let gameState: any;
    try {
        gameState = verify(token, JWT_SECRET);
    } catch (e) {
        return NextResponse.json({ error: "Invalid game state" }, { status: 400 });
    }

    if (gameState.status !== "playing") {
        return NextResponse.json({ error: "Game finished" }, { status: 400 });
    }

    // Dealer turn
    let dealerValue = calculateHandValue(gameState.dealerHand);

    // Dealer must hit on soft 17? Let's check rule. Usually stands on 17.
    // Simple rule: Dealer hits until >= 17.
    while (dealerValue < 17) {
        gameState.dealerHand.push(gameState.deck.pop());
        dealerValue = calculateHandValue(gameState.dealerHand);
    }

    const playerValue = calculateHandValue(gameState.playerHand);
    let message = "";
    let payout = 0;

    if (dealerValue > 21) {
        message = "Krupier ma Furę! Wygrywasz!";
        payout = gameState.bet * 2;
    } else if (playerValue > dealerValue) {
        message = `Wygrywasz! ${playerValue} vs ${dealerValue}`;
        payout = gameState.bet * 2;
    } else if (playerValue === dealerValue) {
        message = `Remis (Push). ${playerValue} vs ${dealerValue}`;
        payout = gameState.bet; // Return bet
    } else {
        message = `Przegrywasz. ${dealerValue} vs ${playerValue}`;
        payout = 0;
    }

    // Process payout
    if (payout > 0) {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { tebCoins: { increment: payout } }
        });
    }

    // Fetch new balance for UI
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { tebCoins: true }
    });

    const response = NextResponse.json({
        playerHand: gameState.playerHand,
        dealerHand: gameState.dealerHand, // Fully revealed
        gameState: "finished",
        message,
        newBalance: user?.tebCoins
    });

    // Clear cookie
    response.cookies.set("blackjack_state", "", { maxAge: 0 });

    return response;
}
