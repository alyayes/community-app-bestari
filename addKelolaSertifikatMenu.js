const fs = require('fs');

function addKelolaSertifikat(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  const navAgendaOld = `{/* Nav 2: Kelola Agenda */}
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
              </button>`;

  const navAgendaWithSertifikat = `{/* Nav 2: Kelola Agenda */}
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

              {/* Nav: Kelola Sertifikat */}
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
              </button>`;

  if (c.includes(navAgendaOld)) {
    c = c.replace(navAgendaOld, navAgendaWithSertifikat);
    fs.writeFileSync(filePath, c, 'utf8');
    console.log('Successfully added Kelola Sertifikat menu to ' + filePath);
  } else {
    console.error('Could not find navAgendaOld in ' + filePath);
  }
}

addKelolaSertifikat('src/components/views/admin/AdminPortalViewLite.tsx');
addKelolaSertifikat('frontend/src/components/views/admin/AdminPortalViewLite.tsx');

console.log('Finished adding Kelola Sertifikat menu.');
