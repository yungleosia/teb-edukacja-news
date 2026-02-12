
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await params;

    const post = await prisma.forumPost.findUnique({
        where: { id: postId },
        select: { authorId: true }
    });

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    // Allow if user is author OR admin
    if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.forumPost.delete({
        where: { id: postId }
    });

    return NextResponse.json({ success: true });
}
