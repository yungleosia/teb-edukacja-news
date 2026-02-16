import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const battles = await prisma.caseBattle.findMany({
            where: {
                // Show Waiting or Recently Finished
                OR: [
                    { status: "WAITING" },
                    { status: "FINISHED", createdAt: { gt: new Date(Date.now() - 1000 * 60 * 5) } } // Last 5 mins
                ]
            },
            include: {
                creator: { select: { name: true, image: true } },
                joiner: { select: { name: true, image: true } },
                winner: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" }
        });

        // Also fetch case info manually or include it? 
        // We need case image/name.
        // Let's optimize and include case data?
        // Prisma `include` can do relation if defined. 
        // Schema doesn't have relation `case Case @relation...` in CaseBattle. It has `caseId`.
        // We better add relation in schema or fetch separately.
        // For now, let's fetch matching cases.

        const caseIds = [...new Set(battles.map(b => b.caseId))];
        const cases = await prisma.case.findMany({ where: { id: { in: caseIds } } });
        const caseMap = Object.fromEntries(cases.map(c => [c.id, c]));

        const battlesWithCase = battles.map(b => ({
            ...b,
            case: caseMap[b.caseId]
        }));

        return NextResponse.json(battlesWithCase);

    } catch (e) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
