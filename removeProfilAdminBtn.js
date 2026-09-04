const fs = require('fs');

function cleanSidebarBottomLite(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // Replace sidebar bottom in Lite
  const targetLite = `              {/* Nav: Kelola Pengguna */}
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

          {/* Bottom Actions */}
          <div className="mt-auto space-y-2 pt-4 border-t border-[#E6E1D5]">
            {setAppMode && (
              <button
                onClick={() => setAppMode('pro')}
                title={isSidebarAdminCollapsed ? 'Pro Mode' : undefined}
                className={\`w-full flex items-center gap-2.5 py-2.5 rounded-full text-xs font-bold text-[#572E4A] hover:bg-[#572E4A]/10 transition-colors \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'px-4'}\`}
              >
                <ArrowRightLeft className="w-4 h-4 shrink-0" />
                {!isSidebarAdminCollapsed && <span>Pro Mode</span>}
              </button>
            )}
            <button
              onClick={onLogout}
              title={isSidebarAdminCollapsed ? 'Keluar' : undefined}
              className={\`w-full flex items-center gap-2.5 py-2.5 rounded-full text-xs font-bold text-[#C53030] hover:bg-[#C53030]/10 transition-colors \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'px-4'}\`}
            >
              <LogOut className="w-4 h-4 text-[#C53030] shrink-0" />
              {!isSidebarAdminCollapsed && <span>Keluar</span>}
            </button>
          </div>
        </div>
      </aside>`;

  const startIdx = c.indexOf("{/* Nav: Kelola Pengguna */}");
  const endIdx = c.indexOf("</aside>", startIdx);

  if (startIdx !== -1 && endIdx !== -1) {
    c = c.substring(0, startIdx) + targetLite + c.substring(endIdx + "</aside>".length);
    fs.writeFileSync(filePath, c, 'utf8');
    console.log(`Cleaned Lite sidebar bottom in ${filePath}`);
  } else {
    console.error(`Could not match Lite bounds in ${filePath}`);
  }
}

function cleanSidebarBottomPro(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  const profilBtnSnippet = `            <button
              onClick={() => handleTabChange('profil')}
              title={isSidebarAdminCollapsed ? 'Profil Admin' : undefined}
              className={\`w-full flex items-center gap-2.5 py-2.5 rounded-full text-xs font-bold transition-colors \${activeTab === 'profil' ? 'bg-[#2C4219] text-white shadow-sm' : 'text-[#2C4219] hover:bg-[#FAF6EE]'} \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'px-4'}\`}
            >
              <User className="w-4 h-4 shrink-0" />
              {!isSidebarAdminCollapsed && <span>Profil Admin</span>}
            </button>`;

  if (c.includes(profilBtnSnippet)) {
    c = c.replace(profilBtnSnippet, '');
    fs.writeFileSync(filePath, c, 'utf8');
    console.log(`Removed Profil Admin button in ${filePath}`);
  } else {
    console.log(`Profil Admin snippet not found in ${filePath} (might already be removed)`);
  }
}

cleanSidebarBottomLite('src/components/views/admin/AdminPortalViewLite.tsx');
cleanSidebarBottomLite('frontend/src/components/views/admin/AdminPortalViewLite.tsx');

cleanSidebarBottomPro('src/components/views/admin/AdminPortalView.tsx');
cleanSidebarBottomPro('frontend/src/components/views/admin/AdminPortalView.tsx');

console.log('Script finished.');
