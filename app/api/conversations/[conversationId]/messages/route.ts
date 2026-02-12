
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { conversationId } = await params;

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is part of the conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { users: true },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        const isParticipant = conversation.users.some(
            (user) => user.id === currentUser.id
        );

        if (!isParticipant) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        const users = conversation.users.map(user => ({
            id: user.id,
            name: user.name,
            image: user.image,
            lastSeen: user.lastSeen
        }));

        return NextResponse.json({ messages, users });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { conversationId } = await params;
        const payload = await request.json();
        const { body, image } = payload;

        if (!body && !image) {
            return NextResponse.json(
                { error: "Content or image is required" },
                { status: 400 }
            );
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if user is part of the conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { users: true },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        const isParticipant = conversation.users.some(
            (user) => user.id === currentUser.id
        );

        if (!isParticipant) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const newMessage = await prisma.message.create({
            data: {
                body,
                image,
                conversation: { connect: { id: conversationId } },
                sender: { connect: { id: currentUser.id } },
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
