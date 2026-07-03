require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const license = await p.license.findUnique({
    where: { id: 'cmr4b4hw40005l504s0mjcxfd' }
  });

  if (!license) {
    console.log("No license found for id cmr4b4hw40005l504s0mjcxfd");
    return;
  }

  const logs = await p.verificationLog.findMany({
    where: { licenseId: license.id },
    orderBy: { timestamp: 'desc' }
  });

  console.log("Found", logs.length, "verification logs:");
  logs.forEach(log => {
    console.log(`[${log.status}] IP: ${log.ipAddress} @ ${log.timestamp}`);
  });
}

main().catch(console.error).finally(() => p.$disconnect());
