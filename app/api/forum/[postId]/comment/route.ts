import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const { postId } = await params;

        const comments = await prisma.comment.findMany({
            where: {
                postId: postId,
            },
            orderBy: {
                createdAt: "asc",
            },
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                        id: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ postId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { postId } = await params;
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json(
                { message: "Content is required" },
                { status: 400 }
            );
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId: postId,
                authorId: session.user.id,
            },
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                        id: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
