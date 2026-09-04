import React from 'react';
import type { LandPlot, HarvestRecord, UserProfile } from '../../types';
import { Package, Sprout, CheckCircle2, Users, Layers, LayoutList, MapPin } from 'lucide-react';

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
  const totalPanenKg = harvestRecords.reduce((sum, record) => sum + (Number(record.yieldKg) || 0), 0);
  const totalTepungSorgumKg = harvestRecords.reduce((sum, record) => sum + (Number(record.processedFlourKg) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 animate-in fade-in duration-300 w-full">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        {/* Stok Tepung */}
        <div className="bg-white p-4 rounded-2xl border border-[#E6E1D5] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-[#F4F8EC] rounded-full flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-[#607829]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#433A30]">Stok Tepung Sorgum</p>
            <h3 className="text-2xl font-black text-[#2C4219]">{totalTepungSorgumKg.toLocaleString('id-ID')} <span className="text-sm font-bold">Kg</span></h3>
          </div>
        </div>

        {/* Total Panen Kotor */}
        <div className="bg-white p-4 rounded-2xl border border-[#E6E1D5] flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
            <Sprout className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#433A30]">Sorgum Mentah</p>
            <h3 className="text-2xl font-black text-[#D97706]">{totalPanenKg.toLocaleString('id-ID')} <span className="text-sm font-bold">Kg</span></h3>
          </div>
        </div>
      </div>

      {/* Daftar Lahan */}
      <div className="bg-white p-4 lg:p-6 rounded-2xl border border-[#E6E1D5] space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#2C4219]" />
          <h3 className="font-bold text-lg text-[#2C4219]">Daftar Lahan Sorgum Aktif</h3>
        </div>
        <div className="space-y-3">
          {landPlots.length > 0 ? (
            landPlots.map(plot => (
              <div key={plot.id} className="p-3 bg-[#FAF6EE] rounded-xl border border-[#E6E1D5] space-y-2">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#2C4219]">{plot.blockName}</h4>
                    <p className="text-[#433A30] text-xs font-medium mt-0.5">{plot.cropVariety} • {plot.areaSize}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg border text-[10px] font-bold ${plot.status === 'Siap Panen' ? 'bg-[#A8B774] text-[#2C4219] border-[#A8B774]' : 'bg-white text-[#2C4219] border-[#E6E1D5]'}`}>
                    {plot.status}
                  </div>
                </div>
                <div className="w-full bg-white rounded-full h-2 border border-[#E6E1D5] overflow-hidden">
                  <div 
                    className="bg-[#8CA352] h-full rounded-full transition-all" 
                    style={{ width: `${plot.growthProgress}%` }}
                  />
                </div>
                <p className="text-[10px] font-bold text-[#607829] text-right">{plot.growthProgress}% Selesai</p>
              </div>
            ))
          ) : (
            <p className="text-center text-[#433A30]/60 py-3 text-sm">Belum ada data lahan.</p>
          )}
        </div>
      </div>

      {/* Catatan Panen */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border-2 border-[#E6E1D5] space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <LayoutList className="w-6 h-6 text-[#2C4219]" />
          <h3 className="font-bold text-2xl text-[#2C4219]">Buku Catatan Panen Sorgum</h3>
        </div>
        <div className="space-y-4">
          {harvestRecords.length > 0 ? (
            harvestRecords.map(record => (
              <div key={record.id} className="p-5 bg-[#FAF6EE] rounded-2xl border-2 border-[#E6E1D5] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg text-[#2C4219]">{record.date}</p>
                    <h4 className="font-bold text-xl text-[#607829] mt-1">{record.blockName}</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-[#2C4219]">{record.weightKg.toLocaleString('id-ID')} <span className="text-base font-bold">Kg</span></p>
                  </div>
                </div>
                <div className="pt-3 border-t-2 border-[#E6E1D5] grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-[#433A30]/70 font-bold uppercase text-[10px]">Varietas</p>
                    <p className="font-semibold text-[#433A30]">{record.cropVariety}</p>
                  </div>
                  <div>
                    <p className="text-[#433A30]/70 font-bold uppercase text-[10px]">Kualitas</p>
                    <p className="font-semibold text-[#433A30]">{record.quality}</p>
                  </div>
                  <div className="col-span-2 mt-1">
                    <p className="text-[#433A30]/70 font-bold uppercase text-[10px]">Dicatat Oleh</p>
                    <p className="font-semibold text-[#433A30]">{record.recordedBy || record.farmerName}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-[#433A30]/60 py-4 text-lg">Belum ada catatan panen.</p>
          )}
        </div>
      </div>


      {/* Data Produksi */}
      <div className="bg-white p-4 lg:p-6 rounded-2xl border border-[#E6E1D5] space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#2C4219]" />
          <h3 className="font-black text-lg text-[#2C4219]">Laporan Pengolahan Tepung</h3>
        </div>
        
        {/* Ringkasan Produksi */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-[#FAF6EE] rounded-xl p-3 text-center border border-[#E6E1D5]">
            <p className="text-[10px] text-[#433A30] font-bold uppercase mb-0.5">Jumlah Catatan</p>
            <p className="text-2xl font-black text-[#2C4219]">{harvestRecords.length}</p>
          </div>
          <div className="bg-[#FAF6EE] rounded-xl p-3 text-center border border-[#E6E1D5]">
            <p className="text-[10px] text-[#433A30] font-bold uppercase mb-0.5">Rata-rata Hasil Jadi</p>
            <p className="text-2xl font-black text-[#607829]">77.5%</p>
          </div>
        </div>

        <div className="space-y-3">
          {harvestRecords.map((rec, idx) => {
            const inputKg = Number(rec.weightKg) || 0;
            const outputKg = Math.round(inputKg * 0.775);
            const types = ['Tepung Halus Premium', 'Premix Bebas Gluten', 'Tepung Kasar (Grade B)'];
            const statuses = [
              { label: 'Terdistribusi', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
              { label: 'Stok Gudang', color: 'bg-amber-100 text-amber-800 border-amber-300' },
              { label: 'Dalam Proses', color: 'bg-blue-100 text-blue-800 border-blue-300' },
            ];
            const status = statuses[idx % statuses.length];
            
            return (
              <div key={idx} className="p-3 bg-[#FAF6EE] rounded-xl border border-[#E6E1D5] space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A8B774]">PRD-2026-{String(idx + 1).padStart(3, '0')}</span>
                    <h4 className="font-bold text-sm text-[#2C4219]">{rec.blockName}</h4>
                    <p className="text-xs text-[#433A30] mt-0.5">{rec.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t border-[#E6E1D5]">
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-bold text-[#433A30]">Sorgum Mentah</p>
                    <p className="font-bold text-sm text-[#2C4219]">{inputKg.toLocaleString('id-ID')} <span className="text-[10px]">kg</span></p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#A8B774] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#2C4219]">→</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] uppercase font-bold text-[#433A30]">Jadi Tepung</p>
                    <p className="font-black text-sm text-[#607829]">{outputKg.toLocaleString('id-ID')} <span className="text-[10px]">kg</span></p>
                  </div>
                </div>
                
                <div className="pt-1">
                  <p className="text-[10px] uppercase font-bold text-[#433A30]/60">Jenis Produk</p>
                  <p className="font-semibold text-[#433A30] text-xs">{types[idx % types.length]}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
