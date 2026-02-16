import { NextResponse } from "next/server";
import { verify, sign } from "jsonwebtoken";
import { cookies } from "next/headers";
import { calculateHandValue, Card } from "@/lib/blackjack";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "secret";

export async function POST(req: Request) {
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

    // Deal card
    const newCard = gameState.deck.pop();
    gameState.playerHand.push(newCard);

    const playerValue = calculateHandValue(gameState.playerHand);
    let message = "Dobrałeś kartę.";
    let status = "playing";

    if (playerValue > 21) {
        status = "finished";
        message = "FURA! Przegrywasz (Bust).";
        // No payout
    } else if (playerValue === 21) {
        // Auto stand? Usually player can choose, but 21 is best.
        // Let's keep it playing so they can click "Stand" manually to initiate dealer turn? 
        // Or auto-stand. Let's let them click Stand to feel in control or just auto-stand.
        // Standard is usually auto-stand on 21.
        // But for simplicity let's require them to click Stand.
        message = "Masz 21!";
    }

    // Update state
    gameState.status = status;

    // Mask dealer hand again
    const dealerVisibleHand = [gameState.dealerHand[0], { ...gameState.dealerHand[1], hidden: true, value: "?", numericValue: 0, suit: "hearts" }];

    const newToken = sign(gameState, JWT_SECRET);

    const response = NextResponse.json({
        playerHand: gameState.playerHand,
        dealerHand: status === "finished" ? gameState.dealerHand : dealerVisibleHand, // Reveal if bust
        gameState: status,
        message,
    });

    if (status === "finished") {
        response.cookies.set("blackjack_state", "", { maxAge: 0 });
    } else {
        response.cookies.set("blackjack_state", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 3600
        });
    }

    return response;
}
