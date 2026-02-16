import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.tebCoins >= 10) {
            return NextResponse.json({ error: "Masz wystarczająco środków!" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { tebCoins: 100 },
        });

        return NextResponse.json({ newBalance: updatedUser.tebCoins, message: "Doładowano konto!" });

    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
