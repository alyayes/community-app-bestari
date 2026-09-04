const fs = require('fs');

function updateModeSwitchInFile(filePath, modeTarget) {
  let c = fs.readFileSync(filePath, 'utf8');

  const oldTarget = `className={\`w-full flex items-center gap-2.5 py-2.5 rounded-full text-xs font-bold text-[#572E4A] hover:bg-[#572E4A]/10 transition-colors \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'px-4'}\`}`;
  
  const newTarget = `className={\`w-full flex items-center gap-2.5 py-2.5 rounded-full text-xs font-bold bg-[#E3EBD3] text-[#2C4219] border border-[#A8B774]/40 hover:bg-[#2C4219] hover:text-white transition-all shadow-2xs \${isSidebarAdminCollapsed ? 'justify-center px-0 w-10 h-10 mx-auto' : 'px-4'}\`}`;

  if (c.includes(oldTarget)) {
    c = c.replace(oldTarget, newTarget);
    fs.writeFileSync(filePath, c, 'utf8');
    console.log(`Successfully updated mode switch button to green badge in ${filePath}`);
  } else {
    console.log(`Could not find old target in ${filePath}`);
  }
}

updateModeSwitchInFile('src/components/views/admin/AdminPortalViewLite.tsx', 'pro');
updateModeSwitchInFile('frontend/src/components/views/admin/AdminPortalViewLite.tsx', 'pro');

updateModeSwitchInFile('src/components/views/admin/AdminPortalView.tsx', 'lite');
updateModeSwitchInFile('frontend/src/components/views/admin/AdminPortalView.tsx', 'lite');

console.log('Finished updating green badge mode switch buttons.');
