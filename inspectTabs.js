const fs = require('fs');
const c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

// Find all occurrences of activeTab
const matches = [...c.matchAll(/activeTab === '([^']+)'/g)];
console.log('Active tab matches:', matches.map(m => m[1]));
