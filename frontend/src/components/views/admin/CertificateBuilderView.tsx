import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Save, Upload, Eye, Award, Palette, Type, Image as ImageIcon, X, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { AgendaEvent } from '../../../types';
import { api, SERVER_BASE } from '../../../api/client';

import { CertificateConfig, drawCertificateOnCanvas, isCertificateActive } from '../../../utils/certificate';

const DEFAULT_CONFIG: CertificateConfig = {
  title: 'SERTIFIKAT PENGHARGAAN',
  subtitle: 'Diberikan kepada:',
  orgName: 'KWT Sorgum Bestari',
  bodyText: 'Telah mengikuti kegiatan',
  picName: '',
  picTitle: 'Ketua KWT Sorgum',
  signatureUrl: '',
  logoUrl: '',
  borderStyle: 'classic',
  numberFormat: 'CERT/KWT/{YEAR}/{NUM}',
  isActive: true
};

interface CertificateBuilderViewProps {
  isLiteMode?: boolean;
  agendas: AgendaEvent[];
  onUpdateAgendas?: (agendas: AgendaEvent[]) => void;
  showToast: (msg: string) => void;
  handleCmsUpload: (file: File) => Promise<string>;
}

export const CertificateBuilderView: React.FC<CertificateBuilderViewProps> = ({
  isLiteMode = false,
  agendas,
  onUpdateAgendas,
  showToast,
  handleCmsUpload
}) => {
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedAgenda = agendas.find(a => a.id === selectedAgendaId);
  
  const [config, setConfig] = useState<CertificateConfig>({ ...DEFAULT_CONFIG });
  const [isSaving, setIsSaving] = useState(false);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePreviewClick = () => {
    if (canvasRef.current) {
      setPreviewImage(canvasRef.current.toDataURL('image/png'));
      setIsPreviewOpen(true);
    }
  };

  // When agenda is selected, load existing config
  useEffect(() => {
    if (!selectedAgendaId) {
      setConfig({ ...DEFAULT_CONFIG });
      return;
    }
    const ag = selectedAgenda;
    if (ag?.certificateTemplate) {
      try {
        const parsed = JSON.parse(ag.certificateTemplate);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch {
        setConfig({ ...DEFAULT_CONFIG });
      }
    } else {
      setConfig({ ...DEFAULT_CONFIG });
    }
  }, [selectedAgendaId, agendas]);

  const [logoImgElement, setLogoImgElement] = useState<HTMLImageElement | null>(null);
  const [sigImgElement, setSigImgElement] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (config.logoUrl) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => setLogoImgElement(img);
      img.src = config.logoUrl;
    } else {
      setLogoImgElement(null);
    }
  }, [config.logoUrl]);

  useEffect(() => {
    if (config.signatureUrl) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => setSigImgElement(img);
      img.src = config.signatureUrl;
    } else {
      setSigImgElement(null);
    }
  }, [config.signatureUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      drawCertificateOnCanvas(canvas, config, 'Nama Peserta', selectedAgenda, logoImgElement, sigImgElement);
    }
  }, [config, selectedAgenda, logoImgElement, sigImgElement]);
  const handleSave = async (forceIsActive?: boolean) => {
    if (!selectedAgendaId) {
      showToast('Pilih agenda terlebih dahulu');
      return;
    }
    setIsSaving(true);
    try {
      let finalConfig = { ...config };
      
      if (typeof forceIsActive === 'boolean') {
        finalConfig.isActive = forceIsActive;
      } else {
        // Default when pressing main save button
        finalConfig.isActive = true;
      }

      // Upload signature if new file
      if (signatureFile) {
        const url = await handleCmsUpload(signatureFile);
        finalConfig.signatureUrl = url;
        setSignatureFile(null);
      }
      // Upload logo if new file
      if (logoFile) {
        const url = await handleCmsUpload(logoFile);
        finalConfig.logoUrl = url;
        setLogoFile(null);
      }

      const jsonStr = JSON.stringify(finalConfig);

      // Update backend
      await api(`/agenda/${selectedAgendaId}`, {
        method: 'PUT',
        body: { certificateTemplate: jsonStr }
      });

      // Update local state
      if (onUpdateAgendas) {
        const updated = agendas.map(a =>
          a.id === selectedAgendaId ? { ...a, certificateTemplate: jsonStr } : a
        );
        onUpdateAgendas(updated);
      }

      setConfig(finalConfig);
      
      if (finalConfig.isActive) {
        showToast('Sertifikat berhasil disimpan & diaktifkan! 🎉');
      } else {
        showToast('Sertifikat berhasil dinonaktifkan.');
      }
    } catch (err: any) {
      console.error('Failed to save certificate:', err);
      showToast('Gagal menyimpan sertifikat');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAgendaId) {
      showToast('Pilih agenda terlebih dahulu');
      return;
    }
    if (!confirm('Anda yakin ingin menghapus template sertifikat ini secara permanen?')) return;
    
    setIsSaving(true);
    try {
      // Update backend to remove the certificate template
      await api(`/agenda/${selectedAgendaId}`, {
        method: 'PUT',
        body: { certificateTemplate: '' }
      });

      // Update local state
      if (onUpdateAgendas) {
        const updated = agendas.map(a =>
          a.id === selectedAgendaId ? { ...a, certificateTemplate: '' } : a
        );
        onUpdateAgendas(updated);
      }

      setConfig({ ...DEFAULT_CONFIG }); // Reset to default config
      setSignatureFile(null);
      setLogoFile(null);
      
      showToast('Template sertifikat berhasil dihapus!');
    } catch (e) {
      console.error('Gagal menghapus sertifikat:', e);
      showToast('Gagal menghapus sertifikat');
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (key: keyof CertificateConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const hasCertificate = (agendaId: string) => {
    const ag = agendas.find(a => a.id === agendaId);
    return isCertificateActive(ag?.certificateTemplate);
  };

  return (
    <div className={isLiteMode ? "w-full min-h-full space-y-6" : "p-4 sm:p-6 lg:p-8 space-y-6 w-full min-h-full"}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D97706] to-[#B45309] flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-title font-black text-xl text-[#2C4219]">Kelola Sertifikat</h1>
            <p className="text-xs text-[#7A7062] font-medium">Desain & kelola sertifikat kehadiran untuk peserta agenda</p>
          </div>
        </div>
      </div>

      {/* Agenda Selector */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 relative z-50">
          <label className="font-bold text-sm text-[#2C4219]">Pilih Agenda Kegiatan</label>
          {selectedAgendaId && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-[11px] font-bold text-[#D97706] hover:text-[#B45309] transition-colors flex items-center gap-1 bg-[#D97706]/10 px-3 py-1.5 rounded-lg whitespace-nowrap"
              >
                {isLiteMode ? 'Ganti Agenda' : (isDropdownOpen ? 'Batal Ganti' : 'Ganti Agenda')}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Lite mode: inline dropdown */}
              {isLiteMode && isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-[#E6E1D5] py-1 animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {agendas.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-[#7A7062] text-center">Belum ada agenda</div>
                    ) : (
                      agendas.map(ag => (
                        <button
                          key={ag.id}
                          onClick={() => {
                            setSelectedAgendaId(ag.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between gap-2 ${
                            selectedAgendaId === ag.id 
                              ? 'bg-[#2C4219] text-white' 
                              : 'hover:bg-[#FAF6EE] text-[#2C4219]'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="font-bold truncate">{ag.title}</p>
                            <p className={`text-[10px] ${selectedAgendaId === ag.id ? 'text-white/70' : 'text-[#7A7062]'}`}>
                              {ag.dayNumber} {ag.monthAbbr} {ag.date?.split('-')[0] || ''}
                            </p>
                          </div>
                          {hasCertificate(ag.id) && (
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${selectedAgendaId === ag.id ? 'text-white' : 'text-[#D97706]'}`} />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Grid Selection Mode — Pro mode only, or initial selection (no agenda selected yet) */}
        {(!selectedAgendaId || (!isLiteMode && isDropdownOpen)) && (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-[#E6E1D5] p-2 sm:p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            {agendas.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-[#E6E1D5]">
                <p className="text-sm font-semibold text-[#A19D94]">Belum ada agenda yang dibuat.</p>
              </div>
            ) : (
              <div className={isLiteMode ? "space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto custom-scrollbar p-1"}>
                {agendas.map(ag => {
                  const isSelected = selectedAgendaId === ag.id;
                  const hasCert = hasCertificate(ag.id);
                  return isLiteMode ? (
                    /* Lite: simple list item */
                    <button
                      key={ag.id}
                      onClick={() => {
                        setSelectedAgendaId(ag.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-[#2C4219] border-[#2C4219] text-white' 
                          : 'bg-white border-[#E6E1D5] hover:border-[#2C4219]/40 hover:bg-[#FAF6EE]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-[#2C4219]'}`}>{ag.title}</p>
                        <p className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-[#7A7062]'}`}>
                          {ag.dayNumber} {ag.monthAbbr} {ag.date?.split('-')[0] || ''}
                        </p>
                      </div>
                      {hasCert && <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#D97706]' : 'text-[#D97706]'}`} />}
                    </button>
                  ) : (
                    /* Pro: full card */
                    <button
                      key={ag.id}
                      onClick={() => {
                        setSelectedAgendaId(ag.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`
                        w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group flex flex-col h-full justify-between gap-3
                        ${isSelected 
                          ? 'bg-[#2C4219] border-[#2C4219] shadow-md ring-2 ring-[#2C4219]/20' 
                          : 'bg-white border-[#E6E1D5] hover:border-[#2C4219]/40 hover:bg-[#FAF6EE] shadow-xs'}
                      `}
                    >
                      <div className="space-y-1.5 relative z-10">
                        <div className="flex items-start justify-between gap-2">
                          <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-[#E3EBD3] text-[#2C4219]'}`}>
                            {ag.category || 'AGENDA'}
                          </span>
                          {hasCert && (
                            <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isSelected ? 'bg-[#D97706] text-white' : 'bg-[#D97706]/10 text-[#D97706]'}`}>
                              <CheckCircle2 className="w-3 h-3" /> Aktif
                            </span>
                          )}
                        </div>
                        <h4 className={`font-title font-bold text-xs sm:text-sm line-clamp-2 leading-snug ${isSelected ? 'text-white' : 'text-[#2C4219]'}`}>
                          {ag.title}
                        </h4>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 mt-auto border-t border-dashed border-opacity-30 border-[#433A30] relative z-10">
                        <div className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold ${isSelected ? 'text-white/90' : 'text-[#7A7062]'}`}>
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{ag.dayNumber} {ag.monthAbbr} {ag.date?.split('-')[0] || ''}</span>
                        </div>
                        {ag.status === 'Selesai' && (
                          <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#FAF6EE] text-[#433A30]/70'}`}>
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

        {/* Selected Agenda Banner (Shown when selected and not editing, except in Lite where it stays visible) */}
        {selectedAgendaId && (!isDropdownOpen || isLiteMode) && selectedAgenda && (
            <div className="bg-gradient-to-r from-[#2C4219] to-[#3a5621] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden group animate-in zoom-in-95 duration-300">
              {/* Background Decorations */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/20 text-white backdrop-blur-md">
                      {selectedAgenda.category || 'AGENDA'}
                    </span>
                    {hasCertificate(selectedAgenda.id) && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 bg-[#D97706] text-white shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Sertifikat Aktif
                      </span>
                    )}
                  </div>
                  <h4 className="font-title font-bold text-lg sm:text-xl text-white">{selectedAgenda.title}</h4>
                </div>
                <div className="flex items-center gap-2 shrink-0 bg-black/20 px-4 py-2.5 rounded-xl backdrop-blur-md border border-white/10">
                  <Calendar className="w-4 h-4 text-[#A8B774]" />
                  <span className="text-sm font-bold text-white/90">
                    {selectedAgenda.dayNumber} {selectedAgenda.monthAbbr} {selectedAgenda.date?.split('-')[0] || ''}
                  </span>
                </div>
              </div>
            </div>
        )}
      </div>
      
      {/* Builder Content */}
      {selectedAgendaId && (!isDropdownOpen || isLiteMode) && (
          /* ===== PRO MODE: Full 2-column layout ===== */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        {/* LEFT: Form Builder */}
                        <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-sm p-5 sm:p-6 space-y-5">
                          <div className="flex items-center gap-2 border-b border-[#E6E1D5] pb-3">
                            <Type className="w-4 h-4 text-[#D97706]" />
                            <h2 className="font-bold text-sm text-[#2C4219]">Desain Sertifikat</h2>
                          </div>

                          {/* Template Selector */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-[#2C4219] flex items-center gap-1.5">
                              <Palette className="w-3.5 h-3.5" /> Tema Sertifikat
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                              {[
                                { id: 'classic', label: 'Klasik', color: 'bg-[#2C4219]' },
                                { id: 'modern', label: 'Modern', color: 'bg-[#D97706]' },
                                { id: 'elegant', label: 'Elegan', color: 'bg-[#D4AF37]' },
                                { id: 'floral', label: 'Floral', color: 'bg-[#F48FB1]' },
                                { id: 'batik', label: 'Batik', color: 'bg-[#8D6E63]' },
                                { id: 'feminine', label: 'Feminim', color: 'bg-[#CE93D8]' }
                              ].map(theme => (
                                <button
                                  key={theme.id}
                                  onClick={() => updateConfig('borderStyle', theme.id)}
                                  className={`relative p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                                    config.borderStyle === theme.id 
                                      ? 'border-[#2C4219] bg-[#FAF6EE] shadow-sm' 
                                      : 'border-[#E6E1D5] bg-white hover:border-[#A8B774] hover:bg-[#FAF6EE]/50'
                                  }`}
                                >
                                  <div className={`w-full h-8 rounded-lg ${theme.color} opacity-80`} />
                                  <span className="text-[10px] font-bold text-[#433A30] text-center">{theme.label}</span>
                                  {config.borderStyle === theme.id && (
                                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#2C4219] rounded-full flex items-center justify-center border-2 border-white">
                                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Certificate Title */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#2C4219]">Judul Sertifikat</label>
                            <input
                              type="text"
                              value={config.title}
                              onChange={(e) => updateConfig('title', e.target.value)}
                              placeholder="SERTIFIKAT PENGHARGAAN"
                              className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-sm font-semibold focus:outline-none focus:border-[#2C4219]"
                            />
                          </div>

                          {/* Subtitle */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#2C4219]">Subjudul</label>
                            <input
                              type="text"
                              value={config.subtitle}
                              onChange={(e) => updateConfig('subtitle', e.target.value)}
                              placeholder="Diberikan kepada:"
                              className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-sm font-semibold focus:outline-none focus:border-[#2C4219]"
                            />
                          </div>

                          {/* Organization Name */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#2C4219]">Nama Organisasi</label>
                              <input
                                type="text"
                                value={config.orgName}
                                onChange={(e) => updateConfig('orgName', e.target.value)}
                                placeholder="Nama Organisasi"
                                className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-sm font-semibold focus:outline-none focus:border-[#2C4219]"
                              />
                          </div>

                          {/* Body Text */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#2C4219]">Teks Pengantar</label>
                            <input
                              type="text"
                              value={config.bodyText}
                              onChange={(e) => updateConfig('bodyText', e.target.value)}
                              placeholder="Telah mengikuti kegiatan"
                              className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-sm font-semibold focus:outline-none focus:border-[#2C4219]"
                            />
                            <p className="text-[10px] text-[#A19D94]">Nama agenda & tanggal otomatis terisi dari data agenda</p>
                          </div>

                          {/* PIC Info */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-[#2C4219]">Nama PIC / Pembuat</label>
                              <input
                                type="text"
                                value={config.picName}
                                onChange={(e) => updateConfig('picName', e.target.value)}
                                placeholder="Nama lengkap"
                                className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-sm font-semibold focus:outline-none focus:border-[#2C4219]"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-[#2C4219]">Jabatan PIC</label>
                              <input
                                type="text"
                                value={config.picTitle}
                                onChange={(e) => updateConfig('picTitle', e.target.value)}
                                placeholder="Ketua Organisasi"
                                className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-sm font-semibold focus:outline-none focus:border-[#2C4219]"
                              />
                            </div>
                          </div>

                          {/* Uploads: Signature & Logo */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-[#2C4219] flex items-center gap-1">
                                <Upload className="w-3 h-3" />
                                Tanda Tangan
                              </label>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept=".png,.jpg,.jpeg"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                      setSignatureFile(f);
                                      const localUrl = URL.createObjectURL(f);
                                      updateConfig('signatureUrl', localUrl);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`p-3 rounded-xl border-2 border-dashed text-center transition-all ${
                                  config.signatureUrl ? 'border-[#D97706] bg-[#D97706]/5' : 'border-[#E6E1D5] bg-[#FAF6EE] hover:bg-[#F3EFE6]'
                                }`}>
                                  {config.signatureUrl ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <img src={config.signatureUrl} alt="TTD" className="h-10 object-contain" />
                                      <span className="text-[10px] font-bold text-[#D97706]">Klik untuk ganti TTD</span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-bold text-[#7A7062]">Pilih gambar TTD</span>
                                  )}
                                </div>
                              </div>
                              {config.signatureUrl && (
                                <div className="flex justify-center mt-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setSignatureFile(null);
                                      updateConfig('signatureUrl', '');
                                    }}
                                    className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <X className="w-3 h-3" /> Hapus Gambar
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-[#2C4219] flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" />
                                Logo Organisasi
                              </label>
                              <div className="relative">
                                <input
                                  type="file"
                                  accept=".png,.jpg,.jpeg"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                      setLogoFile(f);
                                      const localUrl = URL.createObjectURL(f);
                                      updateConfig('logoUrl', localUrl);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`p-3 rounded-xl border-2 border-dashed text-center transition-all ${
                                  config.logoUrl ? 'border-[#293379] bg-[#293379]/5' : 'border-[#E6E1D5] bg-[#FAF6EE] hover:bg-[#F3EFE6]'
                                }`}>
                                  {config.logoUrl ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <img src={config.logoUrl} alt="Logo" className="h-10 object-contain" />
                                      <span className="text-[10px] font-bold text-[#293379]">Klik untuk ganti Logo</span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] font-bold text-[#7A7062]">Pilih logo</span>
                                  )}
                                </div>
                              </div>
                              {config.logoUrl && (
                                <div className="flex justify-center mt-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setLogoFile(null);
                                      updateConfig('logoUrl', '');
                                    }}
                                    className="text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <X className="w-3 h-3" /> Hapus Gambar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Certificate Number Format */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#2C4219]">Format Nomor Sertifikat</label>
                            <input
                              type="text"
                              value={config.numberFormat}
                              onChange={(e) => updateConfig('numberFormat', e.target.value)}
                              placeholder="CERT/ORG/{YEAR}/{NUM}"
                              className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-sm font-semibold focus:outline-none focus:border-[#2C4219]"
                            />
                            <p className="text-[10px] text-[#A19D94]">Gunakan {'{YEAR}'} untuk tahun otomatis, {'{NUM}'} untuk nomor urut</p>
                          </div>

                          {/* Save / Toggle Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleSave(true)}
                              disabled={isSaving}
                              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {isSaving ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  Menyimpan...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  {selectedAgenda?.certificateTemplate && config.isActive ? 'Simpan Perubahan' : 'Simpan & Aktifkan'}
                                </>
                              )}
                            </button>
                            
                            {selectedAgenda?.certificateTemplate && config.isActive && (
                              <button
                                onClick={() => handleSave(false)}
                                disabled={isSaving}
                                className="px-5 py-3.5 rounded-xl bg-white border border-[#E6E1D5] hover:border-[#D97706] hover:bg-[#FAF6EE] text-[#7A7062] hover:text-[#D97706] font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                title="Nonaktifkan Sertifikat"
                              >
                                Nonaktifkan
                              </button>
                            )}
                            
                            {selectedAgenda?.certificateTemplate && (
                              <button
                                onClick={handleDelete}
                                disabled={isSaving}
                                className="px-5 py-3.5 rounded-xl bg-red-50 border border-red-200 hover:border-red-500 hover:bg-red-100 text-red-600 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                title="Hapus Template Secara Permanen"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* RIGHT: Live Preview */}
                        <div className="space-y-4">
                          <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-sm p-5 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-3">
                              <div 
                                className="flex items-center gap-2 cursor-pointer hover:bg-[#FAF6EE] p-1.5 -ml-1.5 rounded-lg transition-colors group"
                                onClick={handlePreviewClick}
                                title="Klik untuk memperbesar sertifikat"
                              >
                                <Eye className="w-4 h-4 text-[#293379] group-hover:scale-110 transition-transform" />
                                <h2 className="font-bold text-sm text-[#2C4219]">Preview Sertifikat</h2>
                              </div>
                              <span className="text-[10px] font-semibold text-[#A19D94] bg-[#FAF6EE] px-2.5 py-1 rounded-full">Realtime</span>
                            </div>

                            <div 
                              ref={previewContainerRef} 
                              className="relative bg-[#F0ECE3] rounded-xl p-4 overflow-hidden"
                            >
                              <canvas
                                ref={canvasRef}
                                className="w-full h-auto rounded-lg shadow-md border border-[#E6E1D5]"
                                style={{ imageRendering: 'auto' }}
                              />
                            </div>

                            <p className="text-[10px] text-[#A19D94] text-center italic">
                              "Nama Peserta" akan diganti otomatis dengan nama masing-masing peserta saat mereka mengunduh sertifikat.
                            </p>
                          </div>

                          {/* Participants who will receive certificate */}
                          {selectedAgenda && (
                            <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-sm p-5 space-y-3">
                              <h3 className="font-bold text-sm text-[#2C4219] flex items-center gap-2">
                                <Award className="w-4 h-4 text-[#D97706]" />
                                Peserta yang Akan Mendapat Sertifikat
                              </h3>
                              {selectedAgenda.peserta && selectedAgenda.peserta.filter(p => p.attended && !p.userName.toLowerCase().includes('admin')).length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                  {selectedAgenda.peserta.filter(p => p.attended && !p.userName.toLowerCase().includes('admin')).map((p, idx) => (
                                    <div key={p.userId} className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5]">
                                      <div className="w-8 h-8 rounded-full bg-[#D97706]/20 flex items-center justify-center text-[#D97706] font-bold text-xs shrink-0">
                                        {idx + 1}
                                      </div>
                                      <span className="text-sm font-semibold text-[#2C4219] truncate">{p.userName}</span>
                                      <span className="ml-auto text-[10px] font-bold text-[#A8B774] bg-[#A8B774]/10 px-2 py-0.5 rounded-full shrink-0">✓ Hadir</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="bg-[#FAF6EE] p-4 rounded-xl text-center">
                                  <p className="text-xs text-[#7A7062] italic">Belum ada peserta yang ditandai hadir. Tandai kehadiran terlebih dahulu di tab "Kelola Agenda".</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
      )}

      {/* Fullscreen Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8" onClick={() => setIsPreviewOpen(false)}>
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={() => setIsPreviewOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative max-w-5xl w-full max-h-full flex items-center justify-center animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <img 
              src={previewImage} 
              alt="Sertifikat Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
};
