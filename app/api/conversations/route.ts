
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                users: {
                    some: {
                        id: currentUser.id,
                    },
                },
            },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            );
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (currentUser.id === userId) {
            return NextResponse.json(
                { error: "Cannot start conversation with yourself" },
                { status: 400 }
            );
        }

        // Check if conversation already exists
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    {
                        users: {
                            some: {
                                id: currentUser.id,
                            },
                        },
                    },
                    {
                        users: {
                            some: {
                                id: userId,
                            },
                        },
                    },
                ],
            },
            include: {
                users: true,
            },
        });

        if (existingConversation) {
            return NextResponse.json(existingConversation);
        }

        const newConversation = await prisma.conversation.create({
            data: {
                users: {
                    connect: [
                        { id: currentUser.id },
                        { id: userId },
                    ],
                },
            },
            include: {
                users: true,
            },
        });

        return NextResponse.json(newConversation);

    } catch (error) {
        console.error("Error creating conversation:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
