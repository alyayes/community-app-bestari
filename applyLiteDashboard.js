const fs = require('fs');

let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const startMarker = "activeTab === 'dashboard' && (";
const endMarker = "{/* ==================== TAB 5: SETTINGS ==================== */}";

const startIdx = c.indexOf(startMarker);
const endIdx = c.indexOf(endMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find start or end marker!');
  process.exit(1);
}

const liteDashboardContent = `activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Header Greeting Card */}
              <div className="bg-[#2C4219] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A8B774]/20 text-[#A8B774] text-xs font-bold border border-[#A8B774]/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mode Lite Active</span>
                  </div>
                  <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#A8B774]">
                    Selamat Datang, {currentUser?.firstName || currentUser?.name || 'Admin'}!
                  </h1>
                  <p className="text-white/80 font-medium text-xs sm:text-sm max-w-lg">
                    Kelola kegiatan desa, informasi publik, diskusi, dan data sorgum dengan tampilan yang ringkas dan mudah dipahami.
                  </p>
                </div>
                <div className="absolute right-4 -bottom-4 opacity-10 pointer-events-none">
                  <Sprout className="w-48 h-48 text-white" />
                </div>
              </div>

              {/* 4 Primary Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                  onClick={() => handleTabChange('users')}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] hover:border-[#2C4219] transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2C4219] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">Total Pengguna</p>
                  <p className="font-title font-black text-2xl text-[#2C4219] mt-1">{dashboardStats?.totalUsers || members?.length || 0}</p>
                  <p className="text-[10px] text-emerald-700 font-medium mt-1">Anggota & Admin Komunitas</p>
                </div>

                <div 
                  onClick={() => handleTabChange('agenda')}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] hover:border-amber-600 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">Agenda Mendatang</p>
                  <p className="font-title font-black text-2xl text-[#2C4219] mt-1">{agendas?.length || 0}</p>
                  <p className="text-[10px] text-amber-700 font-medium mt-1">Kegiatan Terjadwal</p>
                </div>

                <div 
                  onClick={() => handleTabChange('informasi')}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] hover:border-blue-600 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">Informasi Aktif</p>
                  <p className="font-title font-black text-2xl text-[#2C4219] mt-1">{adminArticles?.length || articles?.length || 0}</p>
                  <p className="text-[10px] text-blue-700 font-medium mt-1">Artikel & Berita</p>
                </div>

                <div 
                  onClick={() => handleTabChange('moderation')}
                  className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] hover:border-purple-600 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">Diskusi Komunitas</p>
                  <p className="font-title font-black text-2xl text-[#2C4219] mt-1">{threads?.length || 0}</p>
                  <p className="text-[10px] text-purple-700 font-medium mt-1">Utas Diskusi Warga</p>
                </div>
              </div>

              {/* Quick Action Sections Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Agenda Terbaru */}
                <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#2C4219]" />
                      <h2 className="font-title font-bold text-lg text-[#2C4219]">Agenda Terdekat</h2>
                    </div>
                    <button 
                      onClick={() => handleTabChange('agenda')}
                      className="text-xs font-bold text-[#2C4219] hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {agendas && agendas.length > 0 ? (
                      agendas.slice(0, 3).map(ag => (
                        <div key={ag.id} className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#2C4219] text-white flex flex-col items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold uppercase">{ag.monthAbbr || 'OKT'}</span>
                              <span className="text-sm font-black leading-none">{ag.dayNumber || '10'}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-[#2C4219] line-clamp-1">{ag.title}</h4>
                              <p className="text-[11px] text-[#7A7062] flex items-center gap-2 mt-0.5">
                                <span>{ag.time}</span>
                                <span>•</span>
                                <span>{ag.location}</span>
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                            {ag.category}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#7A7062] text-center py-6">Belum ada agenda mendatang.</p>
                    )}
                  </div>
                </div>

                {/* Informasi Terbaru */}
                <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#2C4219]" />
                      <h2 className="font-title font-bold text-lg text-[#2C4219]">Informasi Terbaru</h2>
                    </div>
                    <button 
                      onClick={() => handleTabChange('informasi')}
                      className="text-xs font-bold text-[#2C4219] hover:underline flex items-center gap-1"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {adminArticles && adminArticles.length > 0 ? (
                      adminArticles.slice(0, 3).map(art => (
                        <div key={art.id} className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] flex items-center justify-between gap-3">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#7A7062]">{art.category}</span>
                            <h4 className="font-bold text-xs text-[#2C4219] line-clamp-1 mt-0.5">{art.title}</h4>
                            <p className="text-[11px] text-[#7A7062] mt-0.5">{art.date}</p>
                          </div>
                          <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 \${
                            art.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }\`}>
                            {art.status || 'Published'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#7A7062] text-center py-6">Belum ada artikel informasi.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          `;

const updatedFile = c.substring(0, startIdx) + liteDashboardContent + c.substring(endIdx);

fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', updatedFile, 'utf8');
fs.writeFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', updatedFile, 'utf8');

console.log('Successfully updated AdminPortalViewLite.tsx with Lite Dashboard!');
