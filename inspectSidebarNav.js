const fs = require('fs');
const c = fs.readFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const navIdx = c.indexOf('<nav className=');
if (navIdx !== -1) {
  console.log(c.substring(navIdx, navIdx + 1200));
} else {
  console.log('nav not found');
}
