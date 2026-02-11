import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { image } = body;

        // Basic validation for base64 string
        if (!image || typeof image !== "string") {
            return new NextResponse("Invalid image data", { status: 400 });
        }

        // Optional: Check size rough estimate (Base64 string length * 0.75 = bytes)
        // Limit to ~1MB (approx 1.3 million chars)
        if (image.length > 1500000) {
            return new NextResponse("Image too large. Please use an image under 1MB.", { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: { image: image },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("[USER_IMAGE_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
