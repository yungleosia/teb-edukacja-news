
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Use a transaction to ensure data integrity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get the item and lock it (if possible, but Prisma basic doesn't lock easily, check logic)
            const item = await tx.marketplaceItem.findUnique({
                where: { id },
                include: { seller: true }
            });

            if (!item) {
                throw new Error("Item not found");
            }

            if (item.status !== "AVAILABLE") {
                throw new Error("Item is already sold");
            }

            if (item.sellerId === session.user.id) {
                throw new Error("Cannot buy your own item");
            }

            // 2. Check buyer balance
            const buyer = await tx.user.findUnique({
                where: { id: session.user.id }
            });

            if (!buyer || buyer.tebCoins < item.price) {
                throw new Error("Insufficient funds");
            }

            // 3. Transfer coins
            // Deduct from buyer
            await tx.user.update({
                where: { id: buyer.id },
                data: { tebCoins: { decrement: item.price } }
            });

            // Add to seller
            await tx.user.update({
                where: { id: item.sellerId },
                data: { tebCoins: { increment: item.price } }
            });

            // 4. Update item status
            const updatedItem = await tx.marketplaceItem.update({
                where: { id: item.id },
                data: {
                    status: "SOLD",
                    buyerId: buyer.id
                }
            });

            // 5. Create a conversation (optional but good UX)
            // We can do this outside transaction or inside. Let's keep it simple here.

            return updatedItem;
        });

        // After successful transaction, create a system message or init conversation?
        // For now just return success.

        return NextResponse.json(result);

    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Transaction failed" }, { status: 400 });
    }
}
