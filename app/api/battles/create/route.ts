import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseId, rounds: reqRounds } = await req.json();
    if (!caseId) return NextResponse.json({ error: "Missing caseId" }, { status: 400 });

    try {
        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        const csCase = await prisma.case.findUnique({ where: { id: caseId } });

        if (!user || !csCase) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Deduct balance and create battle
        const roundsCount = Number(reqRounds) || 1;
        const totalCost = csCase.price * roundsCount;

        if (user.tebCoins < totalCost) {
            return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
        }

        const battle = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: user.id },
                data: { tebCoins: { decrement: totalCost } }
            });

            return await tx.caseBattle.create({
                data: {
                    caseId: csCase.id,
                    casePrice: csCase.price,
                    creatorId: user.id,
                    status: "WAITING",
                    rounds: {
                        create: Array.from({ length: roundsCount }).map((_, i) => ({
                            roundNum: i + 1
                        }))
                    }
                }
            });
        });

        return NextResponse.json({ battle });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
