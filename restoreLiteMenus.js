const fs = require('fs');

const FILE_PATH = 'src/components/views/admin/AdminPortalViewLite.tsx';
let content = fs.readFileSync(FILE_PATH, 'utf8');

const newNav = `<nav className="space-y-2 pt-2">
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

                {/* Nav 3: Kelola Sertifikat */}
                <button
                  onClick={() => handleTabChange('sertifikat')}
                  title={isSidebarAdminCollapsed ? 'Kelola Sertifikat' : undefined}
                  className={\`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex \${activeTab === 'sertifikat'
                    ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                    : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                    } \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}\`}
                >
                  <Award className={\`w-4 h-4 \${activeTab === 'sertifikat' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0\`} />
                  {!isSidebarAdminCollapsed && <span>Kelola Sertifikat</span>}
                </button>

                {/* Nav 4: Kelola Informasi */}
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
                
                {/* Nav 5: Kelola Diskusi */}
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

                {/* Nav 6: Kelola Data Sorgum */}
                <button
                  onClick={() => handleTabChange('datasorgum')}
                  title={isSidebarAdminCollapsed ? 'Kelola Data Sorgum' : undefined}
                  className={\`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex \${activeTab === 'datasorgum'
                    ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                    : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                    } \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}\`}
                >
                  <Sprout className={\`w-4 h-4 \${activeTab === 'datasorgum' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0\`} />
                  {!isSidebarAdminCollapsed && <span>Kelola Data Sorgum</span>}
                </button>

                {/* Nav 7: Kelola Pengguna */}
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

                {/* Nav 8: Kelola Konten */}
                <button
                  onClick={() => handleTabChange('cms')}
                  title={isSidebarAdminCollapsed ? 'Kelola Konten' : undefined}
                  className={\`w-full items-center py-2.5 rounded-full font-bold text-xs transition-all flex \${activeTab === 'cms'
                    ? 'bg-[#2C4219] text-white shadow-sm border border-[#A8B774]/30'
                    : 'text-[#433A30] hover:bg-[#FAF6EE] hover:text-[#2C4219]'
                    } \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'gap-3 px-4'}\`}
                >
                  <Layers className={\`w-4 h-4 \${activeTab === 'cms' ? 'text-[#A8B774]' : 'text-[#433A30]/70'} shrink-0\`} />
                  {!isSidebarAdminCollapsed && <span>Kelola Konten</span>}
                </button>
              </nav>`;

const startNav = content.indexOf('<nav className="space-y-2 pt-2">');
const endNav = content.indexOf('</nav>', startNav) + '</nav>'.length;

if (startNav !== -1 && endNav !== -1) {
  content = content.substring(0, startNav) + newNav + content.substring(endNav);
  
  // also make sure imports exist
  if (!content.includes('MessageSquare')) {
    content = content.replace('LayoutDashboard,', 'LayoutDashboard,\n  MessageSquare,\n  Sprout,\n  Layers,');
  }

  fs.writeFileSync(FILE_PATH, content, 'utf8');
  console.log('Successfully restored all 8 menus in AdminPortalViewLite.tsx');
} else {
  console.log('Failed to find nav section');
}
