const fs = require('fs');
const c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const matches = [];
let idx = c.indexOf("activeTab === 'dashboard'");
while (idx !== -1) {
  matches.push(idx);
  idx = c.indexOf("activeTab === 'dashboard'", idx + 1);
}

console.log('Match indices:', matches);
matches.forEach((m, i) => {
  console.log(`--- Match ${i} ---`);
  console.log(c.substring(m - 50, m + 300));
});
