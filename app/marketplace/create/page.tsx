
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateListingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        category: "Elektronika",
        description: "",
        imageUrl: "" // Optional for now
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/marketplace", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/marketplace");
                router.refresh();
            } else {
                alert("Wystąpił błąd podczas dodawania ogłoszenia.");
            }
        } catch (error) {
            console.error(error);
            alert("Błąd połączenia.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-20 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-white">Wystaw Przedmiot</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tytuł ogłoszenia</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        placeholder="np. Matematyka 1 - Podręcznik"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Cena (TEBCoins)</label>
                        <div className="relative">
                            <input
                                type="number"
                                name="price"
                                required
                                min="1"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-4 pr-12 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono font-bold"
                                placeholder="50"
                            />
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-500 font-bold text-xs uppercase">
                                Coins
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Kategoria</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none"
                        >
                            <option value="Elektronika">Elektronika</option>
                            <option value="Inne">Inne</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Opis</label>
                    <textarea
                        name="description"
                        required
                        rows={5}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                        placeholder="Opisz dokładnie co sprzedajesz..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Link do zdjęcia (Opcjonalnie)</label>
                    <input
                        type="url"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-2">Na razie wspieramy tylko zewnętrzne linki do zdjęć.</p>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            "Dodaj Ogłoszenie"
                        )}
                    </button>
                    <button type="button" onClick={() => router.back()} className="w-full mt-4 text-gray-500 hover:text-white transition text-sm">
                        Anuluj
                    </button>
                </div>
            </form>
        </div>
    );
}
