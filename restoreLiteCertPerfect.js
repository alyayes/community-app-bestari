const fs = require('fs');

let c = fs.readFileSync('src/components/views/admin/CertificateBuilderView.tsx', 'utf8');

if (!c.includes('isLiteMode?: boolean;')) {
    c = c.replace(
        '  handleCmsUpload: (file: File) => Promise<string>;\n}',
        '  handleCmsUpload: (file: File) => Promise<string>;\n  isLiteMode?: boolean;\n}'
    );
    c = c.replace(
        '  handleCmsUpload\n}) => {',
        '  handleCmsUpload,\n  isLiteMode = false\n}) => {'
    );
}

c = c.replace(
  '<div className="p-4 sm:p-6 lg:p-8 space-y-6">',
  '<div className={isLiteMode ? "w-full space-y-6" : "p-4 sm:p-6 lg:p-8 space-y-6"}>'
);

const startTag = '<div className="flex items-center justify-between px-1">';
const endTag = '{/* Selected Agenda Banner (Shown when selected and not editing) */}';

const startIdx = c.indexOf(startTag);
const endIdx = c.indexOf(endTag);

if (startIdx !== -1 && endIdx !== -1) {
    const originalSelector = c.substring(startIdx, endIdx).trim();
    
    const liteSelector = `
          <div className="flex items-center justify-between px-1 relative z-50">
            <label className="font-bold text-sm text-[#2C4219]">Pilih Agenda Kegiatan</label>
            {selectedAgendaId && (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-[11px] font-bold text-[#D97706] hover:text-[#B45309] transition-colors flex items-center gap-1 bg-[#D97706]/10 px-3 py-1.5 rounded-lg"
                >
                  {isDropdownOpen ? 'Tutup' : 'Ganti Agenda'}
                  <ChevronDown className={\`w-3.5 h-3.5 transition-transform duration-300 \${isDropdownOpen ? 'rotate-180' : ''}\`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E6E1D5] py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-[#E6E1D5] mb-1">
                      <p className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider">Pilih Agenda</p>
                    </div>
                    {agendas.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-[#7A7062] text-center">Belum ada agenda</div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {agendas.map(ag => (
                          <button
                            key={ag.id}
                            onClick={() => {
                              setSelectedAgendaId(ag.id);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs hover:bg-[#FAF6EE] transition-colors flex items-center justify-between gap-3"
                          >
                            <span className="truncate">{ag.title}</span>
                            {hasCertificate(ag.id) && <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706] shrink-0" title="Sertifikat Aktif" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!selectedAgendaId && (
            <div className="w-full bg-white/60 backdrop-blur-sm rounded-3xl border border-[#E6E1D5] p-4 sm:p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              {agendas.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-[#E6E1D5]">
                  <p className="text-sm font-semibold text-[#A19D94]">Belum ada agenda yang dibuat.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                  {agendas.map(ag => {
                    const isSelected = selectedAgendaId === ag.id;
                    const hasCert = hasCertificate(ag.id);
                    return (
                      <button
                        key={ag.id}
                        onClick={() => {
                          setSelectedAgendaId(ag.id);
                          setIsDropdownOpen(false);
                        }}
                        className={\`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group flex flex-col h-full justify-between gap-3 \${isSelected ? 'bg-[#2C4219] border-[#2C4219] shadow-md ring-2 ring-[#2C4219]/20' : 'bg-white border-[#E6E1D5] hover:border-[#2C4219]/40 hover:bg-[#FAF6EE] shadow-xs'}\`}
                      >
                        <div className="space-y-1.5 relative z-10">
                          <div className="flex items-start justify-between gap-2">
                            <span className={\`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md \${isSelected ? 'bg-white/20 text-white' : 'bg-[#E3EBD3] text-[#2C4219]'}\`}>
                              {ag.category || 'AGENDA'}
                            </span>
                            {hasCert && (
                              <span className={\`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 \${isSelected ? 'bg-[#D97706] text-white' : 'bg-[#D97706]/10 text-[#D97706]'}\`}>
                                <CheckCircle2 className="w-3 h-3" /> Aktif
                              </span>
                            )}
                          </div>
                          <h4 className={\`font-title font-bold text-xs sm:text-sm line-clamp-2 leading-snug \${isSelected ? 'text-white' : 'text-[#2C4219]'}\`}>
                            {ag.title}
                          </h4>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 mt-auto border-t border-dashed border-opacity-30 border-[#433A30] relative z-10">
                          <div className={\`flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold \${isSelected ? 'text-white/90' : 'text-[#7A7062]'}\`}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{ag.dayNumber} {ag.monthAbbr} {ag.date?.split('-')[0] || ''}</span>
                          </div>
                          {ag.status === 'Selesai' && (
                            <span className={\`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full \${isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF6EE] text-[#433A30]/70'}\`}>
                              Selesai
                            </span>
                          )}
                        </div>
                        
                        {isSelected && (
                          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
    `;

    const newBlock = `
          {isLiteMode ? (
            <>
              ${liteSelector}
            </>
          ) : (
            <>
              ${originalSelector}
            </>
          )}
    `;

    c = c.substring(0, startIdx) + newBlock + "\n" + c.substring(endIdx);
    
    fs.writeFileSync('src/components/views/admin/CertificateBuilderView.tsx', c, 'utf8');
    fs.writeFileSync('frontend/src/components/views/admin/CertificateBuilderView.tsx', c, 'utf8');
    console.log('Restored Lite Mode logic perfectly!');
} else {
    console.log('Could not find tags');
}
