const fs = require('fs');

function fixCertFullWidth(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  // 1. Remove squishing padding from top container
  c = c.replace(
    '<div className="p-4 sm:p-6 lg:p-8 space-y-6">',
    '<div className="w-full space-y-6">'
  );

  // 2. Expand Agenda Selector Box to full width with 3-4 column grid
  const oldBox = `<div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-[#E6E1D5] p-2 sm:p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">`;
  const newBox = `<div className="w-full bg-white rounded-3xl border border-[#E6E1D5] p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">`;
  c = c.replace(oldBox, newBox);

  const oldGrid = `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto custom-scrollbar p-1">`;
  const newGrid = `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">`;
  c = c.replace(oldGrid, newGrid);

  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Successfully updated CertificateBuilderView full width in ' + filePath);
}

fixCertFullWidth('src/components/views/admin/CertificateBuilderView.tsx');
fixCertFullWidth('frontend/src/components/views/admin/CertificateBuilderView.tsx');

console.log('Finished full width fix for CertificateBuilderView.');
