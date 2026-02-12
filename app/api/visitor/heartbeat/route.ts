import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { visitorId } = await req.json();

        if (!visitorId) {
            return NextResponse.json({ message: "Missing visitorId" }, { status: 400 });
        }

        // Capture IP
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded ? forwarded.split(/, /)[0] : "127.0.0.1";

        // If user is logged in, update their lastIp
        // We need authOptions to get session here, but it's an edge route? 
        // No, it's a standard Node route. 
        // Dynamic import to avoid circular dep issues if any, though standard import is fine.
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("../../auth/[...nextauth]/route");
        const session = await getServerSession(authOptions);

        if (session && session.user?.id) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    lastIp: ip,
                    lastSeen: new Date()
                }
            });
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
