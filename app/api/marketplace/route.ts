
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const items = await prisma.marketplaceItem.findMany({
            where: {
                status: "AVAILABLE",
            },
            include: {
                seller: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
    }
}

import { censorText } from "@/lib/censorship";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description, price, category, imageUrl } = body;

        if (!title || !description || !price || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const priceInt = parseInt(price);
        if (isNaN(priceInt) || priceInt < 0) {
            return NextResponse.json({ error: "Invalid price" }, { status: 400 });
        }

        if (priceInt > 5000) {
            return NextResponse.json({ error: "Price cannot exceed 5000 TebCoins" }, { status: 400 });
        }

        const item = await prisma.marketplaceItem.create({
            data: {
                title: censorText(title),
                description: censorText(description),
                price: priceInt,
                category,
                imageUrl,
                sellerId: session.user.id,
            },
        });

        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
    }
}
