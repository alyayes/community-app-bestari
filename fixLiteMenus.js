const fs = require('fs');
let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

// 1. Remove Kelola Diskusi from sidebar
const diskusiRegex = /\s*\{\/\*\s*Nav 4: Kelola Diskusi\s*\*\/\}[\s\S]*?(?=\{\/\*\s*Nav 5: Kelola Pengguna\s*\*\/})/g;
c = c.replace(diskusiRegex, '\n              ');

// 2. Remove moderation from bottom navigation
const bottomNavRegex = /\s*\{\s*id:\s*'moderation',\s*label:\s*'Diskusi',\s*icon:\s*<MessageSquare[^>]*>\s*\},/g;
c = c.replace(bottomNavRegex, '');

// 3. Make sure Kelola Sertifikat is in the bottom navigation (instead of Diskusi)
if (!c.includes("{ id: 'sertifikat', label: 'Sertifikat'")) {
    c = c.replace(
        "{ id: 'users', label: 'Pengguna', icon: <Users className=\"w-5 h-5\" /> },",
        "{ id: 'sertifikat', label: 'Sertifikat', icon: <Award className=\"w-5 h-5\" /> },\n            { id: 'users', label: 'Pengguna', icon: <Users className=\"w-5 h-5\" /> },"
    );
}

fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
fs.writeFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');

console.log('Fixed Lite Menus!');
