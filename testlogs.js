require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.license.findMany({ include: { logs: { take: 3, orderBy: { timestamp: 'desc' } } } }).then(ls => {
  console.log("================================");
  console.log("TOTAL LICENSES FOUND: " + ls.length);
  console.log("================================");
  ls.forEach(l => {
    console.log('KEY: ' + l.key + ' | DOMAIN: ' + l.domain);
    if(l.logs.length === 0) {
      console.log('   --> NO LOGS RECORDED');
    } else {
      l.logs.forEach(log => console.log('   --> [' + log.status + '] IP: ' + log.ipAddress + ' @ ' + log.timestamp));
    }
  });
  p.$disconnect();
}).catch(e => { console.error(e); p.$disconnect(); });
