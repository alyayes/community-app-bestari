const fs = require('fs');

let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const endOfFileSection = `        </div>
      </main>

      {/* ========== MODAL: Preview Artikel (tampil di dalam admin) ========== */}
      <ArticleDetailModal
        article={previewArticle}
        onClose={() => setPreviewArticle(null)}
      />

      {/* ========== MODAL: Konfirmasi Hapus (Artikel / Pengumuman / Agenda) ========== */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95">

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-title font-bold text-base text-[#2C4219]">
                    Hapus {deleteConfirmModal.type === 'artikel' ? 'Artikel' : deleteConfirmModal.type === 'pengumuman' ? 'Pengumuman' : deleteConfirmModal.type === 'pengguna' ? 'Pengguna' : 'Agenda'}
                  </h3>
                  <p className="text-xs text-[#7A7062]">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="p-1 rounded-lg hover:bg-[#FAF6EE] text-[#7A7062] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Detail item */}
            <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E6E1D5] space-y-1">
              <p className="text-[11px] font-bold text-[#7A7062] uppercase tracking-wider">
                {deleteConfirmModal.type === 'artikel' ? 'Judul Artikel' : deleteConfirmModal.type === 'pengumuman' ? 'Judul Pengumuman' : deleteConfirmModal.type === 'pengguna' ? 'Nama Pengguna' : 'Judul Agenda'}
              </p>
              <p className="font-bold text-xs text-[#2C4219] line-clamp-2">
                "{deleteConfirmModal.title}"
              </p>
              <p className="text-[11px] text-rose-700 font-medium pt-2 border-t border-[#E6E1D5]">
                Data yang dihapus tidak bisa dikembalikan.
              </p>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="w-full py-2.5 rounded-xl border-2 border-[#2C4219] text-[#2C4219] font-bold text-xs hover:bg-[#2C4219]/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Date Warning Modal */}
      {showDateWarning && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-title font-bold text-xl text-[#2C4219] mb-2">Tanggal Tidak Valid</h3>
            <p className="text-sm text-[#7A7062] mb-6 leading-relaxed">
              Anda tidak dapat {editingAgenda ? 'mengubah' : 'menambahkan'} agenda dengan tanggal di masa lalu. Silakan pilih hari ini atau tanggal di masa mendatang.
            </p>
            <button
              onClick={() => setShowDateWarning(false)}
              className="w-full py-3 px-4 bg-[#2C4219] hover:bg-[#1E2E11] text-white font-bold rounded-xl transition-colors shadow-lg"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Admin Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6E1D5] flex md:hidden items-center justify-around pb-safe z-40">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'informasi', label: 'Informasi', icon: <FileText className="w-5 h-5" /> },
          { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-6 h-6" />, isProminent: true },
          { id: 'moderation', label: 'Diskusi', icon: <MessageSquare className="w-5 h-5" /> },
          { id: 'more', label: 'Lainnya', icon: <MoreHorizontal className="w-5 h-5" /> },
        ].map((item) => {
          const isActive = item.id === 'more' ? isLiteMoreMenuOpen : activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'more') {
                  setIsLiteMoreMenuOpen(!isLiteMoreMenuOpen);
                } else {
                  handleTabChange(item.id as AdminTab);
                  setIsLiteMoreMenuOpen(false);
                }
              }}
              className={\`flex flex-col items-center justify-center w-full py-2 relative transition-all duration-300 \${isActive && !item.isProminent ? 'text-[#2C4219]' : 'text-[#7A7062] hover:text-[#433A30]'}\`}
            >
              {!item.isProminent && (
                <div className={\`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-md transition-all duration-300 bg-[#2C4219] \${isActive ? 'w-1/2 opacity-100' : 'w-0 opacity-0'}\`}></div>
              )}
              {item.isProminent ? (
                <div className="flex flex-col items-center justify-center -mt-8 group">
                  <div className={\`relative w-14 h-14 flex items-center justify-center rounded-full border-4 border-white shadow-lg transition-all duration-300 active:scale-95 \${isActive ? 'bg-[#2C4219] text-[#A8B774] shadow-[#2C4219]/40 -translate-y-1' : 'bg-[#2C4219] text-white hover:-translate-y-0.5'}\`}>
                    {item.icon}
                  </div>
                  <span className={\`text-[10px] font-black mt-1.5 transition-colors \${isActive ? 'text-[#2C4219]' : 'text-[#7A7062]'}\`}>{item.label}</span>
                </div>
              ) : (
                <>
                  <div className={\`transition-transform duration-300 \${isActive ? '-translate-y-0.5' : ''}\`}>
                    {item.icon}
                  </div>
                  <span className={\`text-[9px] font-bold mt-1 transition-all duration-300 \${isActive ? 'opacity-100' : 'opacity-80'}\`}>{item.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* "LAINNYA" POPUP MENU (mobile Lite only) */}
      {isLiteMoreMenuOpen && (
        <>
          <div className="fixed inset-0 z-30 md:hidden" onClick={() => setIsLiteMoreMenuOpen(false)} />
          <div className="fixed bottom-16 right-3 z-40 bg-white rounded-2xl shadow-2xl border border-[#E6E1D5] w-56 overflow-hidden md:hidden animate-fade-in">
            <div className="p-2 space-y-0.5">
              <button
                onClick={() => { handleTabChange('datasorgum'); setIsLiteMoreMenuOpen(false); }}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors \${activeTab === 'datasorgum' ? 'bg-[#2C4219] text-white' : 'text-[#433A30] hover:bg-[#FAF6EE]'}\`}
              >
                <Sprout className="w-5 h-5 shrink-0" />
                <span>Data Sorgum</span>
              </button>
              <button
                onClick={() => { handleTabChange('users'); setIsLiteMoreMenuOpen(false); }}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors \${activeTab === 'users' ? 'bg-[#2C4219] text-white' : 'text-[#433A30] hover:bg-[#FAF6EE]'}\`}
              >
                <Users className="w-5 h-5 shrink-0" />
                <span>Kelola Pengguna</span>
              </button>
              <div className="border-t border-[#E6E1D5] my-1" />
              {setAppMode && (
                <button
                  onClick={() => { setIsLiteMoreMenuOpen(false); setAppMode('pro'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#572E4A] hover:bg-[#572E4A]/10 transition-colors"
                >
                  <ArrowRightLeft className="w-5 h-5 shrink-0" />
                  <span>Pro Mode</span>
                </button>
              )}
              <button
                onClick={() => { setIsLiteMoreMenuOpen(false); onLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#C53030] hover:bg-[#C53030]/10 transition-colors"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
`;

// Replace from line 2999 (`</div>\n  );\n};`) to the end of file
const cutIdx = c.lastIndexOf("</div>\n  );\n};");
if (cutIdx !== -1) {
  c = c.substring(0, cutIdx) + endOfFileSection;
  fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
  fs.writeFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
  console.log('Fixed end of AdminPortalViewLite.tsx successfully!');
} else {
  console.error('Could not find cut index');
}
