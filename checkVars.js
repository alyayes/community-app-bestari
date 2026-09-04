const fs = require('fs');
const c = fs.readFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

console.log('threadsList count:', (c.match(/threadsList/g) || []).length);
console.log('agendaList count:', (c.match(/agendaList/g) || []).length);
console.log('agendas count:', (c.match(/agendas/g) || []).length);
console.log('threads count:', (c.match(/threads/g) || []).length);
