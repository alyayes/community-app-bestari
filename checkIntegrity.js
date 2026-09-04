const fs = require('fs');
const c = fs.readFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

console.log('File size:', c.length);
console.log('Contains Lite Dashboard:', c.includes('Mode Lite Active'));
console.log('Contains Lite Mobile Nav:', c.includes('isLiteMoreMenuOpen'));
console.log('Contains Pro Mode switch:', c.includes("setAppMode('pro')"));
