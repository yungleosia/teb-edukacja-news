"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SkinImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

export default function SkinImage({ src, className, alt, ...props }: SkinImageProps) {
    const [error, setError] = useState(false);

    // Default fallback: A crate/box icon or generic image
    const DEFAULT_FALLBACK = "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQ1naTMfWwTuIq1zNCOw_H3Y7iFwD4I6p102LqYrI7xjAXg-hA4MTr1JNfAJgM8NVrZr1jrk-cvg568u5ycn3Mz7yEm5yrZzR2wg0wVb-Zt06adQ10C/360fx360f"; // Fallback to a case image if skin fails? Or just a transparent pixel?

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
