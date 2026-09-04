const fs = require('fs');
const c = fs.readFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const matches = [...c.matchAll(/const \[([^\]]+)\].*thread/gi)];
console.log('Thread state matches:', matches.map(m => m[0]));
