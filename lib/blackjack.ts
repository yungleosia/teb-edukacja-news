export type Card = {
    suit: "hearts" | "diamonds" | "clubs" | "spades";
    value: string;
    numericValue: number;
    hidden?: boolean;
};

export function createDeck(): Card[] {
    const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

    const deck: Card[] = [];

    for (const suit of suits) {
        for (const value of values) {
            let numericValue = parseInt(value);
            if (isNaN(numericValue)) {
                numericValue = value === "A" ? 11 : 10;
            }
            deck.push({ suit, value, numericValue });
        }
    }

    return shuffle(deck);
}

function shuffle(array: any[]) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

export function calculateHandValue(hand: Card[]): number {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
        if (card.hidden) continue;
        value += card.numericValue;
        if (card.value === "A") aces++;
    }

    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return value;
}
