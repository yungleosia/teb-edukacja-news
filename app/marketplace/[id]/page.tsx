
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import Link from "next/link";
import { BuyButton } from "@/components/BuyButton"; // We'll create this client component

async function getItem(id: string) {
    const item = await prisma.marketplaceItem.findUnique({
        where: { id },
        include: {
            seller: {
                select: { name: true, image: true, email: true }
            }
        }
    });
    return item;
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const item = await getItem(id);

    if (!item) {
        notFound();
    }

    const isOwner = session?.user?.id === item.sellerId;
    const canBuy = !isOwner && item.status === "AVAILABLE";

    return (
        <div className="container mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link href="/marketplace" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Wróć do giełdy
            </Link>

            <div className="grid md:grid-cols-2 gap-12 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
                {/* Image Section */}
                <div className="rounded-2xl overflow-hidden bg-black/40 border border-white/5 aspect-square relative flex items-center justify-center">
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-gray-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    )}
                    {item.status === "SOLD" && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-3xl font-bold text-red-500 uppercase rotate-[-15deg] border-4 border-red-500 px-6 py-2 rounded-xl">Sprzedane</span>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="flex flex-col">
                    <div className="mb-auto">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                                {item.category}
                            </span>
                            <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: pl })}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">{item.title}</h1>

                        <div className="flex items-end gap-3 mb-8">
                            <span className="text-5xl font-bold text-yellow-500">{item.price}</span>
                            <span className="text-lg font-bold text-yellow-500/80 mb-2">TEBCoins</span>
                        </div>

                        <div className="prose prose-invert max-w-none text-gray-300 mb-8">
                            <p className="whitespace-pre-wrap">{item.description}</p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden">
                                    {item.seller.image ? (
                                        <img src={item.seller.image} alt="Seller" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-bold text-indigo-300">{item.seller.name?.[0]}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Sprzedający</p>
                                    <p className="font-bold text-white">{item.seller.name}</p>
                                </div>
                            </div>

                            {/* Needed for secure messaging link or profile */}
                            <Link href={`/profile/${item.sellerId}`} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition">
                                Zobacz profil
                            </Link>
                        </div>

                        {session ? (
                            <div className="mt-4">
                                {isOwner ? (
                                    <button disabled className="w-full py-4 bg-gray-700/50 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                                        To Twoje ogłoszenie
                                    </button>
                                ) : item.status === "SOLD" ? (
                                    <button disabled className="w-full py-4 bg-gray-700/50 text-gray-400 font-bold rounded-xl cursor-not-allowed">
                                        Przedmiot sprzedany
                                    </button>
                                ) : (
                                    <BuyButton itemId={item.id} price={item.price} />
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="block w-full text-center py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition">
                                Zaloguj się, aby kupić
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
