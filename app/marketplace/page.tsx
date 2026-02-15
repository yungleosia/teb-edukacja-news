
import { MarketplaceItemCard } from "@/components/MarketplaceItemCard";
import Link from "next/link";

async function getItems() {
    // We need to fetch absolute URL if server-side, but usually relative works in fetching from client or use Prisma directly
    // Since this is a server component, we can use Prisma directly to save an API call overhead!
    // But for consistency with architecture let's stick to defined API or Prisma usage.
    // Using Prisma directly is better in Server Components.

    const { prisma } = await import("@/lib/prisma");
    const items = await prisma.marketplaceItem.findMany({
        where: { status: "AVAILABLE" },
        include: {
            seller: {
                select: { name: true, image: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });
    return items;
}

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
    const items = await getItems();

    return (
        <div className="container mx-auto px-6 py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
                        <span className="text-gradient">TEB</span> Marketplace
                    </h1>
                    <p className="text-gray-400 max-w-lg text-lg">
                        Kupuj i sprzedawaj podręczniki, notatki i inne przedmioty za <span className="text-yellow-500 font-bold">TEBCoins</span>.
                    </p>
                </div>
                <Link
                    href="/marketplace/create"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Wystaw Przedmiot
                </Link>
            </div>

            {/* Filters (Visual Only for MVP) */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-4 no-scrollbar">
                {["Wszystkie", "Elektronika", "Inne"].map((cat, i) => (
                    <button
                        key={cat}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition whitespace-nowrap ${i === 0 ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <MarketplaceItemCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Brak przedmiotów</h3>
                    <p className="text-gray-400 mb-6">Bądź pierwszy i wystaw coś na sprzedaż!</p>
                    <Link href="/marketplace/create" className="text-indigo-400 hover:text-indigo-300 font-medium">
                        + Dodaj ogłoszenie
                    </Link>
                </div>
            )}
        </div>
    );
}
