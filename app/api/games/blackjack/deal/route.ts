import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDeck, calculateHandValue, Card } from "@/lib/blackjack";
import { sign } from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "secret";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bet } = await req.json();

    if (!bet || bet <= 0) {
        return NextResponse.json({ error: "Invalid bet" }, { status: 400 });
    }

    // 1. Check Balance
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { tebCoins: true }
    });

    if (!user || user.tebCoins < bet) {
        return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
    }

    // 2. Deduct Bet
    await prisma.user.update({
        where: { id: session.user.id },
        data: { tebCoins: { decrement: bet } }
    });

    // 3. Init Game
    const deck = createDeck();
    const playerHand = [deck.pop()!, deck.pop()!];
    const dealerHand = [deck.pop()!, deck.pop()!];

    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    const isPlayerBlackjack = playerValue === 21;
    const isDealerBlackjack = dealerValue === 21;

    let gameStateStatus = "playing";
    let message = "Gra rozpoczęta. Twój ruch.";
    let payout = 0;

    if (isPlayerBlackjack) {
        if (isDealerBlackjack) {
            // Push
            payout = bet;
            gameStateStatus = "finished";
            message = "Remis! Oboje macie Blackjacka.";
        } else {
            // Player wins 3:2
            payout = Math.floor(bet * 2.5);
            gameStateStatus = "finished";
            message = "BLACKJACK! Wygrywasz!";
        }
    } else if (isDealerBlackjack) {
        // Dealer wins immediately (unless insurance, but simplifying)
        // Actually, usually dealer peeks. If dealer has BJ and player doesn't, player loses.
        // We will reveal it immediately for simplicity.
        gameStateStatus = "finished";
        message = "Krupier ma Blackjacka. Przegrywasz.";
    }

    if (payout > 0) {
        await prisma.user.update({
            where: { id: session.user.id },
            data: { tebCoins: { increment: payout } }
        });
    }

    // Hide dealer's second card only if game continues
    const dealerVisibleHand = gameStateStatus === "playing"
        ? [dealerHand[0], { ...dealerHand[1], hidden: true, value: "?", numericValue: 0, suit: "hearts" }]
        : dealerHand;

    const gameState = {
        deck,
        playerHand,
        dealerHand,
        bet,
        status: gameStateStatus
    };

    const token = sign(gameState, process.env.NEXTAUTH_SECRET || "secret");

    const response = NextResponse.json({
        playerHand,
        dealerHand: dealerVisibleHand,
        newBalance: payout > 0 ? user.tebCoins - bet + payout : user.tebCoins - bet,
        gameState: gameStateStatus,
        message,
    });

    response.cookies.set("blackjack_state", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 3600 // 1 hour
    });

    if (gameStateStatus === "finished") {
        response.cookies.set("blackjack_state", "", { maxAge: 0 }); // Clear cookie
    }

    return response;
}
