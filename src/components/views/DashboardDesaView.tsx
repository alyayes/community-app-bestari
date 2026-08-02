import React, { useState } from 'react';
import { LandPlot, HarvestRecord } from '../../types';
import { 
  BarChart3, 
  Sprout, 
  TrendingUp, 
  Users, 
  Package, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  Filter, 
  ChevronRight,
  Truck,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface DashboardDesaViewProps {
  landPlots: LandPlot[];
  harvestRecords: HarvestRecord[];
  onOpenMulaiPanen: () => void;
}

export const DashboardDesaView: React.FC<DashboardDesaViewProps> = ({
  landPlots,
  harvestRecords,
  onOpenMulaiPanen,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string>('Semua');

  const totalHarvestKg = harvestRecords.reduce((acc, r) => acc + r.weightKg, 14850);
  const totalAreaHa = '5.5 Ha';
  const totalMembers = 48;
  const readyFlourKg = 1250;

  const filteredPlots = selectedBlock === 'Semua' 
    ? landPlots 
    : landPlots.filter(p => p.blockName.includes(selectedBlock));

  return (
    <div className="space-y-6 pb-12">
      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#433A30]">Total Panen Terkumpul</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] text-[#2C4219] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-title font-extrabold text-2xl text-[#2C4219]">{totalHarvestKg.toLocaleString('id-ID')}</h3>
            <span className="text-xs font-bold text-[#A8B774]">kg</span>
          </div>
          <p className="text-[10px] text-[#A8B774] font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +15% dari bulan sebelumnya
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#433A30]">Total Luas Lahan</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] text-[#2C4219] flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-title font-extrabold text-2xl text-[#2C4219]">{totalAreaHa}</h3>
            <span className="text-xs font-bold text-[#433A30]/70">4 Blok Utama</span>
          </div>
          <p className="text-[10px] text-[#2C4219] font-medium">100% produktif dan terverifikasi</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#433A30]">Anggota Tani Terdaftar</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] text-[#572E4A] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-title font-extrabold text-2xl text-[#2C4219]">{totalMembers}</h3>
            <span className="text-xs font-bold text-[#572E4A]">Ibu Tani</span>
          </div>
          <p className="text-[10px] text-[#433A30]/70">Terbagi dalam 4 kelompok kerja</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#433A30]">Stok Tepung Siap Jual</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF6EE] text-[#572E4A] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-title font-extrabold text-2xl text-[#2C4219]">{readyFlourKg.toLocaleString('id-ID')}</h3>
            <span className="text-xs font-bold text-[#572E4A]">kg</span>
          </div>
          <p className="text-[10px] text-[#572E4A] font-semibold">Tepung Premix Bebas Gluten</p>
        </div>
      </div>

      {/* Supply Chain Flow Pipeline */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4">
        <h3 className="font-title font-bold text-base text-[#2C4219]">Status Tahapan Rantai Pasok (SCM)</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#2C4219] bg-[#A8B774]/30 px-2 py-0.5 rounded-md">TAHAP 1</span>
              <CheckCircle2 className="w-4 h-4 text-[#2C4219]" />
            </div>
            <h4 className="font-title font-bold text-sm text-[#2C4219]">Budidaya Lahan</h4>
            <p className="text-xs text-[#433A30]">Blok A Siap Panen (92%), Blok B Fase Generatif (68%).</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#2C4219] bg-[#A8B774]/30 px-2 py-0.5 rounded-md">TAHAP 2</span>
              <CheckCircle2 className="w-4 h-4 text-[#2C4219]" />
            </div>
            <h4 className="font-title font-bold text-sm text-[#2C4219]">Pengeringan Biji</h4>
            <p className="text-xs text-[#433A30]">3.600 kg biji sedang dijemur dengan kelembaban target 12%.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#572E4A] bg-[#572E4A]/15 px-2 py-0.5 rounded-md">TAHAP 3</span>
              <Truck className="w-4 h-4 text-[#572E4A]" />
            </div>
            <h4 className="font-title font-bold text-sm text-[#2C4219]">Penggilingan Tepung</h4>
            <p className="text-xs text-[#433A30]">Kapasitas mesin giling 500 kg/hari di Sekretariat KWT.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#2C4219] bg-[#A8B774]/30 px-2 py-0.5 rounded-md">TAHAP 4</span>
              <Package className="w-4 h-4 text-[#2C4219]" />
            </div>
            <h4 className="font-title font-bold text-sm text-[#2C4219]">Pengemasan & Pasar</h4>
            <p className="text-xs text-[#433A30]">Siap kirim 1.250 kg ke mitra distributor UMKM mitra.</p>
          </div>
        </div>
      </div>

      {/* Land Status Progress Section */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-title font-bold text-base text-[#2C4219]">Progress Pertumbuhan per Blok Lahan</h3>
          <div className="flex items-center gap-2">
            {['Semua', 'Blok A', 'Blok B', 'Blok C', 'Blok D'].map(b => (
              <button
                key={b}
                onClick={() => setSelectedBlock(b)}
                className={`
                  px-3 py-1 rounded-lg text-xs font-semibold transition-all
                  ${selectedBlock === b ? 'bg-[#2C4219] text-white' : 'bg-[#FAF6EE] text-[#433A30] hover:bg-[#E6E1D5]'}
                `}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlots.map((plot) => (
            <div key={plot.id} className="p-4 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-title font-bold text-sm text-[#2C4219]">{plot.blockName}</h4>
                  <p className="text-[11px] text-[#433A30]/70">Penanggung Jawab: {plot.leaderName} • {plot.areaSize}</p>
                </div>
                <span className={`
                  px-2.5 py-0.5 rounded-full text-[10px] font-bold
                  ${plot.status === 'Siap Panen' ? 'bg-[#A8B774] text-[#2C4219]' : 'bg-[#2C4219] text-white'}
                `}>
                  {plot.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-[#433A30]">
                  <span>Progres Pertumbuhan: {plot.cropVariety}</span>
                  <span className="font-bold text-[#2C4219]">{plot.growthProgress}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-[#E6E1D5] overflow-hidden">
                  <div 
                    className="h-full bg-[#2C4219] transition-all duration-500 rounded-full"
                    style={{ width: `${plot.growthProgress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#433A30] pt-1">
                <div>
                  <span className="text-[#433A30]/70">Tgl Tanam:</span> {plot.plantingDate}
                </div>
                <div>
                  <span className="text-[#433A30]/70">Estimasi Panen:</span> {plot.expectedHarvestDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Harvest Records Log Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4">
        <h3 className="font-title font-bold text-base text-[#2C4219]">Riwayat Log Hasil Panen Terakhir</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF6EE] text-[#2C4219] font-title font-bold border-b border-[#E6E1D5]">
                <th className="p-3 rounded-l-xl">Tanggal</th>
                <th className="p-3">Asal Blok Lahan</th>
                <th className="p-3">Varietas Sorgum</th>
                <th className="p-3">Berat Panen (Kg)</th>
                <th className="p-3">Kualitas Mutu</th>
                <th className="p-3 rounded-r-xl">Petugas Pencatat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1D5]">
              {harvestRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                  <td className="p-3 font-medium text-[#433A30]">{rec.date}</td>
                  <td className="p-3 font-semibold text-[#2C4219]">{rec.blockName}</td>
                  <td className="p-3 text-[#433A30]">{rec.cropVariety}</td>
                  <td className="p-3 font-bold text-[#2C4219]">{rec.weightKg.toLocaleString('id-ID')} kg</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A8B774]/20 text-[#2C4219]">
                      {rec.quality}
                    </span>
                  </td>
                  <td className="p-3 text-[#433A30]/70">{rec.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Community Members Table - Task 7.3 & Admin 6.3 */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4">
        <h3 className="font-title font-bold text-base text-[#2C4219]">Daftar Anggota Komunitas Terdaftar</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF6EE] text-[#2C4219] font-title font-bold border-b border-[#E6E1D5]">
                <th className="p-3 rounded-l-xl">Nama Anggota</th>
                <th className="p-3">Peran Keanggotaan</th>
                <th className="p-3">Blok Kerja Lahan</th>
                <th className="p-3">Varietas Sorgum Utama</th>
                <th className="p-3 rounded-r-xl">Tanggal Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1D5]">
              {[
                { name: 'Ibu Hj. Kartini', role: 'Anggota KWT Melati Sorgum', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200', block: 'Lahan Blok B (Sektor Barat)', variety: 'Varietas Numbu', joined: 'Maret 2024' },
                { name: 'Ibu Rahayu', role: 'Koordinator Lahan A', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFTK8aL0lbmzdKkeh1Xei7BhbTIxg5tD8AN4PBL6g0dDKmy5XJvcPAJMKSVXNkyf8x8At48Z7gVlJEuXzBpQuV1brlyrkZPQhMP9wiQ-hzucdobhks645C-cNA21OlgNo4aaz9DHsLBkJyp6NOLhBv4d6SbT4BVEd1pTRL3P7EAxyvfEqARTMazTg1Nw_Ok7b_9iHFBQIYRb3pSR995e1ueq7FcsgLqZ3L8QPz8pSJa4PcRpNttgzk', block: 'Lahan Blok A (Lahan Utama)', variety: 'Bioguma Agritan 1', joined: 'Januari 2024' },
                { name: 'Ibu Siti Aminah', role: 'Koordinator Lahan B', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvlHIFyVd4QF3NG_VHJMp1NQ8FuZ4SUtAQeXTKZs1qghHh6sw-q90PURIbrf8dr07OtnIbwq7IKpAZagdYNGnlhNVt4XR3Cg1e6gbFQ81fnDH8DTvoExm5C4xjYutcz95yAm4x1SECwsik6CGRcWD8RRsS3FYbjAecKJsPPD4L82OFqguEVzUcYaxKzh71-0DdxAN_Ifv9N6JIoEPHw_wPxHHHZTvPF4hiNQ1eSo54LkzK8FWTGWkf', block: 'Lahan Blok B (Sektor Barat)', variety: 'Varietas Numbu', joined: 'Februari 2024' },
                { name: 'Ibu Ani', role: 'Koordinator Lahan C', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', block: 'Lahan Blok C (Sektor Timur)', variety: 'Bioguma Agritan 2', joined: 'Maret 2024' },
                { name: 'Bpk. Slamet', role: 'Koordinator Lahan D', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmV2syczoj6bnhULJMAo--BunkDLT-wO6ZJoDCP4YUDP_72KqM15DCGlRKI1vd3dWFKNKN2ArXx2CQTBjNkzJ2bJ0fQp2bC-jkmRbEWjgTboZ5D9dMwxd4umqik9rE_9t2kTlJu-vMksqooMQlw8I6ERCUqVms-pKJ0P-KZ8MbSli8QaAizny4NL9w6Bhl7tiFOo-pJQ2tFeE3T-q9YqbQnQ5xfOd5Z3TtjNXqR9FQAbJfhfheivA5', block: 'Lahan Blok D (Bukit Utara)', variety: 'Varietas Super 1', joined: 'Desember 2023' }
              ].map((member, idx) => (
                <tr key={idx} className="hover:bg-[#FAF6EE]/50 transition-colors">
                  <td className="p-3 font-semibold text-[#2C4219] flex items-center gap-2">
                    <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full object-cover border border-[#2C4219]/20" />
                    <span>{member.name}</span>
                  </td>
                  <td className="p-3 text-[#433A30] font-semibold">{member.role}</td>
                  <td className="p-3 text-[#433A30]">{member.block}</td>
                  <td className="p-3 text-[#433A30]">{member.variety}</td>
                  <td className="p-3 text-[#433A30]/70">{member.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Data Table - Task 7.4 & Admin 6.4 */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#2C4219]" />
          <h3 className="font-title font-bold text-base text-[#2C4219]">Data Produksi Tepung Sorgum</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF6EE] text-[#2C4219] font-title font-bold border-b border-[#E6E1D5]">
                <th className="p-3 rounded-l-xl">Kode Batch</th>
                <th className="p-3">Tanggal Produksi</th>
                <th className="p-3">Asal Blok</th>
                <th className="p-3">Volume Input (kg)</th>
                <th className="p-3">Output Tepung (kg)</th>
                <th className="p-3">Rendemen</th>
                <th className="p-3">Jenis Produk</th>
                <th className="p-3 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E1D5]">
              {[
                { batch: 'PRD-2026-001', date: '02 Juli 2026', block: 'Blok D', inputKg: 800, outputKg: 620, rendemen: '77.5%', type: 'Tepung Halus Premium', status: 'Terdistribusi', statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                { batch: 'PRD-2026-002', date: '15 Juli 2026', block: 'Blok A', inputKg: 1200, outputKg: 930, rendemen: '77.5%', type: 'Premix Bebas Gluten', status: 'Terdistribusi', statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                { batch: 'PRD-2026-003', date: '28 Juli 2026', block: 'Blok D', inputKg: 900, outputKg: 695, rendemen: '77.2%', type: 'Tepung Kasar (Grade B)', status: 'Stok Gudang', statusColor: 'bg-amber-50 text-amber-800 border-amber-200' },
                { batch: 'PRD-2026-004', date: '05 Agustus 2026', block: 'Blok A', inputKg: 1500, outputKg: 1160, rendemen: '77.3%', type: 'Tepung Halus Premium', status: 'Dalam Proses', statusColor: 'bg-blue-50 text-blue-800 border-blue-200' },
                { batch: 'PRD-2026-005', date: '10 Agustus 2026', block: 'Blok B', inputKg: 600, outputKg: 0, rendemen: '-', type: 'Premix Bebas Gluten', status: 'Antrian', statusColor: 'bg-[#FAF6EE] text-[#433A30] border-[#E6E1D5]' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-[#FAF6EE]/50 transition-colors">
                  <td className="p-3 font-bold text-[#2C4219]">{row.batch}</td>
                  <td className="p-3 text-[#433A30]">{row.date}</td>
                  <td className="p-3 font-semibold text-[#2C4219]">{row.block}</td>
                  <td className="p-3 text-[#433A30]">{row.inputKg.toLocaleString('id-ID')} kg</td>
                  <td className="p-3 font-bold text-[#2C4219]">{row.outputKg > 0 ? `${row.outputKg.toLocaleString('id-ID')} kg` : '—'}</td>
                  <td className="p-3 text-[#433A30]">{row.rendemen}</td>
                  <td className="p-3 text-[#433A30]">{row.type}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E6E1D5]">
          <div className="bg-[#FAF6EE] rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#433A30]/60 font-semibold uppercase tracking-wide">Total Batch</p>
            <p className="font-title font-extrabold text-lg text-[#2C4219]">5</p>
          </div>
          <div className="bg-[#FAF6EE] rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#433A30]/60 font-semibold uppercase tracking-wide">Total Input</p>
            <p className="font-title font-extrabold text-lg text-[#2C4219]">5.000 kg</p>
          </div>
          <div className="bg-[#FAF6EE] rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#433A30]/60 font-semibold uppercase tracking-wide">Total Output</p>
            <p className="font-title font-extrabold text-lg text-[#2C4219]">3.405 kg</p>
          </div>
          <div className="bg-[#FAF6EE] rounded-xl p-3 text-center">
            <p className="text-[10px] text-[#433A30]/60 font-semibold uppercase tracking-wide">Rata-rata Rendemen</p>
            <p className="font-title font-extrabold text-lg text-[#A8B774]">77.4%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

