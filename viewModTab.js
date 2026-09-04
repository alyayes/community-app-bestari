const fs = require('fs');
const c = fs.readFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const m = 90091;
console.log(c.substring(m, m + 1500));
