import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await req.json();

    try {
        // 1. Find Item & Verify Ownership
        const userItem = await prisma.userItem.findUnique({
            where: { id: itemId },
            include: { skin: true, user: true }
        });

        if (!userItem) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        if (userItem.user.email !== session.user.email) {
            return NextResponse.json({ error: "Not your item" }, { status: 403 });
        }

        if (userItem.status !== "INVENTORY") {
            return NextResponse.json({ error: "Item already sold or not available" }, { status: 400 });
        }

        // 2. Mark as Sold (or delete)
        // Let's delete it to keep DB clean or mark as SOLD? 
        // User requested "sell for tebcoins". 
        // We'll mark as SOLD for history, or delete. 
        // Let's delete to prevent massive table growth if not needed.
        // Actually, marking as SOLD is better for history.

        await prisma.userItem.update({
            where: { id: itemId },
            data: { status: "SOLD" }
        });

        // 3. Add Balance
        const salePrice = userItem.skin.price; // Full price? Or cut? Usually full price in these simulated games.

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { tebCoins: { increment: salePrice } }
        });

        return NextResponse.json({
            success: true,
            message: `Sprzedano ${userItem.skin.name} za ${salePrice} TC`,
            newBalance: updatedUser.tebCoins
        });

    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
