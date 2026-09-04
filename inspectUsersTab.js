const fs = require('fs');

const c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const idx = c.indexOf("activeTab === 'users'");
if (idx !== -1) {
  console.log(c.substring(idx, idx + 1000));
} else {
  console.log('users tab not found');
}
