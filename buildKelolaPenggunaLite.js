const fs = require('fs');

let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

// Ensure DEFAULT_USERS_LIST is defined or inserted near the top of the file
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
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_04',
    name: 'Pak Budi Santoso',
    email: 'budi.santoso@kwtsorgum.id',
    role: 'Petani Sorgum',
    phone: '0857-1234-5678',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_05',
    name: 'Ibu Sri Wahyuni',
    email: 'sri.wahyuni@kwtsorgum.id',
    role: 'Anggota KWT',
    phone: '0821-4455-6677',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'usr_06',
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@kwtsorgum.id',
    role: 'Pengolah Hasil Panen',
    phone: '0819-3322-1100',
    isActive: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
  }
];
`;

if (!c.includes('DEFAULT_USERS_LIST')) {
  c = c.replace('type AdminTab =', defaultUsersCode + '\ntype AdminTab =');
}

const userStartMarker = "activeTab === 'users' && (";
const userStartIdx = c.indexOf(userStartMarker);

if (userStartIdx === -1) {
  console.error('activeTab === users not found');
  process.exit(1);
}

const userEndMarker = "{/* ========== MODAL: Preview Artikel";
const userEndIdx = c.indexOf(userEndMarker, userStartIdx);

if (userEndIdx === -1) {
  console.error('userEndMarker not found');
  process.exit(1);
}

const liteUsersFullJSX = `activeTab === 'users' && (
            <div className="space-y-6">
              {/* Header Title + Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                    Kelola Pengguna Komunitas
                  </h1>
                  <p className="text-xs text-[#7A7062] mt-1">Daftar anggota KWT, pengurus, dan pengguna yang terdaftar di aplikasi.</p>
                </div>

                <button
                  onClick={() => {
                    setUserFormData({ name: '', email: '', role: 'USER', phone: '', password: '' });
                    setEditingUser(null);
                    setIsUserModalOpen(true);
                  }}
                  className="px-5 py-3 rounded-2xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0 active:scale-95"
                >
                  <Plus className="w-4 h-4 text-[#A8B774]" />
                  <span>Tambah Pengguna Baru</span>
                </button>
              </div>

              {/* Search & Summary Stats */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="Cari pengguna berdasarkan nama/email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full py-2.5 pl-10 pr-4 rounded-2xl bg-white border border-[#E6E1D5] text-xs font-medium text-[#2C4219] focus:outline-none focus:border-[#2C4219] shadow-2xs"
                  />
                  <Search className="w-4 h-4 text-[#7A7062] absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex items-center gap-2 text-xs text-[#7A7062] font-bold self-end sm:self-center">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E6E1D5]">
                    Total: <strong className="text-[#2C4219]">{((usersList && usersList.length > 0) ? usersList : ((members && members.length > 0) ? members : DEFAULT_USERS_LIST)).length} Pengguna</strong>
                  </span>
                </div>
              </div>

              {/* Users Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const rawList = (usersList && usersList.length > 0) 
                    ? usersList 
                    : ((members && members.length > 0) ? members : DEFAULT_USERS_LIST);

                  const filtered = rawList.filter(u => {
                    if (!userSearchQuery) return true;
                    const q = userSearchQuery.toLowerCase();
                    return (
                      (u.name || u.firstName || '').toLowerCase().includes(q) ||
                      (u.email || '').toLowerCase().includes(q) ||
                      (u.role || '').toLowerCase().includes(q)
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[#E6E1D5] text-[#7A7062] font-semibold text-xs">
                        Pengguna tidak ditemukan.
                      </div>
                    );
                  }

                  return filtered.map((u) => {
                    const userName = u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Pengguna';
                    const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
                    const isActive = u.isActive !== false;

                    return (
                      <div key={u.id || u.email} className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs flex flex-col justify-between gap-4 hover:border-[#2C4219] transition-all">
                        <div className="flex items-start gap-3">
                          {u.avatar ? (
                            <img 
                              src={u.avatar} 
                              alt={userName}
                              className="w-12 h-12 rounded-2xl object-cover border border-[#E6E1D5] shrink-0" 
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-[#2C4219] text-[#A8B774] font-title font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                              {initials}
                            </div>
                          )}

                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 className="font-bold text-sm text-[#2C4219] truncate">{userName}</h4>
                            <p className="text-xs text-[#7A7062] truncate">{u.email}</p>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF6EE] text-[#7A7062] border border-[#E6E1D5]">
                                {u.role || u.position || 'Anggota KWT'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-between">
                          <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full \${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }\`}>
                            {isActive ? 'Aktif' : 'Nonaktif'}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleUserStatus(u.id, isActive, userName)}
                              className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors \${
                                isActive ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              }\`}
                            >
                              {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(u.id, userName)}
                              className="p-1.5 rounded-xl text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Hapus Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

        </div>
      </main>

      `;

c = c.substring(0, userStartIdx) + liteUsersFullJSX + c.substring(userEndIdx);

fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
fs.writeFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');

console.log('Successfully updated Kelola Pengguna Lite view!');
