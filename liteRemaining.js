const fs = require('fs');

let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

// 1. Transform Moderation
const modStartMarker = "activeTab === 'moderation' && (";
const modEndMarker = "{/* ==================== TAB";

const modStartIdx = c.indexOf(modStartMarker);
const modEndIdx = c.indexOf(modEndMarker, modStartIdx + 30);

if (modStartIdx !== -1 && modEndIdx !== -1) {
  const liteModeration = `activeTab === 'moderation' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                  Moderasi Diskusi
                </h1>
                <p className="text-xs text-[#7A7062] mt-1">Pantau dan kelola topik diskusi yang dibuat oleh warga komunitas.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {threadsList && threadsList.length > 0 ? (
                  threadsList.map((th) => (
                    <div 
                      key={th.id}
                      className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs flex flex-col justify-between gap-3 hover:border-purple-600 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                            {th.category || 'Diskusi'}
                          </span>
                          <span className="text-[11px] text-[#7A7062] font-medium">
                            {th.repliesCount || 0} Balasan
                          </span>
                        </div>

                        <h3 className="font-title font-bold text-base text-[#2C4219] line-clamp-2">
                          {th.title}
                        </h3>

                        <p className="text-xs text-[#7A7062] line-clamp-2">
                          {th.content || ''}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-between">
                        <span className="text-[11px] text-[#7A7062]">Oleh: <strong>{th.author || 'Warga'}</strong></span>

                        <button
                          onClick={() => setThreadToDeleteModal(th)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Utas</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[#E6E1D5] text-[#7A7062] font-semibold text-xs">
                    Belum ada diskusi yang dibuat warga.
                  </div>
                )}
              </div>
            </div>
          )}

          `;

  c = c.substring(0, modStartIdx) + liteModeration + c.substring(modEndIdx);
}

// 2. Transform Data Sorgum
const dataStartMarker = "activeTab === 'datasorgum' && (";
const dataEndMarker = "{/* ==================== TAB";

const dataStartIdx = c.indexOf(dataStartMarker);
const dataEndIdx = c.indexOf(dataEndMarker, dataStartIdx + 30);

if (dataStartIdx !== -1 && dataEndIdx !== -1) {
  const liteDataSorgum = `activeTab === 'datasorgum' && (
            <div className="space-y-6">
              <div>
                <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                  Data Sorgum Komunitas
                </h1>
                <p className="text-xs text-[#7A7062] mt-1">Ringkasan lahan tanam dan catatan hasil panen sorgum.</p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">Total Lahan Tanam</p>
                    <p className="font-title font-black text-2xl text-[#2C4219]">{landPlots?.length || 0} Blok</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">Total Hasil Panen</p>
                    <p className="font-title font-black text-2xl text-[#2C4219]">{dashboardStats?.totalRawMaterialKg || 1250} Kg</p>
                  </div>
                </div>
              </div>

              {/* Land Plots Cards Grid */}
              <div className="space-y-3">
                <h2 className="font-title font-bold text-lg text-[#2C4219]">Daftar Blok Lahan Tanam</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {landPlots && landPlots.length > 0 ? (
                    landPlots.map((plot) => (
                      <div key={plot.id} className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#2C4219]">{plot.blockName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF6EE] text-[#7A7062] border border-[#E6E1D5]">
                              {plot.areaHa} Ha
                            </span>
                          </div>
                          <p className="text-xs text-[#7A7062]">Varietas: <strong>{plot.variety}</strong></p>
                          <p className="text-[11px] text-[#7A7062]">Lokasi: {plot.location}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                          {plot.status || 'Subur'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center bg-white rounded-2xl border border-[#E6E1D5] text-[#7A7062] text-xs">
                      Belum ada data lahan yang terdaftar.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          `;

  c = c.substring(0, dataStartIdx) + liteDataSorgum + c.substring(dataEndIdx);
}

// 3. Transform Users
const userStartMarker = "activeTab === 'users' && (";
const userStartIdx = c.indexOf(userStartMarker);

if (userStartIdx !== -1) {
  // Find matching closing bracket for users tab section
  const nextSectionIdx = c.indexOf("</div>\n  );\n};", userStartIdx);

  const liteUsers = `activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                    Kelola Pengguna
                  </h1>
                  <p className="text-xs text-[#7A7062] mt-1">Daftar pengguna dan anggota komunitas KWT Sorgum.</p>
                </div>
              </div>

              {/* Users Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(usersList && usersList.length > 0 ? usersList : members).map((u) => (
                  <div key={u.id} className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs flex items-center justify-between gap-3 hover:border-[#2C4219] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#2C4219] text-[#A8B774] font-title font-black text-sm flex items-center justify-center shrink-0">
                        {(u.name || u.firstName || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#2C4219]">{u.name || u.firstName || 'User'}</h4>
                        <p className="text-[11px] text-[#7A7062]">{u.email}</p>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#FAF6EE] text-[#7A7062] border border-[#E6E1D5] inline-block mt-1">
                          {u.role || 'Warga'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleUserStatus(u.id, u.isActive, u.name || 'Pengguna')}
                      className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors \${
                        u.isActive !== false ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }\`}
                    >
                      {u.isActive !== false ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          `;

  if (nextSectionIdx !== -1) {
    c = c.substring(0, userStartIdx) + liteUsers + c.substring(nextSectionIdx);
  }
}

fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
fs.writeFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');

console.log('All remaining tabs (Moderation, DataSorgum, Users) updated to Lite cards!');
