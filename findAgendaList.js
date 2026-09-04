const fs = require('fs');
const c = fs.readFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const matches = [...c.matchAll(/agendaList/g)];
matches.forEach((m, i) => {
  const idx = m.index;
  console.log(`--- Match ${i} at index ${idx} ---`);
  console.log(c.substring(idx - 30, idx + 80));
});
