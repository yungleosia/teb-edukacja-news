const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Reliable placeholders since external links are flaky and AI gen is busy
const SKINS = {
    M4A4_NEO: "https://placehold.co/400x300/1e293b/ec4899?text=M4A4+Neo-Noir",
    MP7_BLOOD: "https://placehold.co/400x300/1e293b/ef4444?text=MP7+Bloodsport",
    USP_CORTEX: "https://placehold.co/400x300/1e293b/a855f7?text=USP-S+Cortex",
    GLOCK_MOON: "https://placehold.co/400x300/1e293b/3b82f6?text=Glock-18+Moonrise",
    MAG7_SWAG: "https://placehold.co/400x300/1e293b/eab308?text=MAG-7+SWAG-7",
    AK47_FUEL: "https://placehold.co/400x300/1e293b/f59e0b?text=AK-47+Fuel+Injector",
    AWP_ELITE: "https://placehold.co/400x300/1e293b/94a3b8?text=AWP+Elite+Build",
    NOVA_HYPER: "https://placehold.co/400x300/1e293b/10b981?text=Nova+Hyper+Beast",
    AWP_DRAGON: "https://placehold.co/400x300/1e293b/d97706?text=AWP+Dragon+Lore",
    M4A4_HOWL: "https://placehold.co/400x300/1e293b/dc2626?text=M4A4+Howl",
    CASE_CLUTCH: "https://placehold.co/400x300/1e293b/6366f1?text=Clutch+Case",
    CASE_WILDFIRE: "https://placehold.co/400x300/1e293b/f97316?text=Wildfire+Case",
    CASE_DRAGON: "https://placehold.co/400x300/1e293b/fbbf24?text=Dragon+Lore+Case"
};

const CASES = [
    {
        name: "Clutch Case",
        image: SKINS.CASE_CLUTCH,
        price: 25,
        skins: [
            { name: "M4A4 | Neo-Noir", rarity: "ancient", price: 2500, image: SKINS.M4A4_NEO },
            { name: "MP7 | Bloodsport", rarity: "ancient", price: 500, image: SKINS.MP7_BLOOD },
            { name: "USP-S | Cortex", rarity: "legendary", price: 300, image: SKINS.USP_CORTEX },
            { name: "Glock-18 | Moonrise", rarity: "mythical", price: 50, image: SKINS.GLOCK_MOON },
            { name: "MAG-7 | SWAG-7", rarity: "rare", price: 15, image: SKINS.MAG7_SWAG },
        ]
    },
    {
        name: "Wildfire Case",
        image: SKINS.CASE_WILDFIRE,
        price: 40,
        skins: [
            { name: "AK-47 | Fuel Injector", rarity: "ancient", price: 3500, image: SKINS.AK47_FUEL },
            { name: "AWP | Elite Build", rarity: "legendary", price: 800, image: SKINS.AWP_ELITE },
            { name: "Nova | Hyper Beast", rarity: "legendary", price: 300, image: SKINS.NOVA_HYPER },
        ]
    },
    {
        name: "Dragon Lore Case",
        image: SKINS.CASE_DRAGON,
        price: 300,
        skins: [
            { name: "AWP | Dragon Lore", rarity: "ancient", price: 50000, image: SKINS.AWP_DRAGON },
            { name: "M4A4 | Howl", rarity: "contraband", price: 20000, image: SKINS.M4A4_HOWL },
        ]
    }
];

async function main() {
    console.log('Seeding Cases & Skins...');

    await prisma.caseBattleRound.deleteMany({});
    await prisma.caseBattle.deleteMany({});
    await prisma.userItem.deleteMany({});
    await prisma.skin.deleteMany({});
    await prisma.case.deleteMany({});

    for (const caseData of CASES) {
        const createdCase = await prisma.case.create({
            data: {
                name: caseData.name,
                image: caseData.image,
                price: caseData.price,
                skins: {
                    create: caseData.skins.map(skin => ({
                        name: skin.name,
                        image: skin.image,
                        rarity: skin.rarity,
                        price: skin.price
                    }))
                }
            }
        });
        console.log(`Created case: ${createdCase.name}`);
    }

    console.log('Done!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
