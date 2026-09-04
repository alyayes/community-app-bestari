const fs = require('fs');

function separateCards(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  const oldOuterBox = `<div className="w-full bg-white rounded-3xl border border-[#E6E1D5] p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">`;
  const newOuterBox = `<div className="w-full animate-in fade-in slide-in-from-top-2 duration-300">`;

  if (c.includes(oldOuterBox)) {
    c = c.replace(oldOuterBox, newOuterBox);
    fs.writeFileSync(filePath, c, 'utf8');
    console.log('Successfully separated certificate cards in ' + filePath);
  } else {
    console.error('Could not find oldOuterBox in ' + filePath);
  }
}

separateCards('src/components/views/admin/CertificateBuilderView.tsx');
separateCards('frontend/src/components/views/admin/CertificateBuilderView.tsx');

console.log('Finished separating certificate cards.');
