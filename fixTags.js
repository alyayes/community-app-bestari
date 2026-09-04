const fs = require('fs');
let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

c = c.replace(
  '\n      </div>\n\n      {/* Admin Mobile Bottom Navigation */}',
  '\n        </div>\n      </main>\n\n      {/* Admin Mobile Bottom Navigation */}'
);

fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
fs.writeFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', c, 'utf8');
console.log('Fixed tags');
