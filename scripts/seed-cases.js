const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CASES = [
    {
        name: "Gamma Case",
        image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQ1naTMfWwTuIq1zNCOw_H3Y7iFwD4I6p102LqYrI7xjAXg-hA4MTr1JNfAJgM8NVrZr1jrk-cvg568u5ycn3Mz7yEm5yrZzR2wg0wVb-Zt06adQ10C/256fx256f", // Keeping original, if broken will use backup
        price: 35,
        skins: [
            { name: "M4A1-S | Chantico's Fire", rarity: "ancient", price: 2500, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alIITCmGpa7cd4nuz-8oP5jGu4ohQ0J3egI4ORcQNuM1iDq1S_wO_q05TvtZTMziR9-n51Z4uz9G4/360fx360f" },
            { name: "P250 | Asiimov", rarity: "mythical", price: 500, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopujwezhz2v_Nfz5H_uO1gb-Gw_alIITCmGpa7cd4nuz-8oP5jGu4ohQ0J3egI4ORcQNuM1iDq1S_wO_q05TvtZTMziR9-n51Z4uz9G4/360fx360f" },
            { name: "Five-SeveN | Violent Daimyo", rarity: "rare", price: 50, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLOzLhRlxfbGTj5X09q_goW0hPL4MqnMl29T-sZzz-rN_Iv9nBrm_0A9ZGGlLISccgE_YgqEqFPskO_t15G6uJ_OmnM3viJx4SvYnBO0hBtPb-M9m7XAHgl2WkLuaA/360fx360f" },
            { name: "MAC-10 | Carnivore", rarity: "common", price: 10, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0Ob3fDxBvYz4k7-HnvD8J_WAz2lV7cAh3frD8I_3jVa1-hY6MmD1d9eWclU9YAmD-1S_xLq6hJS_tMic1zI/360fx360f" },
            { name: "Nova | Exo", rarity: "common", price: 5, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0Ob3fDxBvYz4k7-HnvD8J_WAz2lV7cAh3frD8I_3jVa1-hY6MmD1d9eWclU9YAmD-1S_xLq6hJS_tMic1zI/360fx360f" },
            { name: "R8 Revolver | Reboot", rarity: "uncommon", price: 20, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopL-zJAt21uH3cDx96t2ykb-GkuP1P77gnXJzqJ0oj-2W892gigDsr0Q-N2vyd46Sd1dsNV_Sq1Dsk-zvg5Xuup_ImnZ9-n51N4tJ5Mc/360fx360f" },
        ]
    },
    {
        name: "Operation Wildfire Case",
        image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQ1naTMfWwTuIq1zNCOw_H3Y7iFwD4I6p102LqYrI7xjAXg-hA4MTr1JNfAJgM8NVrZr1jrk-cvg568u5ycn3Mz7yEm5yrZzR2wg0wVb-Zt06adQ10C/256fx256f",
        price: 40,
        skins: [
            { name: "AK-47 | Fuel Injector", rarity: "ancient", price: 3500, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV092lnYmGm_r2Or7clXlU7tFzh9bN_Iv9nBrmr0c_Nm-lcYaddg9qMAvS_wftx-7ugpG5vZqdyyd9-n51Q5-le8k/360fx360f" },
            { name: "AWP | Elite Build", rarity: "legendary", price: 800, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2G0GvZYhj-vT8InxgUG55RA5Mm2gcYPBcAA5ZA3W_FS7xuvsgJW578_BznQ26XUqsyrYnEC0m1gSOcYk/360fx360f" },
            { name: "FAMAS | Valence", rarity: "rare", price: 60, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposLuoKhRf1OD3dzxP7c-JmImpkvPLP7LWnn8f7sN4j-uTrNj02Vfm-0JvZm_xJdTDJgFoM13R_1O5w7y515S5vJXAyyYw7yQ8pSGK0kY8uBE/360fx360f" },
            { name: "Glock-18 | Royal Legion", rarity: "rare", price: 45, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0v73cy9H_9SznYmMqP_xMq3I2DIDu50pj-3F9on23QDjrRdsYjiiJ9OQJQ88Y1DT-gO-x-3qjJ66u8yYwHU16SFw5ymJl0TmgVtOYLFxxavJz5M2/360fx360f" },
            { name: "SSG 08 | Necropos", rarity: "common", price: 15, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopamie19f0Ob3fDxBvYz4k7-HnvD8J_WAz2lV7cAh3frD8I_3jVa1-hY6MmD1d9eWclU9YAmD-1S_xLq6hJS_tMic1zI/360fx360f" },
        ]
    },
    {
        name: "Dragon Lore Case (Special)",
        image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQ1naTMfWwTuIq1zNCOw_H3Y7iFwD4I6p102LqYrI7xjAXg-hA4MTr1JNfAJgM8NVrZr1jrk-cvg568u5ycn3Mz7yEm5yrZzR2wg0wVb-Zt06adQ10C/256fx256f",
        price: 300,
        skins: [
            { name: "AWP | Dragon Lore", rarity: "ancient", price: 50000, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2G0GvZYhj-vT8InxgUG55RA5Mm2gcYPBcAA5ZA3W_FS7xuvsgJW578_BznQ26XUqsyrYnEC0m1gSOcYk/360fx360f" },
            { name: "M4A4 | Howl", rarity: "contraband", price: 20000, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alIITCmGpa7cd4nuz-8oP5jGu4ohQ0J3egI4ORcQNuM1iDq1S_wO_q05TvtZTMziR9-n51Z4uz9G4/360fx360f" },
            { name: "P90 | Sand Spray", rarity: "common", price: 2, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0Ob3fDxBvYz4k7-HnvD8J_WAz2lV7cAh3frD8I_3jVa1-hY6MmD1d9eWclU9YAmD-1S_xLq6hJS_tMic1zI/360fx360f" },
            { name: "G3SG1 | Sand Spray", rarity: "common", price: 2, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0Ob3fDxBvYz4k7-HnvD8J_WAz2lV7cAh3frD8I_3jVa1-hY6MmD1d9eWclU9YAmD-1S_xLq6hJS_tMic1zI/360fx360f" },
            { name: "Galil AR | Sand Spray", rarity: "common", price: 2, image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0Ob3fDxBvYz4k7-HnvD8J_WAz2lV7cAh3frD8I_3jVa1-hY6MmD1d9eWclU9YAmD-1S_xLq6hJS_tMic1zI/360fx360f" },
        ]
    }
];

async function main() {
    console.log('Seeding Cases & Skins...');

    // Optional: Clean up old cases/skins if needed to avoid dupes, or just upsert.
    // For simplicity, we'll delete all Cases and Skins first (cascades to UserItems/Battles if not careful, so be careful in prod).
    // But for dev, we wipe.
    await prisma.caseBattleRound.deleteMany({});
    await prisma.caseBattle.deleteMany({});
    await prisma.userItem.deleteMany({});
    await prisma.case.deleteMany({}); // Delete cases first

    // Note: Skins can be shared? Usually specific to case collection in real CS, but here simplfied.
    // We'll delete skins too.
    await prisma.skin.deleteMany({});

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
