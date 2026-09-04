const fs = require('fs');
const c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

// Find start of informasi list table and end of informasi tab
const infoStart = c.indexOf("{/* Articles Data Table */}");
const infoEnd = c.indexOf("{/* ==================== TAB 2: KELOLA PENGUMUMAN", infoStart);

console.log('Info table start:', infoStart);
console.log('Info table end:', infoEnd);
if (infoStart !== -1 && infoEnd !== -1) {
  console.log(c.substring(infoStart, infoStart + 300));
}
