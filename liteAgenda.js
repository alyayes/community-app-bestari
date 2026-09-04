const fs = require('fs');

let c = fs.readFileSync('src/components/views/admin/AdminPortalViewLite.tsx', 'utf8');

const agendaStartMarker = "activeTab === 'agenda' && (";
const agendaEndMarker = "{/* ==================== TAB";

const startIdx = c.indexOf(agendaStartMarker);
const endIdx = c.indexOf(agendaEndMarker, startIdx + 30);

if (startIdx === -1 || endIdx === -1) {
  console.error('Agenda markers not found!');
  process.exit(1);
}

const liteAgendaContent = `activeTab === 'agenda' && (
            <div className="space-y-6">

              {/* Header Title + Add Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                    Kelola Agenda Kegiatan
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  {subTabAgenda === 'list' ? (
                    <button
                      onClick={() => {
                        setEditingAgenda(null);
                        setAgendaTitle('');
                        setAgendaCategory('WORKSHOP');
                        setAgendaDate('');
                        setAgendaTime('');
                        setAgendaLocation('');
                        setAgendaOrganizer('KWT Sari');
                        setAgendaDescription('');
                        setSubTabAgenda('tambah');
                      }}
                      className="px-5 py-3 rounded-2xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs flex items-center gap-2 shadow-md transition-all shrink-0 active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-[#A8B774]" />
                      <span>Buat Agenda Baru</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSubTabAgenda('list')}
                      className="px-4 py-2.5 rounded-xl border border-[#E6E1D5] bg-white hover:bg-[#FAF6EE] text-[#2C4219] font-bold text-xs flex items-center gap-2 transition-all shrink-0"
                    >
                      <span>Kembali ke Daftar Agenda</span>
                    </button>
                  )}
                </div>
              </div>

              {subTabAgenda === 'list' ? (
                /* Lite Agenda Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agendaList && agendaList.length > 0 ? (
                    agendaList.map((ag) => (
                      <div 
                        key={ag.id}
                        className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs flex flex-col justify-between gap-4 hover:border-[#2C4219] transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-[#2C4219] text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8B774]">{ag.monthAbbr || 'OKT'}</span>
                            <span className="text-lg font-black leading-none">{ag.dayNumber || '10'}</span>
                          </div>

                          <div className="space-y-1 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {ag.category}
                              </span>
                            </div>
                            <h3 className="font-title font-bold text-base text-[#2C4219] line-clamp-1">{ag.title}</h3>
                            <p className="text-xs text-[#7A7062] flex items-center gap-1.5 pt-1">
                              <Clock className="w-3.5 h-3.5 text-[#2C4219]" />
                              <span>{ag.time}</span>
                            </p>
                            <p className="text-xs text-[#7A7062] flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#2C4219]" />
                              <span>{ag.location}</span>
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-between">
                          <span className="text-[11px] text-[#7A7062]">Penyelenggara: <strong>{ag.organizer || 'KWT'}</strong></span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditAgenda(ag)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteAgenda(ag.id, ag.title)}
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
                      Belum ada agenda yang tersimpan.
                    </div>
                  )}
                </div>
              ) : (
                /* Form Tambah/Edit Agenda */
                <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-4 max-w-2xl">
                  <h2 className="font-title font-bold text-lg text-[#2C4219]">
                    {editingAgenda ? 'Sunting Agenda' : 'Tambah Agenda Baru'}
                  </h2>
                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-[#2C4219] mb-1">Judul Agenda</label>
                      <input
                        type="text"
                        value={agendaTitle}
                        onChange={(e) => setAgendaTitle(e.target.value)}
                        placeholder="Contoh: Workshop Olahan Sorgum"
                        className="w-full p-3 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] text-xs font-bold text-[#2C4219] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#2C4219] mb-1">Kategori</label>
                        <select
                          value={agendaCategory}
                          onChange={(e) => setAgendaCategory(e.target.value)}
                          className="w-full p-3 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] text-xs font-bold text-[#2C4219] focus:outline-none"
                        >
                          <option value="WORKSHOP">WORKSHOP</option>
                          <option value="PANEN BERSAMA">PANEN BERSAMA</option>
                          <option value="PELATIHAN UMKM">PELATIHAN UMKM</option>
                          <option value="RAPAT KWT">RAPAT KWT</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-[#2C4219] mb-1">Tanggal (Contoh: 10 Okt 2026)</label>
                        <input
                          type="text"
                          value={agendaDate}
                          onChange={(e) => setAgendaDate(e.target.value)}
                          placeholder="10 Okt 2026"
                          className="w-full p-3 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] text-xs font-bold text-[#2C4219] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-[#2C4219] mb-1">Waktu (Contoh: 09:00 - 12:00)</label>
                        <input
                          type="text"
                          value={agendaTime}
                          onChange={(e) => setAgendaTime(e.target.value)}
                          placeholder="09:00 - 12:00"
                          className="w-full p-3 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] text-xs font-bold text-[#2C4219] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-[#2C4219] mb-1">Lokasi</label>
                        <input
                          type="text"
                          value={agendaLocation}
                          onChange={(e) => setAgendaLocation(e.target.value)}
                          placeholder="Balai Desa / Lahan"
                          className="w-full p-3 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] text-xs font-bold text-[#2C4219] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-[#2C4219] mb-1">Deskripsi Ringkas</label>
                      <textarea
                        rows={3}
                        value={agendaDescription}
                        onChange={(e) => setAgendaDescription(e.target.value)}
                        placeholder="Penjelasan singkat agenda..."
                        className="w-full p-3 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] text-xs font-bold text-[#2C4219] focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setSubTabAgenda('list')}
                        className="px-4 py-2.5 rounded-xl border border-[#E6E1D5] hover:bg-[#FAF6EE] text-[#7A7062] font-bold text-xs"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSaveAgenda}
                        className="px-5 py-2.5 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-bold text-xs shadow-md"
                      >
                        Simpan Agenda
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          `;

const updatedFile = c.substring(0, startIdx) + liteAgendaContent + c.substring(endIdx);
fs.writeFileSync('src/components/views/admin/AdminPortalViewLite.tsx', updatedFile, 'utf8');
fs.writeFileSync('frontend/src/components/views/admin/AdminPortalViewLite.tsx', updatedFile, 'utf8');

console.log('Agenda tab updated to Lite cards!');
