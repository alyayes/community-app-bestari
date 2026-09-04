const fs = require('fs');
const c = fs.readFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const navStart = c.indexOf('<nav className="space-y-2 pt-2">');
const navEnd = c.indexOf('</nav>', navStart);

console.log('navStart:', navStart);
console.log('navEnd:', navEnd);
if (navStart !== -1 && navEnd !== -1) {
  console.log(c.substring(navStart, navEnd + 7));
}
