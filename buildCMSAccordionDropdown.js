const fs = require('fs');

function transformCmsToAccordion(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');

  const cmsStartMarker = "{activeTab === 'cms' && (";
  const startIdx = c.indexOf(cmsStartMarker);
  
  const cmsEndMarker = "{/* ==================== TAB: KELOLA PENGGUNA ==================== */}";
  const endIdx = c.indexOf(cmsEndMarker, startIdx);

  if (startIdx === -1 || endIdx === -1) {
    console.error('Could not find CMS bounds in ' + filePath);
    return;
  }

  const accordionCmsCode = `{activeTab === 'cms' && (
            <div className="space-y-6 w-full max-w-7xl">
              {/* Header Title & Save Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-title font-bold text-2xl sm:text-3xl text-[#2C4219]">
                    Kelola Konten Website
                  </h1>
                  <p className="text-sm text-[#7A7062] font-medium mt-1">
                    Klik pada kartu di bawah untuk membuka dan mengedit konten secara langsung (dropdown).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveCms as any}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-xs transition-all shadow-md active:scale-95 shrink-0"
                >
                  <Save className="w-4 h-4 text-[#A8B774]" />
                  Simpan Semua Perubahan
                </button>
              </div>

              {/* Accordion Cards Container */}
              <div className="space-y-4">
                {([
                  { key: 'identitas', label: 'Identitas Website', icon: Type, desc: 'Atur Logo, Nama Web, dan Subtitle' },
                  { key: 'landing', label: 'Halaman Utama (Landing)', icon: Home, desc: 'Atur Judul Hero, Deskripsi, dan Gambar Banner' },
                  { key: 'login', label: 'Halaman Login', icon: LogIn, desc: 'Atur Sambutan, Deskripsi, dan Background Login' },
                  { key: 'register', label: 'Halaman Register', icon: UserPlus, desc: 'Atur Judul Ajakan Bergabung & Gambar' },
                  { key: 'footer', label: 'Pengaturan Footer', icon: LayoutGrid, desc: 'Atur Teks Tentang, Kontak WhatsApp, Email, & Hak Cipta' }
                ] as const).map(({ key, label, icon: Icon, desc }) => {
                  const isOpen = cmsActivePage === key;

                  return (
                    <div 
                      key={key} 
                      className={\`bg-white rounded-3xl border transition-all duration-300 overflow-hidden \${
                        isOpen ? 'border-[#2C4219] shadow-md ring-2 ring-[#2C4219]/10' : 'border-[#E6E1D5] shadow-xs hover:border-[#2C4219]/40'
                      }\`}
                    >
                      {/* Accordion Card Header Toggle */}
                      <button
                        type="button"
                        onClick={() => setCmsActivePage(isOpen ? '' : key)}
                        className={\`w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors \${
                          isOpen ? 'bg-[#2C4219] text-white' : 'bg-white text-[#2C4219] hover:bg-[#FAF6EE]'
                        }\`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors \${
                            isOpen ? 'bg-white/15 text-[#A8B774]' : 'bg-[#FAF6EE] text-[#2C4219]'
                          }\`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-title font-bold text-base sm:text-lg leading-tight">{label}</h3>
                            <p className={\`text-xs mt-1 \${isOpen ? 'text-white/80' : 'text-[#7A7062]'}\`}>{desc}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isOpen && (
                            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#A8B774]/20 text-[#A8B774] border border-[#A8B774]/30 uppercase tracking-wider hidden sm:inline-block">
                              Form Terbuka
                            </span>
                          )}
                          <ChevronDown className={\`w-6 h-6 transition-transform duration-300 \${
                            isOpen ? 'rotate-180 text-[#A8B774]' : 'text-[#7A7062]'
                          }\`} />
                        </div>
                      </button>

                      {/* Dropdown Content Panel (Tepat di bawah card) */}
                      {isOpen && (
                        <div className="p-6 border-t border-[#E6E1D5] bg-[#FAF6EE]/40 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                          <div className={\`grid grid-cols-1 \${key === 'footer' ? '' : 'lg:grid-cols-2'} gap-6 items-start\`}>
                            
                            {/* LEFT: Editor Form */}
                            <div className="bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-5">
                              {key === 'identitas' && (
                                <div className="space-y-5">
                                  <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1D5]">
                                    <Type className="w-5 h-5 text-[#2C4219]" />
                                    <h2 className="font-title font-bold text-base text-[#2C4219]">Identitas Website</h2>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                                      <Type className="w-3.5 h-3.5" /> Nama Website
                                    </label>
                                    <input
                                      type="text"
                                      value={cmsWebName}
                                      onChange={(e) => setCmsWebName(e.target.value)}
                                      placeholder="Contoh: KWT Sorgum"
                                      className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                                      <Type className="w-3.5 h-3.5" /> Subtitle / Teks Tambahan
                                    </label>
                                    <input
                                      type="text"
                                      value={cmsWebSubtitle}
                                      onChange={(e) => setCmsWebSubtitle(e.target.value)}
                                      placeholder="Contoh: KWT MELATI SORGUM"
                                      className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                                      <ImageIcon className="w-3.5 h-3.5" /> Logo Website
                                    </label>

                                    {cmsWebLogo && (
                                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-[#A8B774]/60 bg-white mb-2">
                                        <img src={cmsImgUrl(cmsWebLogo)} alt="Logo" className="w-full h-full object-contain p-2" />
                                        <button
                                          type="button"
                                          onClick={() => setCmsWebLogo('')}
                                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                    {!cmsWebLogo && (
                                      <input
                                        type="text"
                                        value={cmsWebLogo}
                                        onChange={(e) => setCmsWebLogo(e.target.value)}
                                        placeholder="Atau masukkan URL logo (https://...)"
                                        className="w-full p-2.5 rounded-xl border border-[#E6E1D5] text-xs font-medium focus:outline-none focus:border-[#2C4219] bg-[#FAF6EE]/50"
                                      />
                                    )}

                                    <div className="mt-2">
                                      <label className={\`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#2C4219]/40 bg-[#FAF6EE] text-[11px] font-bold text-[#2C4219] cursor-pointer hover:bg-[#F0EADF] transition-all \${cmsUploading ? 'opacity-60 pointer-events-none' : ''}\`}>
                                        <Upload className="w-4 h-4" />
                                        {cmsUploading ? 'Mengunggah...' : 'Upload Logo Baru'}
                                        <input
                                          type="file"
                                          accept="image/*"
                                          className="hidden"
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setCmsUploading(true);
                                            try {
                                              const url = await handleCmsUpload(file);
                                              setCmsWebLogo(url);
                                            } catch (err) {
                                              showToast('Gagal upload logo');
                                            } finally {
                                              setCmsUploading(false);
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {key === 'landing' && (
                                <div className="space-y-5">
                                  <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1D5]">
                                    <Home className="w-5 h-5 text-[#2C4219]" />
                                    <h2 className="font-title font-bold text-base text-[#2C4219]">Halaman Utama</h2>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                                      <Type className="w-3.5 h-3.5" /> Judul Utama (Hero Title)
                                    </label>
                                    <input
                                      type="text"
                                      value={cmsLandingTitle}
                                      onChange={(e) => setCmsLandingTitle(e.target.value)}
                                      placeholder="Contoh: Bersama Menanam, Bersama Sejahtera"
                                      className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                                      <FileText className="w-3.5 h-3.5" /> Deskripsi Pendek
                                    </label>
                                    <textarea
                                      value={cmsLandingDesc}
                                      onChange={(e) => setCmsLandingDesc(e.target.value)}
                                      rows={3}
                                      className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] resize-none"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                                      <ImageIcon className="w-3.5 h-3.5" /> Gambar Carousel ({cmsLandingImages.length})
                                    </label>

                                    {cmsLandingImages.length > 0 && (
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {cmsLandingImages.map((url, idx) => (
                                          <div key={idx} className="space-y-1.5 bg-[#FAF6EE] p-2 rounded-xl border border-[#E6E1D5]">
                                            <div className="relative h-24 rounded-lg overflow-hidden border border-[#A8B774]/60 bg-white">
                                              {url ? (
                                                <img src={cmsImgUrl(url)} alt={\`Slide \${idx + 1}\`} className="w-full h-full object-cover" />
                                              ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-[#433A30]/40">
                                                  <ImageIcon className="w-6 h-6 mb-1" />
                                                  <span className="text-[10px]">Masukkan URL</span>
                                                </div>
                                              )}
                                              <button
                                                type="button"
                                                onClick={() => setCmsLandingImages(prev => prev.filter((_, i) => i !== idx))}
                                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                            <input
                                              type="text"
                                              value={url}
                                              onChange={(e) => setCmsLandingImages(prev => prev.map((u, i) => i === idx ? e.target.value : u))}
                                              placeholder="https://..."
                                              className="w-full p-2 rounded-lg border border-[#E6E1D5] text-[10px] font-medium bg-white"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    <div className="mt-3">
                                      <label className={\`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#2C4219]/40 bg-[#FAF6EE] text-xs font-bold text-[#2C4219] cursor-pointer hover:bg-[#F0EADF] transition-all \${cmsUploading ? 'opacity-60 pointer-events-none' : ''}\`}>
                                        <Upload className="w-4 h-4" />
                                        {cmsUploading ? 'Mengunggah...' : 'Upload Gambar Banner'}
                                        <input
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          className="hidden"
                                          onChange={async (e) => {
                                            const files = e.target.files;
                                            if (!files || files.length === 0) return;
                                            setCmsUploading(true);
                                            try {
                                              const newUrls: string[] = [];
                                              for (let i = 0; i < files.length; i++) {
                                                const url = await handleCmsUpload(files[i]);
                                                newUrls.push(url);
                                              }
                                              setCmsLandingImages(prev => [...prev, ...newUrls]);
                                            } catch (err) {
                                              showToast('Gagal upload gambar');
                                            } finally {
                                              setCmsUploading(false);
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {key === 'login' && (
                                <div className="space-y-5">
                                  <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1D5]">
                                    <LogIn className="w-5 h-5 text-[#2C4219]" />
                                    <h2 className="font-title font-bold text-base text-[#2C4219]">Halaman Login</h2>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                                      <Type className="w-3.5 h-3.5" /> Judul Sambutan
                                    </label>
                                    <input
                                      type="text"
                                      value={cmsLoginTitle}
                                      onChange={(e) => setCmsLoginTitle(e.target.value)}
                                      placeholder="Contoh: Selamat Datang Kembali"
                                      className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                                      <FileText className="w-3.5 h-3.5" /> Deskripsi Login
                                    </label>
                                    <textarea
                                      value={cmsLoginDesc}
                                      onChange={(e) => setCmsLoginDesc(e.target.value)}
                                      rows={3}
                                      className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] resize-none"
                                    />
                                  </div>
                                </div>
                              )}

                              {key === 'register' && (
                                <div className="space-y-5">
                                  <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1D5]">
                                    <UserPlus className="w-5 h-5 text-[#2C4219]" />
                                    <h2 className="font-title font-bold text-base text-[#2C4219]">Halaman Register</h2>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                                      <Type className="w-3.5 h-3.5" /> Judul Ajakan Bergabung
                                    </label>
                                    <input
                                      type="text"
                                      value={cmsRegTitle}
                                      onChange={(e) => setCmsRegTitle(e.target.value)}
                                      placeholder="Contoh: Bergabung dengan KWT Sorgum"
                                      className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                                      <FileText className="w-3.5 h-3.5" /> Deskripsi Pendaftaran
                                    </label>
                                    <textarea
                                      value={cmsRegDesc}
                                      onChange={(e) => setCmsRegDesc(e.target.value)}
                                      rows={3}
                                      className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] resize-none"
                                    />
                                  </div>
                                </div>
                              )}

                              {key === 'footer' && (
                                <div className="space-y-5">
                                  <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1D5]">
                                    <LayoutGrid className="w-5 h-5 text-[#2C4219]" />
                                    <h2 className="font-title font-bold text-base text-[#2C4219]">Pengaturan Footer</h2>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="flex items-center gap-1.5 font-bold text-xs text-[#2C4219]">
                                      <FileText className="w-3.5 h-3.5" /> Teks Tentang Komunitas
                                    </label>
                                    <textarea
                                      value={cmsFooterAbout}
                                      onChange={(e) => setCmsFooterAbout(e.target.value)}
                                      rows={3}
                                      placeholder="Penjelasan singkat tentang KWT..."
                                      className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219] resize-none"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                      <label className="font-bold text-xs text-[#2C4219]">Nomor WhatsApp</label>
                                      <input
                                        type="text"
                                        value={cmsFooterPhone}
                                        onChange={(e) => setCmsFooterPhone(e.target.value)}
                                        placeholder="0812-xxxx-xxxx"
                                        className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="font-bold text-xs text-[#2C4219]">Email Contact</label>
                                      <input
                                        type="text"
                                        value={cmsFooterEmail}
                                        onChange={(e) => setCmsFooterEmail(e.target.value)}
                                        placeholder="kontak@kwtsorgum.id"
                                        className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE]/50 text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* RIGHT: Live Preview (for non-footer) */}
                            {key !== 'footer' && (
                              <div className="bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b border-[#E6E1D5]">
                                  <Eye className="w-5 h-5 text-[#2C4219]" />
                                  <h3 className="font-title font-bold text-base text-[#2C4219]">Pratinjau Langsung</h3>
                                </div>

                                {key === 'identitas' && (
                                  <div className="p-4 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-3">
                                    <div className="flex items-center gap-3">
                                      {cmsWebLogo ? (
                                        <img src={cmsImgUrl(cmsWebLogo)} alt="Logo" className="w-10 h-10 object-contain" />
                                      ) : (
                                        <div className="w-10 h-10 rounded-xl bg-[#2C4219] text-[#A8B774] font-title font-black flex items-center justify-center">
                                          KWT
                                        </div>
                                      )}
                                      <div>
                                        <h4 className="font-title font-bold text-sm text-[#2C4219]">{cmsWebName || 'KWT Sorgum'}</h4>
                                        <p className="text-[10px] text-[#7A7062] font-semibold">{cmsWebSubtitle || 'KWT MELATI SORGUM'}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {key === 'landing' && (
                                  <div className="p-5 rounded-2xl bg-[#2C4219] text-white space-y-3 relative overflow-hidden">
                                    <h4 className="font-title font-bold text-lg text-[#A8B774]">
                                      {cmsLandingTitle || 'Judul Utama Halaman'}
                                    </h4>
                                    <p className="text-xs text-white/80 line-clamp-3">
                                      {cmsLandingDesc || 'Deskripsi singkat halaman utama.'}
                                    </p>
                                  </div>
                                )}

                                {key === 'login' && (
                                  <div className="p-5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-2">
                                    <h4 className="font-title font-bold text-base text-[#2C4219]">
                                      {cmsLoginTitle || 'Judul Login'}
                                    </h4>
                                    <p className="text-xs text-[#7A7062] line-clamp-2">
                                      {cmsLoginDesc || 'Deskripsi login.'}
                                    </p>
                                  </div>
                                )}

                                {key === 'register' && (
                                  <div className="p-5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-2">
                                    <h4 className="font-title font-bold text-base text-[#2C4219]">
                                      {cmsRegTitle || 'Judul Register'}
                                    </h4>
                                    <p className="text-xs text-[#7A7062] line-clamp-2">
                                      {cmsRegDesc || 'Deskripsi pendaftaran.'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          `;

  c = c.substring(0, startIdx) + accordionCmsCode + c.substring(endIdx);
  fs.writeFileSync(filePath, c, 'utf8');
  console.log('Successfully transformed CMS to Accordion Dropdown in ' + filePath);
}

transformCmsToAccordion('src/components/views/admin/AdminPortalViewLite.tsx');
transformCmsToAccordion('frontend/src/components/views/admin/AdminPortalViewLite.tsx');

transformCmsToAccordion('src/components/views/admin/AdminPortalView.tsx');
transformCmsToAccordion('frontend/src/components/views/admin/AdminPortalView.tsx');

console.log('Finished CMS Accordion Dropdown transform.');
