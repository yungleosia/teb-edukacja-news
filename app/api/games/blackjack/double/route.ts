import { NextResponse } from "next/server";
import { verify, sign } from "jsonwebtoken";
import { cookies } from "next/headers";
import { calculateHandValue } from "@/lib/blackjack";
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

    // Double Down Rules:
    // 1. Can only double on first 2 cards (UI handles this usually, but good to check)
    if (gameState.playerHand.length !== 2) {
        return NextResponse.json({ error: "Can only double on initial hand" }, { status: 400 });
    }

    // 2. Check balance for extra bet
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { tebCoins: true }
    });

    if (!user || user.tebCoins < gameState.bet) {
        return NextResponse.json({ error: "Brak wystarczających środków na podwojenie!" }, { status: 400 });
    }

    // 3. Deduct extra bet
    await prisma.user.update({
        where: { id: session.user.id },
        data: { tebCoins: { decrement: gameState.bet } }
    });

    gameState.bet *= 2; // Double the pot

    // 4. Deal ONE card
    const newCard = gameState.deck.pop();
    gameState.playerHand.push(newCard);

    const playerValue = calculateHandValue(gameState.playerHand);
    let message = "Podwoiłeś stawkę!";
    let status = "playing"; // Will switch to finished effectively in client logic or auto-stand? 
    // Actually, "Double" implies auto-stand after one card unless bust.

    // We need to execute the Dealer turn immediately unless player busted.
    // If player busted, game over.
    // If player didn't bust, Dealer plays.

    if (playerValue > 21) {
        status = "finished";
        message = "FURA! (Double Down Failed)";
        // No payout
    } else {
        // Dealer Plays immediately
        let dealerValue = calculateHandValue(gameState.dealerHand);
        while (dealerValue < 17) {
            gameState.dealerHand.push(gameState.deck.pop());
            dealerValue = calculateHandValue(gameState.dealerHand);
        }

        status = "finished";
        let payout = 0;

        if (dealerValue > 21) {
            message = "Krupier ma Furę! Wygrywasz podwójnie!";
            payout = gameState.bet * 2;
        } else if (playerValue > dealerValue) {
            message = `Wygrywasz! ${playerValue} vs ${dealerValue}`;
            payout = gameState.bet * 2;
        } else if (playerValue === dealerValue) {
            message = `Remis (Push). ${playerValue} vs ${dealerValue}`;
            payout = gameState.bet; // Return doubled bet
        } else {
            message = `Przegrywasz. ${dealerValue} vs ${playerValue}`;
            payout = 0;
        }

        if (payout > 0) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { tebCoins: { increment: payout } }
            });
        }
    }

    // New balance for UI
    const updatedUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { tebCoins: true }
    });

    const response = NextResponse.json({
        playerHand: gameState.playerHand,
        dealerHand: gameState.dealerHand, // Fully revealed
        gameState: status,
        message,
        newBalance: updatedUser?.tebCoins
    });

    if (status === "finished") {
        response.cookies.set("blackjack_state", "", { maxAge: 0 });
    } else {
        // Should not happen for proper Double Down, usually ends turn.
        const newToken = sign(gameState, JWT_SECRET);
        response.cookies.set("blackjack_state", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 3600
        });
    }

    return response;
}
