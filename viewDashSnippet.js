const fs = require('fs');
const c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const idx = c.indexOf("activeTab === 'dashboard'");
if (idx !== -1) {
  console.log(c.substring(idx - 100, idx + 500));
} else {
  console.log('Not found');
}
