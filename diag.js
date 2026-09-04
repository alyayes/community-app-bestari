const fs = require('fs');
const c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');
console.log('export AdminPortalViewLite:', c.includes('export const AdminPortalViewLite'));
console.log('setAppMode pro:', c.includes("setAppMode('pro')"));
console.log('Pro Mode text:', c.includes('Pro Mode'));
console.log('Lite Mode text:', c.includes('Lite Mode'));
console.log('Kelola Sertifikat sidebar:', c.includes('Kelola Sertifikat</span>'));
console.log('Kelola Konten sidebar:', c.includes('Kelola Konten</span>'));
console.log('ArrowRightLeft:', c.includes('ArrowRightLeft'));
console.log('isLiteMoreMenuOpen:', c.includes('isLiteMoreMenuOpen'));
console.log('MoreHorizontal:', c.includes('MoreHorizontal'));

// Check for hidden md:flex sidebar
console.log('hidden md:flex sidebar:', c.includes("'hidden md:flex'"));

// Find dashboard tab
const dashIdx = c.indexOf("'dashboard'");
console.log('First dashboard string at char:', dashIdx);
