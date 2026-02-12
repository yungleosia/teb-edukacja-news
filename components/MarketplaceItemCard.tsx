
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

interface MarketplaceItem {
    id: string;
    title: string;
    price: number;
    category: string;
    imageUrl: string | null;
    createdAt: string | Date;
    seller: {
        name: string | null;
        image: string | null;
    };
}

export function MarketplaceItemCard({ item }: { item: MarketplaceItem }) {
    return (
        <Link href={`/marketplace/${item.id}`} className="group relative block bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
            {/* Image Aspect Ratio Container */}
            <div className="aspect-[4/3] bg-black/40 relative overflow-hidden">
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-medium text-white border border-white/10">
                    {item.category}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition line-clamp-1">{item.title}</h3>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-yellow-500">{item.price}</span>
                        <span className="text-xs font-bold text-yellow-500/80 uppercase tracking-wider">TEB</span>
                    </div>
                    <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: pl })}
                    </span>
                </div>

                {/* Seller Info */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden">
                        {item.seller.image ? (
                            <img src={item.seller.image} alt={item.seller.name || "Seller"} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] font-bold text-indigo-300">{item.seller.name?.[0]}</span>
                        )}
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-gray-300 transition truncate max-w-[120px]">
                        {item.seller.name}
                    </span>
                </div>
            </div>
        </Link>
    );
}
