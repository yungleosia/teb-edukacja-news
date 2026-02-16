const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CASES = [
    {
        name: "Gamma Case",
        image: "https://cdn.csgoskins.gg/public/uih/items/aHR0cHM6Ly9jZG4uY3Nnb3NraW5zLmdnL3B1YmxpYy9pbWFnZXMvYnVja2V0cy9lY29uL3dlYXBvbl9jYXNlcy9jcmF0ZV9jb21tdW5pdHlfMTMuOWE3ZDJmNzU3ZGRiZGM5MTVhYTAwNWRlZjc0YWMxODZhNDU3MzQ2YS5wbmc-/auto/auto/85/notrim/09807b2a615b175212222036b9e8115e.webp", // Keeping original, if broken will use backup
        price: 35,
        skins: [
            { name: "M4A1-S | Chantico's Fire", rarity: "ancient", price: 2500, image: "https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jZG4uY3Nnb3NraW5zLmdnL3B1YmxpYy9pbWFnZXMvYnVja2V0cy9lY29uL2RlZmF1bHRfZ2VuZXJhdGVkL3dlYXBvbl9tNGExX3NpbGVuY2VyX2N1X200YTFzX3NvdWx0YWtlcl9saWdodC43NTlhMDFhYjBlMDIyYWZjMWVlNjg5ZGM0ZmY0MWIwM2RlYjVkMTVlLnBuZw--/auto/auto/85/notrim/85a0caccacb0b86036d8599e4ef1fe6a.webp" },
            { name: "P250 | Asiimov", rarity: "mythical", price: 500, image: "https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jZG4uY3Nnb3NraW5zLmdnL3B1YmxpYy9pbWFnZXMvYnVja2V0cy9lY29uL2RlZmF1bHRfZ2VuZXJhdGVkL3dlYXBvbl9wMjUwX2N1X3AyNTBfYXNpaW1vdl9saWdodC4xZjc4MDEwNTQ0ZDFhZWU0MjFmY2NmMDAwNTY5ZTZkODIwZTIzNjExLnBuZw--/auto/auto/85/notrim/93ae4ad3656ae7297c693de6fd6d676c.webp" },
            { name: "Five-SeveN | Violent Daimyo", rarity: "rare", price: 50, image: "https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jZG4uY3Nnb3NraW5zLmdnL3B1YmxpYy9pbWFnZXMvYnVja2V0cy9lY29uL2RlZmF1bHRfZ2VuZXJhdGVkL3dlYXBvbl9maXZlc2V2ZW5fY3VfZml2ZV9zZXZlbl9kYWlteW9fbGlnaHQuZjgzYmU2NjkwYjg5ZWMxMTYwNTgyYWU4ZGFlNDIwZWY4NWQ3NjU0OC5wbmc-/auto/auto/85/notrim/9c9857f7477c5d8b7b16002946c19dfd.webp" },
            { name: "MAC-10 | Carnivore", rarity: "common", price: 10, image: "https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jZG4uY3Nnb3NraW5zLmdnL3B1YmxpYy9pbWFnZXMvYnVja2V0cy9lY29uL2RlZmF1bHRfZ2VuZXJhdGVkL3dlYXBvbl9tYWMxMF9hcV9tYWNfMTBfYWxpZW5fY2Ftb19saWdodC5iNDRlYzQ3OTQ3OTJjNzc3ZjA3NzBlMjdmYmMyZGQ5YjI1ZWE3ZDEwLnBuZw--/auto/auto/85/notrim/2b9f09eb457a73570cdc80bd306fe201.webp" },
            { name: "Nova | Exo", rarity: "common", price: 5, image: "https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jZG4uY3Nnb3NraW5zLmdnL3B1YmxpYy9pbWFnZXMvYnVja2V0cy9lY29uL2RlZmF1bHRfZ2VuZXJhdGVkL3dlYXBvbl9ub3ZhX2FxX25vdmFfc2NpX2ZpX2xpZ2h0LjU0NzRiNmJmOGJlN2I3ZTlhZjE4NWJhZmI2ZGRjMDM3NTdiODk5YzEucG5n/auto/auto/85/notrim/9cc4fe367eea38c1e69ce74472e2aa04.webp" },
            { name: "R8 Revolver | Reboot", rarity: "uncommon", price: 20, image: "https://cdn.csgoskins.gg/public/uih/products/aHR0cHM6Ly9jZG4uY3Nnb3NraW5zLmdnL3B1YmxpYy9pbWFnZXMvYnVja2V0cy9lY29uL2RlZmF1bHRfZ2VuZXJhdGVkL3dlYXBvbl9yZXZvbHZlcl9jdV9yOF9jeWJlcnNwb3J0X2xpZ2h0LmZmYWUyMDQ2OTlhNzAxYWM1ZDYzMmNmMzYyNDk3M2E0MTc3MDRlZjAucG5n/auto/auto/85/notrim/911ae97b2faaf7b0d1ed3c1aff4dc005.webp" },
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
