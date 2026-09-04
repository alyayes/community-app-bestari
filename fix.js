const fs = require('fs');
let c = fs.readFileSync('src/components/views/admin/AdminPortalView.tsx', 'utf8');

c = c.replace(/export const AdminPortalView:/g, 'export const AdminPortalViewLite:');

// Replace sidebar options
c = c.replace(/\{\/\* Nav: Kelola Sertifikat \*\/\}[\s\S]*?\{\/\* Nav: Kelola Informasi \*\/\}/g, '{/* Nav: Kelola Informasi */}');
c = c.replace(/\{\/\* Nav: Kelola Konten \(CMS Landing\/Login\/Register\) \*\/\}[\s\S]*?<\/nav>/g, '</nav>');

// Replace Lite Mode button to Pro Mode
c = c.replace(/onClick=\{\(\) => setAppMode\('lite'\)\}/g, "onClick={() => setAppMode('pro')}");
c = c.replace(/<span>Lite Mode<\/span>/g, '<span>Pro Mode</span>');

// Replace desktop sidebar hide/show to always show on desktop
c = c.replace(/isMobileMenuOpen \? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'/g, "'hidden md:flex'");

fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
console.log('Done');
