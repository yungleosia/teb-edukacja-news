
/**
 * Censors specific words by replacing their middle characters with hearts.
 * keeps the first and last character visible.
 */
export function censorText(text: string): string {
    if (!text) return "";

    const forbiddenWords = [
        "kurwa",
        "cwelu",
        "wibrator",
        "kondom",
        "burdel",
        // Add variations if needed, or use a more robust regex for variations
    ];

    const bannedWordsRegex = new RegExp(`\\b(${forbiddenWords.join("|")})\\b`, "gi");

    return text.replace(bannedWordsRegex, (match) => {
        if (match.length <= 2) return match; // Too short to mask middle
        const firstChar = match[0];
        const lastChar = match[match.length - 1];
        // Create hearts for the middle part
        // We can use a fixed number or match length. 
        // "kurwa" -> "k♥♥wa" (length 5 -> 2 hearts)
        // Let's make it proportional but maybe limit max hearts if word is huge?
        // Actually, replacing each middle char with a heart preserves length roughly or just looks nice.
        const middle = "♥".repeat(match.length - 2);
        return `${firstChar}${middle}${lastChar}`;
    });
}
