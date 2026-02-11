import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { visitorId } = await req.json();

        if (!visitorId) {
            return NextResponse.json({ message: "Missing visitorId" }, { status: 400 });
        }

        // Upsert visitor ping
        await prisma.activeVisitor.upsert({
            where: { id: visitorId },
            create: { id: visitorId, lastPing: new Date() },
            update: { lastPing: new Date() },
        });

        // Delete inactive visitors (older than 2 minutes)
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
        await prisma.activeVisitor.deleteMany({
            where: {
                lastPing: {
                    lt: twoMinutesAgo,
                },
            },
        });

        // Count active visitors
        const count = await prisma.activeVisitor.count();

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Error in heartbeat:", error);
        return NextResponse.json({ count: 1 }); // Fallback to 1 (you)
    }
}
