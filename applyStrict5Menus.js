const fs = require('fs');

function applyStrict5Menus(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  const navStart = c.indexOf('<nav className="space-y-2 pt-2">');
  const navEnd = c.indexOf('</nav>', navStart);

  if (navStart !== -1 && navEnd !== -1) {
    const new5Nav = `<nav className="space-y-2 pt-2">
              {/* Nav 1: Dashboard */}
              <button
                onClick={() => handleTabChange('dashboard')}
                title={isSidebarAdminCollapsed ? 'Dashboard' : undefined}
                className={\`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex \${activeTab === 'dashboard'
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
                className={\`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex \${activeTab === 'agenda'
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
                className={\`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex \${activeTab === 'informasi'
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
                className={\`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex \${activeTab === 'moderation'
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
                className={\`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex \${activeTab === 'users'
                  ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                  : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                  } \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}\`}
              >
                <Users className={\`w-4 h-4 \${activeTab === 'users' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0\`} />
                {!isSidebarAdminCollapsed && <span>Kelola Pengguna</span>}
              </button>
            </nav>`;

    c = c.substring(0, navStart) + new5Nav + c.substring(navEnd + '</nav>'.length);
    fs.writeFileSync(filePath, c, 'utf8');
    console.log(`Successfully updated sidebar menu to 5 items in ${filePath}`);
  } else {
    console.error(`Could not find nav bounds in ${filePath}`);
  }
}

applyStrict5Menus('src/components/views/admin/AdminPortalViewLite.tsx');
applyStrict5Menus('frontend/src/components/views/admin/AdminPortalViewLite.tsx');

console.log('Finished 5-menu strict update.');
