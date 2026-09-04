const fs = require('fs');
const c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const modStart = c.indexOf("activeTab === 'moderation' && (");
const dataStart = c.indexOf("activeTab === 'datasorgum' && (");
const userStart = c.indexOf("activeTab === 'users' && (");
const profStart = c.indexOf("activeTab === 'profil' && (");

console.log('Moderation start:', modStart);
console.log('DataSorgum start:', dataStart);
console.log('Users start:', userStart);
console.log('Profil start:', profStart);
