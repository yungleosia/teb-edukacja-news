
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: {
            email: 'jtaker202@gmail.com',
        },
    });
    console.log(user ? 'User found: ' + JSON.stringify(user) : 'User not found');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
