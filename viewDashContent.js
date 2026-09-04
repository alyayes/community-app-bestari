const fs = require('fs');
const c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const m = 104537;
console.log(c.substring(m, m + 1500));
