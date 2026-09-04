const fs = require('fs');
const c = fs.readFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const modStart = c.indexOf("activeTab === 'moderation' && (");
const modEnd = c.indexOf("activeTab === 'datasorgum' && (");

if (modStart !== -1 && modEnd !== -1) {
  console.log(c.substring(modStart, modEnd));
} else {
  console.log('Not found bounds');
}
