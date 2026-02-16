import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const battle = await prisma.caseBattle.findUnique({
            where: { id },
            include: {
                creator: { select: { name: true, image: true } },
                joiner: { select: { name: true, image: true } },
                winner: { select: { id: true, name: true } },
                rounds: true
            }
        });

        if (!battle) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Resolve Skins for rounds
        // Rounds have skinIds but we need data
        const skinIds: string[] = [];
        battle.rounds.forEach(r => {
            if (r.creatorSkinId) skinIds.push(r.creatorSkinId);
            if (r.joinerSkinId) skinIds.push(r.joinerSkinId);
        });

        const skins = await prisma.skin.findMany({ where: { id: { in: skinIds } } });
        const skinMap = Object.fromEntries(skins.map(s => [s.id, s]));

        // Augment rounds
        const roundsWithSkins = battle.rounds.map(r => ({
            ...r,
            creatorSkin: r.creatorSkinId ? skinMap[r.creatorSkinId] : null,
            joinerSkin: r.joinerSkinId ? skinMap[r.joinerSkinId] : null,
        }));

        // Also fetch Case info
        const csCase = await prisma.case.findUnique({ where: { id: battle.caseId }, include: { skins: true } });

        return NextResponse.json({
            ...battle,
            rounds: roundsWithSkins,
            case: csCase
        });

    } catch (e) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
