const fs = require('fs');
let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

// 1. Force activeTab to be 'sertifikat' initially
c = c.replace(
    /const \[activeTab, setActiveTab\] = useState<AdminTab>\(\(\) => \{[\s\S]*?return saved \|\| 'dashboard';[\s\S]*?\}\);/,
    "const [activeTab, setActiveTab] = useState<AdminTab>(() => {\n      return 'sertifikat';\n    });"
);

// 2. Replace all nav items in Sidebar EXCEPT sertifikat
const navRegex = /<nav className="space-y-2 pt-2">[\s\S]*?<\/nav>/;
const newNav = `<nav className="space-y-2 pt-2">
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
            </nav>`;
c = c.replace(navRegex, newNav);

// 3. Replace bottom navigation to ONLY have sertifikat
const bottomNavRegex = /\{\[\s*\{\s*id:\s*'dashboard'[\s\S]*?\s*\]\.map\(\(item\) => \{/;
const newBottomNav = `{[
            { id: 'sertifikat', label: 'Sertifikat', icon: <Award className="w-6 h-6" />, isProminent: true }
          ].map((item) => {`;
c = c.replace(bottomNavRegex, newBottomNav);

// 4. Optionally, remove the rendering of all other tabs so the bundle is smaller and to prevent any bugs if they somehow change the tab
const tabContentRegex = /\{\/\* ==================== TAB 1: KELOLA INFORMASI ==================== \*\/\}[\s\S]*?(?=\{\/\* Admin Mobile Bottom Navigation \*\/)/;
// We leave only the Sertifikat tab block untouched because it's before TAB 1.
c = c.replace(tabContentRegex, '\n      </div>\n\n      ');

fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
fs.writeFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
console.log('Successfully isolated Lite Mode to only Kelola Sertifikat!');
