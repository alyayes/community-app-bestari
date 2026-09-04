const fs = require('fs');
let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

// Replace mobile bottom nav
const oldNavMatch = c.match(/\{\/\* Admin Mobile Bottom Navigation \*\/\}([\s\S]*?)<\/div>\n  \);\n\};/);
if (oldNavMatch) {
  const newNav = `      {/* Admin Mobile Bottom Navigation */}
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
                    {isActive && (
                      <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#2C4219]"></span>
                    )}
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
};`;
  c = c.replace(oldNavMatch[0], newNav);
} else {
  console.log("Could not find bottom nav to replace");
}

fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
console.log('Mobile nav updated');
