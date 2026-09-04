const fs=require('fs'); 
let c=fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx','utf8'); 
c=c.replace(/export const AdminPortalView:/g, 'export const AdminPortalViewLite:'); 
c=c.replace(/setAppMode\('lite'\)/g, "setAppMode('pro')"); 
c=c.replace(/<span>Lite Mode<\/span>/g, '<span>Pro Mode</span>'); 
c=c.replace(/'Lite Mode'/g, "'Pro Mode'");
fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', c); 
fs.writeFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', c);
