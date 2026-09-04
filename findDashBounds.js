const fs = require('fs');
const c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const startIdx = c.indexOf("activeTab === 'dashboard' && (");
const nextTabIdx = c.indexOf("{/* ==================== TAB", startIdx);

console.log('Start index:', startIdx);
console.log('Next tab index:', nextTabIdx);
console.log('Snippet around next tab:\n', c.substring(nextTabIdx - 50, nextTabIdx + 100));
