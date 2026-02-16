const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CASES = [
    {
        name: "Clutch Case",
        image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQ1naTMfWwTuIq1zNCOw_H3Y7iFwD4I6p102LqYrI7xjAXg-hA4MTr1JNfAJgM8NVrZr1jrk-cvg568u5ycn3Mz7yEm5yrZzR2wg0wVb-Zt06adQ10C/256fx256f",
        price: 25,
        skins: [
            { name: "M4A4 | Neo-Noir", rarity: "ancient", price: 2500, image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alIITCmGpa7cd4nuz-8oP5jGu4ohQ0J3egI4ORcQNuM1iDq1S_wO_q05TvtZTMziR9-n51Z4uz9G4/360fx360f" },
            { name: "MP7 | Bloodsport", rarity: "ancient", price: 500, image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6ryFABz7P7YJgJA4NO5k9SKqP_xMq3I2DIDu50pj-3F9on23QDjrRdsYjiiJ9OQJQ88Y1DT-gO-x-3qjJ66u8yYwHU16SFw5ymJl0TmgVtOYLFxxavJz5M2/360fx360f" },
            { name: "USP-S | Cortex", rarity: "legendary", price: 300, image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_b3cpxo5Mz3r7-Jm_L7Pr7YhW5d_8t03L-V8dyiimHl-0E6MTr1d9SQcVNoYVHQ_FantO_n0cW56Micymwj5Hfnl3v_3Q/360fx360f" },
            { name: "Glock-18 | Moonrise", rarity: "mythical", price: 50, image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0v73cy9H_9SznYmMqP_xMq3I2DIDu50pj-3F9on23QDjrRdsYjiiJ9OQJQ88Y1DT-gO-x-3qjJ66u8yYwHU16SFw5ymJl0TmgVtOYLFxxavJz5M2/360fx360f" },
            { name: "MAG-7 | SWAG-7", rarity: "rare", price: 15, image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0Ob3fDxBvYz4k7-HnvD8J_WAz2lV7cAh3frD8I_3jVa1-hY6MmD1d9eWclU9YAmD-1S_xLq6hJS_tMic1zI/360fx360f" },
        ]
    },
    {
        name: "Wildfire Case",
        image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQ1naTMfWwTuIq1zNCOw_H3Y7iFwD4I6p102LqYrI7xjAXg-hA4MTr1JNfAJgM8NVrZr1jrk-cvg568u5ycn3Mz7yEm5yrZzR2wg0wVb-Zt06adQ10C/256fx256f",
        price: 40,
        skins: [
            { name: "AK-47 | Fuel Injector", rarity: "ancient", price: 3500, image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV092lnYmGm_r2Or7clXlU7tFzh9bN_Iv9nBrmr0c_Nm-lcYaddg9qMAvS_wftx-7ugpG5vZqdyyd9-n51Q5-le8k/360fx360f" },
            { name: "AWP | Elite Build", rarity: "legendary", price: 800, image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2G0GvZYhj-vT8InxgUG55RA5Mm2gcYPBcAA5ZA3W_FS7xuvsgJW578_BznQ26XUqsyrYnEC0m1gSOcYk/360fx360f" },
            { name: "Nova | Hyper Beast", rarity: "legendary", price: 300, image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou7umeldf0Ob3fDxBvYz4k7-HnvD8J_WAz2lV7cAh3frD8I_3jVa1-hY6MmD1d9eWclU9YAmD-1S_xLq6hJS_tMic1zI/360fx360f" },
        ]
    },
    {
        name: "Dragon Lore Case",
        image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsUFJ5KBFZv668FFQ1naTMfWwTuIq1zNCOw_H3Y7iFwD4I6p102LqYrI7xjAXg-hA4MTr1JNfAJgM8NVrZr1jrk-cvg568u5ycn3Mz7yEm5yrZzR2wg0wVb-Zt06adQ10C/256fx256f",
        price: 300,
        skins: [
            { name: "AWP | Dragon Lore", rarity: "ancient", price: 50000, image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2G0GvZYhj-vT8InxgUG55RA5Mm2gcYPBcAA5ZA3W_FS7xuvsgJW578_BznQ26XUqsyrYnEC0m1gSOcYk/360fx360f" },
            { name: "M4A4 | Howl", rarity: "contraband", price: 20000, image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alIITCmGpa7cd4nuz-8oP5jGu4ohQ0J3egI4ORcQNuM1iDq1S_wO_q05TvtZTMziR9-n51Z4uz9G4/360fx360f" },
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
