const fs = require('fs');

let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

c = c.replace(/threadsList/g, 'filteredThreads');

fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
fs.writeFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');

console.log('Replaced threadsList with filteredThreads successfully!');
