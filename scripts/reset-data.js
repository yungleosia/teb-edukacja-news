const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Resetting user data...');

    try {
        const updatedUsers = await prisma.user.updateMany({
            data: {
                tebCoins: 100,
                leTebFreeSpins: 0,
            },
        });

        console.log(`Successfully reset data for ${updatedUsers.count} users.`);
        console.log('All users now have 100 TebCoins and 0 Free Spins.');
    } catch (error) {
        console.error('Error resetting user data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
