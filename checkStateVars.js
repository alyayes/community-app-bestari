const fs = require('fs');
const c = fs.readFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

console.log('agendaList state:', c.includes('agendaList'));
console.log('threadsList state:', c.includes('threadsList'));
