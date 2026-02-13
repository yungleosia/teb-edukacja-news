import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const attachment = await prisma.forumAttachment.findUnique({
            where: { id },
        });

        if (!attachment) {
            return new NextResponse("File not found", { status: 404 });
        }

        const headers = new Headers();
        headers.set("Content-Type", attachment.type);
        headers.set("Content-Disposition", `attachment; filename="${attachment.name}"`);
        headers.set("Content-Length", attachment.size.toString());

        return new NextResponse(attachment.data as any, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
