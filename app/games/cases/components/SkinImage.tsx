"use client";

import { useState, ImgHTMLAttributes, DetailedHTMLProps } from "react";
import { cn } from "@/lib/utils";

interface SkinImageProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    fallbackSrc?: string;
}

export default function SkinImage({ src, className, alt, ...props }: SkinImageProps) {
    const [error, setError] = useState(false);

    // Default fallback: A crate/box icon or generic image
    const DEFAULT_FALLBACK = "https://placehold.co/200x200/1e293b/yellow?text=CS2+Skin";

    return (
        <img
            src={error ? DEFAULT_FALLBACK : src}
            alt={alt}
            className={cn("object-contain", className)}
            onError={() => setError(true)}
            {...props}
        />
    );
}
