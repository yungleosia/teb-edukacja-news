import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, itemIds } = await req.json();

    // Support single or bulk
    const idsToSell = itemIds || (itemId ? [itemId] : []);

    if (idsToSell.length === 0) {
        return NextResponse.json({ error: "No items selected" }, { status: 400 });
    }

    try {
        // 1. Find Items & Verify Ownership
        const userItems = await prisma.userItem.findMany({
            where: {
                id: { in: idsToSell },
                user: { email: session.user.email },
                status: "INVENTORY"
            },
            include: { skin: true }
        });

        if (userItems.length === 0) {
            return NextResponse.json({ error: "No sellable items found" }, { status: 404 });
        }

        // 2. Calculate Total
        const totalSalePrice = userItems.reduce((sum, item) => sum + item.skin.price, 0);

        // 3. Transaction: Update Items & User Balance
        const [updatedBatch, updatedUser] = await prisma.$transaction([
            prisma.userItem.updateMany({
                where: { id: { in: userItems.map(i => i.id) } },
                data: { status: "SOLD" }
            }),
            prisma.user.update({
                where: { email: session.user.email },
                data: { tebCoins: { increment: totalSalePrice } }
            })
        ]);

        return NextResponse.json({
            success: true,
            message: `Sprzedano ${userItems.length} przedmiotów za ${totalSalePrice} TC`,
            newBalance: updatedUser.tebCoins
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
