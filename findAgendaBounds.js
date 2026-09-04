const fs = require('fs');
const c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const agendaStart = c.indexOf("activeTab === 'agenda' && (");
const agendaEnd = c.indexOf("{/* ==================== TAB", agendaStart + 30);

console.log('Agenda start:', agendaStart);
console.log('Agenda end:', agendaEnd);
if (agendaStart !== -1 && agendaEnd !== -1) {
  console.log(c.substring(agendaStart, agendaStart + 400));
}
