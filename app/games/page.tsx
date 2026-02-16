"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card3D, CardBody, CardItem } from "@/components/ui/card-3d";
import { cn } from "@/lib/utils";

export default function GamesPage() {
    const { data: session, status } = useSession();

    if (status === "unauthenticated") {
        redirect("/login");
    }

    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 bg-[#0f172a] text-white overflow-hidden relative">
            {/* Dynamic Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        filter: ["hue-rotate(0deg)", "hue-rotate(90deg)", "hue-rotate(0deg)"]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/50 to-slate-950 blur-3xl opacity-50"
                />
                <div className="absolute top-10 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }}></div>
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 drop-shadow-2xl">
                            ARCADE
                        </span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                        Witaj w strefie gier. Postaw swoje <span className="text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded">TebCoins</span> i sprawdź swoje szczęście.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {/* Blackjack Card */}
                    <Link href="/games/blackjack">
                        <Card3D className="group/card w-full h-auto cursor-pointer">
                            <CardBody className="bg-gradient-to-br from-slate-800 to-slate-900 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black w-auto sm:w-[22rem] h-auto rounded-xl p-6 border border-white/10">
                                <CardItem
                                    translateZ="50"
                                    className="text-xl font-bold text-neutral-600 dark:text-white"
                                >
                                    Blackjack
                                </CardItem>
                                <CardItem
                                    as="p"
                                    translateZ="60"
                                    className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                                >
                                    Klasyczna gra karciana. Pokonaj krupiera uzyskując 21 punktów.
                                </CardItem>
                                <CardItem translateZ="100" className="w-full mt-4">
                                    <div className="h-40 w-full rounded-xl group-hover/card:shadow-xl bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop')]" />
                                </CardItem>
                                <div className="flex justify-between items-center mt-10">
                                    <CardItem
                                        translateZ={20}
                                        as="div"
                                        className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                                    >
                                        Popularne →
                                    </CardItem>
                                    <CardItem
                                        translateZ={20}
                                        as="button"
                                        className="px-4 py-2 rounded-xl bg-white dark:bg-white dark:text-black text-black text-xs font-bold"
                                    >
                                        Graj teraz
                                    </CardItem>
                                </div>
                            </CardBody>
                        </Card3D>
                    </Link>

                    {/* Le Teb Slots Card - NEW */}
                    <Link href="/games/le-teb">
                        <Card3D className="group/card w-full h-auto cursor-pointer">
                            <CardBody className="bg-gradient-to-br from-indigo-900 to-purple-900 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.1] dark:bg-black w-auto sm:w-[22rem] h-auto rounded-xl p-6 border border-white/10">
                                <CardItem
                                    translateZ="50"
                                    className="text-xl font-bold text-neutral-600 dark:text-white"
                                >
                                    Le Teb Slots
                                </CardItem>
                                <CardItem
                                    as="p"
                                    translateZ="60"
                                    className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                                >
                                    Zakręć bębnami i wygraj fortunę! Tryb inspirowany Le Bandit.
                                </CardItem>
                                <CardItem translateZ="100" className="w-full mt-4">
                                    <div className="h-40 w-full rounded-xl group-hover/card:shadow-xl bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=2070&auto=format&fit=crop')]" />
                                </CardItem>
                                <div className="flex justify-between items-center mt-10">
                                    <CardItem
                                        translateZ={20}
                                        as="div"
                                        className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                                    >
                                        Nowość! →
                                    </CardItem>
                                    <CardItem
                                        translateZ={20}
                                        as="button"
                                        className="px-4 py-2 rounded-xl bg-white dark:bg-white dark:text-black text-black text-xs font-bold"
                                    >
                                        Graj teraz
                                    </CardItem>
                                </div>
                            </CardBody>
                        </Card3D>
                    </Link>

                    {/* Coming Soon Card */}
                    <Card3D className="group/card w-full h-auto opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                        <CardBody className="bg-gradient-to-br from-slate-800 to-slate-900 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black w-auto sm:w-[22rem] h-auto rounded-xl p-6 border border-white/10">
                            <CardItem
                                translateZ="50"
                                className="text-xl font-bold text-neutral-600 dark:text-white"
                            >
                                Ruletka
                            </CardItem>
                            <CardItem
                                as="p"
                                translateZ="60"
                                className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                            >
                                Królowa kasyn. Obstawiaj kolory i liczby. Wkrótce...
                            </CardItem>
                            <CardItem translateZ="100" className="w-full mt-4">
                                <div className="h-40 w-full rounded-xl group-hover/card:shadow-xl bg-cover bg-center bg-[url('https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=2070&auto=format&fit=crop')] flex items-center justify-center">
                                    <span className="bg-black/50 px-4 py-2 rounded-full text-white font-bold backdrop-blur-md">COMING SOON</span>
                                </div>
                            </CardItem>
                        </CardBody>
                    </Card3D>
                </div>
            </div>
        </div>
    );
}

