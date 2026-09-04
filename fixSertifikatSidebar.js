const fs = require('fs');

let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

// 1. Add Sertifikat to Sidebar (if it's not there)
const sertifikatMenu = `
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
              </button>
`;

if (!c.includes("Kelola Sertifikat</span>")) {
    const insertPoint = "{/* Nav 5: Kelola Pengguna */}";
    c = c.replace(insertPoint, sertifikatMenu + '\n              ' + insertPoint);
}

// 2. Add isLiteMode={true} to CertificateBuilderView
c = c.replace(
    '<CertificateBuilderView\n                agendas={agendaList}',
    '<CertificateBuilderView\n                isLiteMode={true}\n                agendas={agendaList}'
);

fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
fs.writeFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
console.log('Added Sertifikat to Sidebar and enabled Lite mode prop!');
