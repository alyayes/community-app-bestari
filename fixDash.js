const fs = require('fs');
let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const oldDash = `<DashboardDesaView
              dashboardStats={dashboardStats}
              members={members}
              agendas={agendas}
              landPlots={landPlots}
              harvestRecords={harvestRecords}
              threads={threads}
              articles={articles}
              onNavigateToPage={handleTabChange}
              onUpdateAgendas={onUpdateAgendas}
            />`;

const newDash = `<div className="space-y-6">
              <div className="bg-[#2C4219] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
                <div className="relative z-10 space-y-2">
                  <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#A8B774]">Halo, {currentUser?.firstName || 'Admin'}!</h1>
                  <p className="text-white/80 font-medium text-sm sm:text-base max-w-lg">Selamat datang di Admin Lite. Kelola kegiatan dan informasi dengan mudah melalui mode sederhana ini.</p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
                  <Sprout className="w-48 h-48" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] flex flex-col gap-1 cursor-pointer hover:border-[#2C4219] transition-colors" onClick={() => handleTabChange('users')}>
                  <Users className="w-5 h-5 text-[#2C4219]" />
                  <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider mt-2">Total Pengguna</p>
                  <p className="font-title font-black text-2xl text-[#2C4219]">{dashboardStats?.totalUsers || members.length || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] flex flex-col gap-1 cursor-pointer hover:border-[#2C4219] transition-colors" onClick={() => handleTabChange('agenda')}>
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider mt-2">Agenda Terdekat</p>
                  <p className="font-title font-black text-2xl text-[#2C4219]">{agendaList?.filter(a => a.status === 'Belum dimulai').length || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] flex flex-col gap-1 cursor-pointer hover:border-[#2C4219] transition-colors" onClick={() => handleTabChange('informasi')}>
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider mt-2">Info Aktif</p>
                  <p className="font-title font-black text-2xl text-[#2C4219]">{adminArticles?.filter(a => (a as any).status !== 'Draft').length || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#E6E1D5] flex flex-col gap-1 cursor-pointer hover:border-[#2C4219] transition-colors" onClick={() => handleTabChange('moderation')}>
                  <MessageSquare className="w-5 h-5 text-rose-600" />
                  <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider mt-2">Diskusi</p>
                  <p className="font-title font-black text-2xl text-[#2C4219]">{threads?.length || 0}</p>
                </div>
              </div>
            </div>`;

if (c.includes(oldDash)) {
  c = c.replace(oldDash, newDash);
  fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
  console.log('Dashboard replaced');
} else {
  console.log('Dashboard not found');
}
