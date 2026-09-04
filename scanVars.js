const fs = require('fs');
const c = fs.readFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const checks = [
  'filteredArticles',
  'filteredAgendas',
  'filteredThreads',
  'agendaList',
  'usersList',
  'landPlots',
  'members'
];

checks.forEach(v => {
  console.log(`${v} used: ${c.includes(v)}`);
});
