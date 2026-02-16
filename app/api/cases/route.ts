import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const cases = await prisma.case.findMany({
            include: {
                skins: true
            }
        });
        return NextResponse.json(cases);
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
