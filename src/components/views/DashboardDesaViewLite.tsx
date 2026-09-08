import React, { useState } from 'react';
import type { LandPlot, HarvestRecord, UserProfile } from '../../types';
import { Package, Sprout, Users, LayoutList, MapPin, ChevronRight, Heart } from 'lucide-react';
import { getAvatarUrl, handleAvatarError } from '../../api/client';

interface DashboardDesaViewLiteProps {
  landPlots: LandPlot[];
  harvestRecords: HarvestRecord[];
  members?: UserProfile[];
  onOpenMulaiPanen: () => void;
}

export const DashboardDesaViewLite: React.FC<DashboardDesaViewLiteProps> = ({
  landPlots,
  harvestRecords,
  members = [],
  onOpenMulaiPanen,
}) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'lahan' | 'panen' | 'produksi' | 'anggota'>('ringkasan');

  const totalPanenKg = harvestRecords.reduce((sum, record) => sum + (Number(record.yieldKg) || Number(record.weightKg) || 0), 0);
  const totalTepungSorgumKg = harvestRecords.reduce((sum, record) => sum + (Number(record.processedFlourKg) || Math.round((Number(record.weightKg)||0) * 0.775)), 0);

  const tabs = [
    { id: 'ringkasan', label: 'Ringkasan', icon: <Heart className="w-4 h-4" /> },
    { id: 'lahan', label: 'Data Lahan', icon: <MapPin className="w-4 h-4" /> },
    { id: 'panen', label: 'Data Panen', icon: <Sprout className="w-4 h-4" /> },
    { id: 'produksi', label: 'Produksi', icon: <Package className="w-4 h-4" /> },
    { id: 'anggota', label: 'Komunitas', icon: <Users className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 animate-in fade-in duration-300 w-full px-2 sm:px-0">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-[#2C4219] to-[#607829] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-1">Data Sorgum</h2>
        </div>
        <Sprout className="w-32 h-32 absolute -right-6 -bottom-6 text-white/10 rotate-12" />
      </div>

      {/* Interactive Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x -mx-2 px-2 sm:mx-0 sm:px-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-full whitespace-nowrap text-sm font-bold transition-all shrink-0 snap-start shadow-sm
              ${activeTab === tab.id 
                ? 'bg-[#2C4219] text-white border border-[#2C4219]' 
                : 'bg-white border-2 border-[#E6E1D5] text-[#433A30] hover:bg-[#FAF6EE]'}
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 transition-all duration-300">
        {/* Tab: Ringkasan */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-5 rounded-3xl border-2 border-[#E6E1D5] shadow-sm flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                  <Sprout className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#433A30]/70 uppercase tracking-wide">Total Panen</p>
                  <h3 className="text-3xl font-black text-[#D97706] mt-1">{totalPanenKg.toLocaleString('id-ID')} <span className="text-sm">Kg</span></h3>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border-2 border-[#E6E1D5] shadow-sm flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 bg-[#F4F8EC] rounded-full flex items-center justify-center">
                  <Package className="w-7 h-7 text-[#607829]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#433A30]/70 uppercase tracking-wide">Total Tepung</p>
                  <h3 className="text-3xl font-black text-[#2C4219] mt-1">{totalTepungSorgumKg.toLocaleString('id-ID')} <span className="text-sm">Kg</span></h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Lahan */}
        {activeTab === 'lahan' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="font-black text-xl text-[#2C4219] px-2">🌱 Lahan Kita</h3>
            <div className="space-y-3">
              {landPlots.length > 0 ? landPlots.map(plot => (
                <div key={plot.id} className="bg-white p-5 rounded-3xl border-2 border-[#E6E1D5] shadow-sm relative overflow-hidden group hover:border-[#A8B774] transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-black text-lg text-[#2C4219]">{plot.blockName}</h4>
                      <p className="text-[#433A30] text-xs font-bold mt-1.5 bg-[#FAF6EE] px-2.5 py-1 rounded-lg inline-block border border-[#E6E1D5]">PIC Lahan: {plot.leaderName}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${plot.status === 'Siap Panen' ? 'bg-[#A8B774] text-[#2C4219]' : 'bg-[#FAF6EE] text-[#433A30] border border-[#E6E1D5]'}`}>
                      {plot.status}
                    </div>
                  </div>
                  <p className="text-sm text-[#433A30]/80 font-medium mb-4 flex items-center gap-2">
                    <span>🌾 {plot.cropVariety}</span>
                    <span className="w-1 h-1 rounded-full bg-[#E6E1D5]"></span>
                    <span>📍 {plot.areaSize}</span>
                  </p>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-[#433A30] uppercase">
                      <span>Progres</span>
                      <span className="text-[#607829]">{plot.growthProgress}%</span>
                    </div>
                    <div className="w-full bg-[#FAF6EE] rounded-full h-3 overflow-hidden border border-[#E6E1D5]">
                      <div 
                        className="bg-gradient-to-r from-[#8CA352] to-[#607829] h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${plot.growthProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-center text-[#433A30]/60 py-8 bg-white rounded-3xl border-2 border-[#E6E1D5]">Belum ada data.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab: Panen */}
        {activeTab === 'panen' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="font-black text-xl text-[#2C4219] px-2">📒 Riwayat Panen</h3>
            <div className="space-y-3">
              {harvestRecords.length > 0 ? harvestRecords.map(record => (
                <div key={record.id} className="bg-[#FAF6EE] p-5 rounded-3xl border-2 border-[#E6E1D5] relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-bl-full flex items-start justify-end p-3 shadow-sm border-b border-l border-[#E6E1D5]">
                    <LayoutList className="w-5 h-5 text-[#A8B774]" />
                  </div>
                  
                  <p className="font-bold text-[#2C4219]/60 text-sm mb-1">{record.date}</p>
                  <h4 className="font-black text-2xl text-[#607829]">{record.blockName}</h4>
                  
                  <div className="my-4 py-4 border-y border-[#E6E1D5]/70 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-[#433A30]/60">Hasil Biji</p>
                      <p className="text-3xl font-black text-[#2C4219]">{record.weightKg.toLocaleString('id-ID')} <span className="text-base">Kg</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold uppercase text-[#433A30]/60">Mutu</p>
                      <p className="text-lg font-black text-[#433A30]">{record.quality}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-[#E6E1D5]">
                      <Users className="w-5 h-5 text-[#433A30]/60" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-[#433A30]/60">PIC Panen</p>
                      <p className="text-sm font-black text-[#433A30]">{record.recordedBy || record.farmerName}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-center text-[#433A30]/60 py-8 bg-white rounded-3xl border-2 border-[#E6E1D5]">Belum ada data.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab: Produksi */}
        {activeTab === 'produksi' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="font-black text-xl text-[#2C4219] px-2">🥣 Data Produksi</h3>
            <div className="space-y-4">
              {harvestRecords.length > 0 ? harvestRecords.map((rec, idx) => {
                const inputKg = Number(rec.weightKg) || 0;
                const outputKg = Math.round(inputKg * 0.775);
                
                return (
                  <div key={idx} className="bg-white p-5 rounded-3xl border-2 border-[#E6E1D5] shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#E6E1D5]">
                      <div>
                        <p className="text-[10px] font-bold text-[#433A30]/60 uppercase">Asal Bahan</p>
                        <h4 className="font-black text-lg text-[#2C4219]">{rec.blockName}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[#433A30]/60 uppercase">Tanggal</p>
                        <p className="text-xs font-bold text-[#433A30] bg-[#FAF6EE] px-2 py-1 rounded-md inline-block mt-0.5">{rec.date}</p>
                      </div>
                    </div>
                    
                    <div className="bg-[#FAF6EE] rounded-2xl p-4 flex items-center justify-between border border-[#E6E1D5]">
                      <div className="text-center flex-1">
                        <p className="text-[11px] font-bold uppercase text-[#433A30]/60 mb-1">Biji Sorgum</p>
                        <p className="font-black text-[#D97706] text-xl">{inputKg} <span className="text-xs">kg</span></p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 border border-[#E6E1D5] z-10">
                        <ChevronRight className="w-5 h-5 text-[#2C4219]" />
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-[11px] font-bold uppercase text-[#433A30]/60 mb-1">Jadi Tepung</p>
                        <p className="font-black text-[#2C4219] text-2xl">{outputKg} <span className="text-xs">kg</span></p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between bg-[#F4F8EC] p-3 rounded-xl border border-[#A8B774]/30">
                      <p className="text-sm font-bold text-[#2C4219]">Tepung Halus Premium ✨</p>
                      <span className="px-3 py-1 rounded-full bg-white text-[#2C4219] text-[10px] font-black shadow-sm">Siap Jual</span>
                    </div>
                  </div>
                )
              }) : (
                <p className="text-center text-[#433A30]/60 py-8 bg-white rounded-3xl border-2 border-[#E6E1D5]">Belum ada data.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab: Anggota */}
        {activeTab === 'anggota' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="font-black text-xl text-[#2C4219] px-2">👩‍🌾 Anggota Komunitas</h3>
            <div className="bg-white rounded-3xl border-2 border-[#E6E1D5] shadow-sm overflow-hidden">
              <div className="divide-y divide-[#E6E1D5]">
                {members.length > 0 ? members.map((member, idx) => (
                  <div key={idx} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-[#FAF6EE] transition-colors">
                    <img
                      src={getAvatarUrl(member.avatar, member.name)}
                      alt={member.name}
                      onError={(e) => handleAvatarError(e, member.name)}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#A8B774] shadow-sm"
                    />
                    <div className="flex-1">
                      <h4 className="font-black text-base text-[#2C4219]">{member.name}</h4>
                      <p className="text-xs font-medium text-[#433A30] mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {member.lahanLocation || 'Belum ada blok'}
                      </p>
                    </div>
                    <div className="bg-[#F4F8EC] border border-[#A8B774]/30 px-3 py-2 rounded-xl text-center shadow-sm">
                      <p className="text-[10px] font-bold text-[#607829] uppercase mb-0.5">Peran</p>
                      <p className="text-xs font-black text-[#2C4219]">{member.role === 'USER' ? 'Anggota' : member.role}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-[#433A30]/60 py-8">Belum ada data.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
