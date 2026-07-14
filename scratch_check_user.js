const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("Querying database users...");
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      expenseTrackerAllowed: true,
      bkashTrackerAllowed: true
    }
  });
  console.log("Database Users:", JSON.stringify(users, null, 2));

  // If there are users, let's make sure they are enabled for testing
  for (const user of users) {
    if (!user.bkashTrackerAllowed || !user.expenseTrackerAllowed) {
      console.log(`Updating user ${user.email} to enable all trackers...`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          bkashTrackerAllowed: true,
          expenseTrackerAllowed: true
        }
      });
      console.log(`User ${user.email} updated successfully.`);
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
