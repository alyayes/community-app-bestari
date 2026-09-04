const fs = require('fs');

let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const infoStartMarker = "{/* Articles Data Table */}";
const infoEndMarker = "{/* ==================== TAB 2: KELOLA PENGUMUMAN";

const startIdx = c.indexOf(infoStartMarker);
const endIdx = c.indexOf(infoEndMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found!');
  process.exit(1);
}

const liteInformasiCards = `{/* Lite Informasi Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((art) => (
                    <div 
                      key={art.id}
                      className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs flex flex-col justify-between gap-4 hover:border-[#2C4219] transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FAF6EE] text-[#7A7062] border border-[#E6E1D5] uppercase tracking-wider">
                            {art.category}
                          </span>
                          <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full \${
                            art.status === 'Draft' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }\`}>
                            {art.status || 'Published'}
                          </span>
                        </div>

                        <h3 className="font-title font-bold text-base text-[#2C4219] line-clamp-2">
                          {art.title}
                        </h3>

                        <p className="text-xs text-[#7A7062] line-clamp-2">
                          {art.summary || (art.content ? art.content.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '')}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-between">
                        <span className="text-[11px] text-[#7A7062] font-medium">
                          {art.date}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewArticle(art)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#2C4219] hover:bg-[#FAF6EE] transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditArticle(art)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id, art.title)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[#E6E1D5] text-[#7A7062] font-semibold text-xs">
                    Tidak ada informasi yang ditemukan.
                  </div>
                )}
              </div>

            </div>
          )}

          `;

const updatedFile = c.substring(0, startIdx) + liteInformasiCards + c.substring(endIdx);
fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', updatedFile, 'utf8');
fs.writeFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', updatedFile, 'utf8');

console.log('Informasi tab updated to Lite cards!');
