import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        const posts = await prisma.forumPost.findMany({
            orderBy: {
                createdAt: "desc",
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
                _count: {
                    select: {
                        comments: true,
                        likes: true,
                    }
                },
                likes: session?.user?.id ? {
                    where: {
                        userId: session.user.id
                    },
                    select: {
                        userId: true
                    }
                } : false
            },
        });

        const formattedPosts = posts.map(post => ({
            ...post,
            isLiked: post.likes ? post.likes.length > 0 : false,
            likes: undefined,
        }));

        return NextResponse.json(formattedPosts);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { title, content } = await req.json();

        if (!title || !content) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const post = await prisma.forumPost.create({
            data: {
                title,
                content,
                authorId: session.user.id,
            },
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
