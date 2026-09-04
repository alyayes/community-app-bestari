const fs = require('fs');

function updateBannerInFile(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  const oldBannerStart = "{/* Header Greeting Card */}";
  const oldBannerEnd = "</div>\n                <div className=\"absolute right-4 -bottom-4";

  const startIdx = c.indexOf(oldBannerStart);
  const endIdx = c.indexOf(oldBannerEnd, startIdx);

  if (startIdx !== -1 && endIdx !== -1) {
    const newBannerCode = `{/* Header Greeting Card */}
              <div className="bg-[#2C4219] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
                <div className="relative z-10 space-y-2">
                  <h1 className="font-title font-bold text-2xl sm:text-3xl text-white tracking-wide">
                    Selamat Datang, {currentUser?.firstName || currentUser?.name || 'Admin'}!
                  </h1>
                  <p className="text-[#FAF6EE]/90 font-medium text-xs sm:text-sm max-w-lg leading-relaxed">
                    Kelola kegiatan desa, informasi publik, diskusi, dan data sorgum dengan tampilan yang ringkas dan mudah dipahami.
                  </p>
                </div>`;

    c = c.substring(0, startIdx) + newBannerCode + c.substring(endIdx + "</div>\n".length);
    fs.writeFileSync(filePath, c, 'utf8');
    console.log(`Successfully updated banner contrast and removed badge in ${filePath}`);
  } else {
    console.error(`Could not find banner bounds in ${filePath}`);
  }
}

updateBannerInFile('src/components/views/admin/AdminPortalViewLite.tsx');
updateBannerInFile('frontend/src/components/views/admin/AdminPortalViewLite.tsx');

console.log('Finished banner contrast fix.');
