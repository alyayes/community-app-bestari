const fs = require('fs');

const c = fs.readFileSync('src/components/views/admin/AdminPortalView.tsx', 'utf8');

console.log('File size:', c.length);
console.log('Has setAppMode:', c.includes('setAppMode'));
console.log('Has Lite Mode:', c.includes('Lite Mode'));
console.log('Has Pro Mode:', c.includes('Pro Mode'));
console.log('Has Identitas Web:', c.includes('Identitas Web'));
