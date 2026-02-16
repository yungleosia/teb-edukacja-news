"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type CardSuit = "hearts" | "diamonds" | "clubs" | "spades";
export type CardValue = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

interface PlayingCardProps {
    suit: CardSuit;
    value: string;
    hidden?: boolean;
    className?: string;
    index?: number;
}

const suitIcons: Record<CardSuit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
};

const suitColors: Record<CardSuit, string> = {
    hearts: "text-red-600",
    diamonds: "text-red-600",
    clubs: "text-slate-900",
    spades: "text-slate-900",
};

export const PlayingCard = ({ suit, value, hidden = false, className, index = 0 }: PlayingCardProps) => {
    return (
        <motion.div
            layout
            initial={{ rotateY: 180, scale: 0.5, y: -100, opacity: 0 }}
            animate={{
                rotateY: hidden ? 180 : 0,
                scale: 1,
                y: 0,
                opacity: 1,
                transition: {
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 260,
                    damping: 20
                }
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            className={cn(
                "relative w-24 h-36 rounded-xl shadow-2xl preserve-3d cursor-pointer select-none",
                className
            )}
            style={{ transformStyle: "preserve-3d" }}
        >
            {/* Front of Card */}
            <div className={cn(
                "absolute inset-0 bg-white rounded-xl flex flex-col justify-between p-2 backface-hidden",
                suitColors[suit]
            )}>
                <div className="text-xl font-bold leading-none">{value}</div>
                <div className="absolute top-8 left-2 text-4xl opacity-20">{suitIcons[suit]}</div>

                <div className="flex justify-center items-center h-full">
                    <span className="text-6xl">{suitIcons[suit]}</span>
                </div>

                <div className="text-xl font-bold leading-none self-end rotate-180">{value}</div>
            </div>

            {/* Back of Card */}
            <div
                className="absolute inset-0 bg-indigo-900 rounded-xl backface-hidden flex items-center justify-center border-2 border-indigo-400"
                style={{ transform: "rotateY(180deg)" }}
            >
                <div className="absolute inset-1 border border-indigo-500/50 rounded-lg m-1" />
                <div className="w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <span className="font-bold text-indigo-300 text-xl z-10">TEB</span>
            </div>
        </motion.div>
    );
};
