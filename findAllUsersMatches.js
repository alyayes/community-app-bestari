const fs = require('fs');

const c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const matches = [];
let idx = c.indexOf("activeTab === 'users'");
while (idx !== -1) {
  matches.push(idx);
  idx = c.indexOf("activeTab === 'users'", idx + 1);
}

console.log('Matches:', matches);
matches.forEach((m, i) => {
  console.log(`--- Match ${i} at index ${m} ---`);
  console.log(c.substring(m - 30, m + 500));
});
