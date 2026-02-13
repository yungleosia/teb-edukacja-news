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
                } : false,
                attachments: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        size: true
                    }
                }
            },
        });

        const formattedPosts = posts.map((post: any) => ({
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

        const { title, content, attachments } = await req.json();

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
                attachments: {
                    create: attachments?.map((att: any) => ({
                        data: Buffer.from(att.data, 'base64'),
                        name: att.name,
                        type: att.type,
                        size: att.size
                    }))
                }
            },
            include: {
                attachments: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        size: true
                    }
                }
            }
        });

        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
