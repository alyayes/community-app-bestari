const fs = require('fs');

function updateLiteMenu5Items(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // 1. Update Sidebar Nav Items to exactly 5 items
  const sidebarNavOldStart = "<nav className=\"space-y-1 sm:space-y-1.5 flex-1 px-3\">";
  const sidebarNavOldEnd = "</nav>\n          </div>\n\n          {/* Bottom Actions */}";

  const startIdx = c.indexOf(sidebarNavOldStart);
  const endIdx = c.indexOf(sidebarNavOldEnd, startIdx);

  if (startIdx !== -1 && endIdx !== -1) {
    const newSidebarNav = `<nav className="space-y-1 sm:space-y-1.5 flex-1 px-3">
              {/* Nav 1: Dashboard */}
              <button
                onClick={() => handleTabChange('dashboard')}
                title={isSidebarAdminCollapsed ? 'Dashboard' : undefined}
                className={\`w-full flex items-center py-2.5 rounded-full font-bold text-xs transition-all \${activeTab === 'dashboard'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}\`}
              >
                <LayoutDashboard className={\`w-4 h-4 \${activeTab === 'dashboard' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0\`} />
                {!isSidebarAdminCollapsed && <span>Dashboard</span>}
              </button>

              {/* Nav 2: Kelola Agenda */}
              <button
                onClick={() => handleTabChange('agenda')}
                title={isSidebarAdminCollapsed ? 'Kelola Agenda' : undefined}
                className={\`w-full flex items-center py-2.5 rounded-full font-bold text-xs transition-all \${activeTab === 'agenda'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}\`}
              >
                <Calendar className={\`w-4 h-4 \${activeTab === 'agenda' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0\`} />
                {!isSidebarAdminCollapsed && <span>Kelola Agenda</span>}
              </button>

              {/* Nav 3: Kelola Informasi */}
              <button
                onClick={() => handleTabChange('informasi')}
                title={isSidebarAdminCollapsed ? 'Kelola Informasi' : undefined}
                className={\`w-full flex items-center py-2.5 rounded-full font-bold text-xs transition-all \${activeTab === 'informasi'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}\`}
              >
                <FileText className={\`w-4 h-4 \${activeTab === 'informasi' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0\`} />
                {!isSidebarAdminCollapsed && <span>Kelola Informasi</span>}
              </button>

              {/* Nav 4: Kelola Diskusi */}
              <button
                onClick={() => handleTabChange('moderation')}
                title={isSidebarAdminCollapsed ? 'Kelola Diskusi' : undefined}
                className={\`w-full flex items-center py-2.5 rounded-full font-bold text-xs transition-all \${activeTab === 'moderation'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}\`}
              >
                <MessageSquare className={\`w-4 h-4 \${activeTab === 'moderation' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0\`} />
                {!isSidebarAdminCollapsed && <span>Kelola Diskusi</span>}
              </button>

              {/* Nav 5: Kelola Pengguna */}
              <button
                onClick={() => handleTabChange('users')}
                title={isSidebarAdminCollapsed ? 'Kelola Pengguna' : undefined}
                className={\`w-full flex items-center py-2.5 rounded-full font-bold text-xs transition-all \${activeTab === 'users'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}\`}
              >
                <Users className={\`w-4 h-4 \${activeTab === 'users' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0\`} />
                {!isSidebarAdminCollapsed && <span>Kelola Pengguna</span>}
              </button>
            </nav>
          </div>

          {/* Bottom Actions */}`;

    c = c.substring(0, startIdx) + newSidebarNav + c.substring(endIdx + sidebarNavOldEnd.length);
  } else {
    console.error('Could not find sidebar nav bounds in ' + filePath);
  }

  // 2. Update Mobile Bottom Nav (5 direct items, no "Lainnya" popup!)
  const mobileNavStartMarker = "{/* Admin Mobile Bottom Navigation */}";
  const mobileNavStartIdx = c.indexOf(mobileNavStartMarker);

  if (mobileNavStartIdx !== -1) {
    const newMobileNav = `{/* Admin Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6E1D5] flex md:hidden items-center justify-around pb-safe z-40">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
          { id: 'informasi', label: 'Informasi', icon: <FileText className="w-5 h-5" /> },
          { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-6 h-6" />, isProminent: true },
          { id: 'moderation', label: 'Diskusi', icon: <MessageSquare className="w-5 h-5" /> },
          { id: 'users', label: 'Pengguna', icon: <Users className="w-5 h-5" /> },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as AdminTab)}
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
    </div>
  );
};`;

    c = c.substring(0, mobileNavStartIdx) + newMobileNav;
  }

  fs.writeFileSync(filePath, c, 'utf8');
  console.log(`Updated 5 direct menu items & removed popup in ${filePath}`);
}

updateLiteMenu5Items('src/components/views/admin/AdminPortalViewLite.tsx');
updateLiteMenu5Items('frontend/src/components/views/admin/AdminPortalViewLite.tsx');

console.log('Finished 5-menu update.');
