const fs = require('fs');

const FILE_PATH = 'src/components/views/admin/AdminPortalView.tsx';
let content = fs.readFileSync(FILE_PATH, 'utf8');

const defaultUsersCode = `
const DEFAULT_USERS_LIST = [
  {
    id: 'usr_01',
    name: 'Alya Permata (Admin)',
    email: 'admin@kwtsorgum.id',
    role: 'ADMIN',
    phone: '0812-3456-7890',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_02',
    name: 'Ibu Hj. Kartini',
    email: 'kartini@kwtsorgum.id',
    role: 'Ketua KWT',
    phone: '0812-7890-4321',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_03',
    name: 'Ibu Siti Rahma',
    email: 'siti.rahma@kwtsorgum.id',
    role: 'Bendahara KWT',
    phone: '0813-9988-7766',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200'
  }
];
`;

if (!content.includes('DEFAULT_USERS_LIST = [')) {
  content = content.replace('export const AdminPortalView: React.FC<AdminPortalViewProps>', defaultUsersCode + '\nexport const AdminPortalView: React.FC<AdminPortalViewProps>');
}

// Fix the map and empty state
content = content.replace(
  /\{usersList\.filter\(u => /g,
  '{((usersList && usersList.length > 0) ? usersList : ((members && members.length > 0) ? members : DEFAULT_USERS_LIST)).filter(u => '
);

content = content.replace(
  /\{usersList\.length === 0 && \(/g,
  '{((usersList && usersList.length > 0) ? usersList : ((members && members.length > 0) ? members : DEFAULT_USERS_LIST)).filter(u => u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase())).length === 0 && ('
);

fs.writeFileSync(FILE_PATH, content, 'utf8');
console.log('Fixed users display in AdminPortalView!');
