const fs = require('fs');

const c = fs.readFileSync('src/components/views/admin/AdminPortalView.tsx', 'utf8');

const logoutIdx = c.indexOf('onLogout');
console.log('logoutIdx:', logoutIdx);
if (logoutIdx !== -1) {
  console.log(c.substring(logoutIdx - 300, logoutIdx + 300));
}
