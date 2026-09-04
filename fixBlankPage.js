const fs = require('fs');

let c = fs.readFileSync('src/components/views/admin/AdminPortalView.tsx', 'utf8');

// 1. Add ArrowRightLeft to lucide-react imports if not there
if (!c.includes('ArrowRightLeft')) {
  c = c.replace(
    '  Award\n} from \'lucide-react\';',
    '  Award,\n  ArrowRightLeft\n} from \'lucide-react\';'
  );
}

// 2. Add setAppMode to interface
if (!c.includes('setAppMode?:')) {
  c = c.replace(
    'interface AdminPortalViewProps {',
    'interface AdminPortalViewProps {\n  setAppMode?: (mode: \'lite\' | \'pro\') => void;'
  );
  c = c.replace(
    'export const AdminPortalView: React.FC<AdminPortalViewProps> = ({',
    'export const AdminPortalView: React.FC<AdminPortalViewProps> = ({\n  setAppMode,'
  );
}

// 3. Add Lite Mode Button above LogOut
const logoutButtonOld = `<button
              onClick={onLogout}
              title={isSidebarAdminCollapsed ? 'Keluar' : undefined}`;

const liteSwitchButton = `{setAppMode && (
              <button
                onClick={() => setAppMode('lite')}
                title={isSidebarAdminCollapsed ? 'Lite Mode' : undefined}
                className={\`w-full flex items-center gap-2.5 py-2.5 rounded-full text-xs font-bold bg-[#E3EBD3] text-[#2C4219] border border-[#A8B774]/40 hover:bg-[#2C4219] hover:text-white transition-all shadow-2xs \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'px-4'}\`}
              >
                <ArrowRightLeft className="w-4 h-4 shrink-0" />
                {!isSidebarAdminCollapsed && <span>Lite Mode</span>}
              </button>
            )}
            <button
              onClick={onLogout}
              title={isSidebarAdminCollapsed ? 'Keluar' : undefined}`;

if (c.includes(logoutButtonOld) && !c.includes("setAppMode('lite')")) {
  c = c.replace(logoutButtonOld, liteSwitchButton);
}

fs.writeFileSync('src/components/views/admin/AdminPortalView.tsx', c, 'utf8');
fs.writeFileSync('frontend/src/components/views/admin/AdminPortalView.tsx', c, 'utf8');

console.log('Fixed blank page by injecting ArrowRightLeft import and Lite Mode button.');
