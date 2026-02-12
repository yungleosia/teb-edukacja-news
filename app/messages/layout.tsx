
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ConversationList } from "@/components/ConversationList";
import { redirect } from "next/navigation";

export default async function MessagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const conversations = await prisma.conversation.findMany({
        where: {
            users: {
                some: {
                    id: session.user.id,
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
                    createdAt: 'desc'
                },
                take: 1
            }
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return (
        <div className="flex h-screen pt-20 bg-[#0a0a0a]">
            <ConversationList conversations={conversations} currentUserId={session.user.id} />
            <main className="flex-1 relative">
                {children}
            </main>
        </div>
    );
}
