
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ChatWindow } from "@/components/ChatWindow";

export default async function ConversationPage({
    params,
}: {
    params: Promise<{ conversationId: string }>;
}) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const { conversationId } = await params;

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    lastSeen: true,
                },
            },
            messages: {
                orderBy: {
                    createdAt: "asc",
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            lastSeen: true,
                        },
                    },
                },
            },
        },
    });

    if (!conversation) {
        notFound();
    }

    // Check if participant
    const isParticipant = conversation.users.some(
        (u) => u.id === session.user.id
    );

    if (!isParticipant) {
        redirect("/messages");
    }

    const otherUser = conversation.users.find((u) => u.id !== session.user.id);
    const currentUser = conversation.users.find((u) => u.id === session.user.id);

    if (!otherUser || !currentUser) {
        return <div>Error loading users</div>;
    }

    return (
        <div className="h-full">
            <ChatWindow
                conversationId={conversation.id}
                initialMessages={conversation.messages}
                currentUser={currentUser}
                otherUser={otherUser}
            />
        </div>
    );
}
