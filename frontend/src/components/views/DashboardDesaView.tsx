import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sprout,
  Users,
  Package,
  Layers,
  Search,
  X,
  Filter,
  CheckCircle2,
  Calendar,
  RotateCcw,
  Eye,
  ArrowRight,
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  FileSpreadsheet,
  Heart
} from 'lucide-react';
import type { LandPlot, HarvestRecord, UserProfile } from '../../types';
import { getAvatarUrl, handleAvatarError } from '../../api/client';

interface DashboardDesaViewProps {
  landPlots: LandPlot[];
  harvestRecords: HarvestRecord[];
  members?: UserProfile[];
  totalUsers: number;
  totalRawMaterialKg?: number;
  isAdmin?: boolean;
  onOpenMulaiPanen: () => void;
}

type MetricCardType = 'ringkasan' | 'panen' | 'lahan' | 'anggota' | 'produksi';

export const DashboardDesaView: React.FC<DashboardDesaViewProps> = ({
  landPlots = [],
  harvestRecords = [],
  members = [],
  totalUsers = 0,
  totalRawMaterialKg,
  isAdmin = false,
  onOpenMulaiPanen,
}) => {
  // Pastikan array selalu valid dan aman dari undefined/null
  const safeHarvestRecords = Array.isArray(harvestRecords) ? harvestRecords : [];
  const safeLandPlots = Array.isArray(landPlots) ? landPlots : [];
  const safeMembers = Array.isArray(members) ? members : [];

  // State untuk card / tab aktif (default ke ringkasan)
  const [activeCard, setActiveCard] = useState<MetricCardType>('ringkasan');

  // State pencarian & filter SCM
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBlock, setFilterBlock] = useState<string>('Semua');
  const [filterVariety, setFilterVariety] = useState<string>('Semua');
  const [filterQuality, setFilterQuality] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterRole, setFilterRole] = useState<string>('Semua');
  const [filterProductType, setFilterProductType] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<string>('default');

  // Perhitungan metrik utama dengan proteksi nilai NaN/undefined
  const totalHarvestKg = safeHarvestRecords.reduce((acc, r) => acc + (Number(r?.weightKg) || 0), 0);
  const totalAreaValue = safeLandPlots.reduce((acc, p) => acc + (parseFloat(p?.areaSize || '0') || 0), 0);
  const totalAreaHa = `${totalAreaValue.toFixed(1)} Ha`;
  const totalMembers = Number(totalUsers) || safeMembers.length || 0;
  const readyFlourKg = totalRawMaterialKg !== undefined ? Number(totalRawMaterialKg) : totalHarvestKg;

  // Opsi filter blok unik dari data SCM
  const blockOptions = useMemo(() => {
    const fromLahan = safeLandPlots.map(p => p?.blockName).filter(Boolean);
    const fromPanen = safeHarvestRecords.map(r => r?.blockName).filter(Boolean);
    return ['Semua', ...Array.from(new Set([...fromLahan, ...fromPanen]))];
  }, [safeLandPlots, safeHarvestRecords]);

  // Opsi filter varietas sorgum unik dari data SCM
  const varietyOptions = useMemo(() => {
    const fromLahan = safeLandPlots.map(p => p?.cropVariety).filter(Boolean);
    const fromPanen = safeHarvestRecords.map(r => r?.cropVariety).filter(Boolean);
    const fromMembers = safeMembers.map(m => m?.sorghumType).filter(Boolean);
    return ['Semua', ...Array.from(new Set([...fromLahan, ...fromPanen, ...fromMembers]))];
  }, [safeLandPlots, safeHarvestRecords, safeMembers]);

  // Data terfilter & tersortir: Panen SCM
  const filteredHarvests = useMemo(() => {
    const sQuery = (searchQuery || '').trim().toLowerCase();
    const fBlock = (filterBlock || 'Semua').toLowerCase();
    const fVariety = (filterVariety || 'Semua').toLowerCase();

    let result = safeHarvestRecords.filter(rec => {
      if (!rec) return false;
      const bName = (rec.blockName || '').toLowerCase();
      const cVariety = (rec.cropVariety || '').toLowerCase();
      const rBy = (rec.recordedBy || '').toLowerCase();
      const rDate = (rec.date || '').toLowerCase();
      const rQuality = (rec.quality || '').toLowerCase();
      const rNotes = (rec.notes || '').toLowerCase();

      const matchBlock = filterBlock === 'Semua' ||
        rec.blockName === filterBlock ||
        bName.includes(fBlock) ||
        fBlock.includes(bName);

      const matchVariety = filterVariety === 'Semua' ||
        rec.cropVariety === filterVariety ||
        cVariety.includes(fVariety) ||
        fVariety.includes(cVariety);

      const matchQuality = filterQuality === 'Semua' || rec.quality === filterQuality;

      const matchSearch = sQuery === '' || (
        bName.includes(sQuery) ||
        cVariety.includes(sQuery) ||
        rBy.includes(sQuery) ||
        rDate.includes(sQuery) ||
        rQuality.includes(sQuery) ||
        rNotes.includes(sQuery)
      );

      return matchBlock && matchVariety && matchQuality && matchSearch;
    });

    if (sortBy === 'weight_desc') {
      result = [...result].sort((a, b) => (Number(b?.weightKg) || 0) - (Number(a?.weightKg) || 0));
    } else if (sortBy === 'weight_asc') {
      result = [...result].sort((a, b) => (Number(a?.weightKg) || 0) - (Number(b?.weightKg) || 0));
    } else if (sortBy === 'oldest') {
      result = [...result].reverse();
    }

    return result;
  }, [safeHarvestRecords, filterBlock, filterVariety, filterQuality, searchQuery, sortBy]);

  // Data terfilter & tersortir: Lahan SCM
  const filteredPlots = useMemo(() => {
    const sQuery = (searchQuery || '').trim().toLowerCase();
    const fBlock = (filterBlock || 'Semua').toLowerCase();
    const fVariety = (filterVariety || 'Semua').toLowerCase();

    let result = safeLandPlots.filter(plot => {
      if (!plot) return false;
      const bName = (plot.blockName || '').toLowerCase();
      const cVariety = (plot.cropVariety || '').toLowerCase();
      const lName = (plot.leaderName || '').toLowerCase();
      const pStatus = (plot.status || '').toLowerCase();

      const matchBlock = filterBlock === 'Semua' ||
        plot.blockName === filterBlock ||
        bName.includes(fBlock) ||
        fBlock.includes(bName);

      const matchVariety = filterVariety === 'Semua' ||
        plot.cropVariety === filterVariety ||
        cVariety.includes(fVariety) ||
        fVariety.includes(cVariety);

      const matchStatus = filterStatus === 'Semua' || plot.status === filterStatus;

      const matchSearch = sQuery === '' || (
        bName.includes(sQuery) ||
        cVariety.includes(sQuery) ||
        lName.includes(sQuery) ||
        pStatus.includes(sQuery)
      );

      return matchBlock && matchVariety && matchStatus && matchSearch;
    });

    if (sortBy === 'progress_asc') {
      result = [...result].sort((a, b) => (Number(a?.growthProgress) || 0) - (Number(b?.growthProgress) || 0));
    } else if (sortBy === 'progress_desc' || sortBy === 'default') {
      result = [...result].sort((a, b) => (Number(b?.growthProgress) || 0) - (Number(a?.growthProgress) || 0));
    } else if (sortBy === 'area_desc') {
      result = [...result].sort((a, b) => (parseFloat(b?.areaSize || '0') || 0) - (parseFloat(a?.areaSize || '0') || 0));
    }

    return result;
  }, [safeLandPlots, filterBlock, filterVariety, filterStatus, searchQuery, sortBy]);

  // Data terfilter: Anggota Komunitas SCM
  const filteredMembers = useMemo(() => {
    const sQuery = (searchQuery || '').trim().toLowerCase();
    const fBlock = (filterBlock || 'Semua').toLowerCase();
    const fVariety = (filterVariety || 'Semua').toLowerCase();

    return safeMembers.filter(member => {
      if (!member) return false;
      const mName = (typeof member.name === 'string' ? member.name : (member.fullName || member.username || 'Anggota')).toLowerCase();
      const mRole = (typeof member.role === 'string' ? member.role : '').toLowerCase();
      const mLocation = (typeof member.lahanLocation === 'string' ? member.lahanLocation : '').toLowerCase();
      const mSorghum = (typeof member.sorghumType === 'string' ? member.sorghumType : '').toLowerCase();

      const matchBlock = filterBlock === 'Semua' || (
        mLocation.includes(fBlock) || fBlock.includes(mLocation)
      );

      const matchVariety = filterVariety === 'Semua' || (
        mSorghum.includes(fVariety) || fVariety.includes(mSorghum)
      );

      const matchRole = filterRole === 'Semua' || member.role === filterRole;

      const matchSearch = sQuery === '' || (
        mName.includes(sQuery) ||
        mRole.includes(sQuery) ||
        mLocation.includes(sQuery) ||
        mSorghum.includes(sQuery)
      );

      return matchBlock && matchVariety && matchRole && matchSearch;
    });
  }, [safeMembers, filterBlock, filterVariety, filterRole, searchQuery]);

  // Data terfilter: Produksi & Rantai Pasok SCM
  const filteredProduction = useMemo(() => {
    const sQuery = (searchQuery || '').trim().toLowerCase();
    const fBlock = (filterBlock || 'Semua').toLowerCase();
    const fVariety = (filterVariety || 'Semua').toLowerCase();

    const mapped = safeHarvestRecords.map((rec, idx) => {
      const inputKg = Number(rec?.weightKg) || 0;
      const outputKg = Math.round(inputKg * 0.775);
      const rendemen = '77.5%';
      const types = ['Tepung Halus Premium', 'Premix Bebas Gluten', 'Tepung Kasar (Grade B)'];
      const statuses = [
        { label: 'Terdistribusi', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
        { label: 'Stok Gudang', color: 'bg-amber-50 text-amber-800 border-amber-200' },
        { label: 'Dalam Proses', color: 'bg-blue-50 text-blue-800 border-blue-200' },
      ];
      const statusObj = statuses[idx % statuses.length] || statuses[0];
      const batchCode = `PRD-2026-${String(idx + 1).padStart(3, '0')}`;
      const productType = types[idx % types.length] || types[0];

      return {
        rec,
        idx,
        inputKg,
        outputKg,
        rendemen,
        batchCode,
        productType,
        statusObj
      };
    });

    let result = mapped.filter(item => {
      const bName = (item.rec?.blockName || '').toLowerCase();
      const cVariety = (item.rec?.cropVariety || '').toLowerCase();
      const bCode = (item.batchCode || '').toLowerCase();
      const pType = (item.productType || '').toLowerCase();
      const sLabel = (item.statusObj?.label || '').toLowerCase();
      const rDate = (item.rec?.date || '').toLowerCase();

      const matchBlock = filterBlock === 'Semua' ||
        item.rec?.blockName === filterBlock ||
        bName.includes(fBlock) ||
        fBlock.includes(bName);

      const matchVariety = filterVariety === 'Semua' ||
        item.rec?.cropVariety === filterVariety ||
        cVariety.includes(fVariety) ||
        fVariety.includes(cVariety);

      const matchStatus = filterStatus === 'Semua' || item.statusObj?.label === filterStatus;
      const matchProduct = filterProductType === 'Semua' || item.productType === filterProductType;

      const matchSearch = sQuery === '' || (
        bCode.includes(sQuery) ||
        bName.includes(sQuery) ||
        cVariety.includes(sQuery) ||
        pType.includes(sQuery) ||
        sLabel.includes(sQuery) ||
        rDate.includes(sQuery)
      );

      return matchBlock && matchVariety && matchStatus && matchProduct && matchSearch;
    });

    if (sortBy === 'output_desc') {
      result = [...result].sort((a, b) => (b.outputKg || 0) - (a.outputKg || 0));
    } else if (sortBy === 'output_asc') {
      result = [...result].sort((a, b) => (a.outputKg || 0) - (b.outputKg || 0));
    }

    return result;
  }, [safeHarvestRecords, filterBlock, filterVariety, filterStatus, filterProductType, searchQuery, sortBy]);

  const hasActiveFilter = (
    searchQuery.trim() !== '' ||
    filterBlock !== 'Semua' ||
    filterVariety !== 'Semua' ||
    filterQuality !== 'Semua' ||
    filterStatus !== 'Semua' ||
    filterRole !== 'Semua' ||
    filterProductType !== 'Semua' ||
    sortBy !== 'default'
  );

  const handleResetFilter = () => {
    setSearchQuery('');
    setFilterBlock('Semua');
    setFilterVariety('Semua');
    setFilterQuality('Semua');
    setFilterStatus('Semua');
    setFilterRole('Semua');
    setFilterProductType('Semua');
    setSortBy('default');
  };

  const handleCardClick = (type: MetricCardType) => {
    setActiveCard(type);
    setSearchQuery('');
    setFilterBlock('Semua');
    setFilterVariety('Semua');
    setFilterQuality('Semua');
    setFilterStatus('Semua');
    setFilterRole('Semua');
    setFilterProductType('Semua');
    setSortBy('default');
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-12">
      {/* Menu Kategori Data SCM (Sama seperti di User Community) */}
      <div className="bg-white p-2.5 sm:p-3.5 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-2">
        <div className="px-1 flex items-center justify-between">
          <p className="text-[11px] sm:text-xs font-bold text-[#7A7062] uppercase tracking-wider">
            Pilih Kategori Data:
          </p>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#A8B774] bg-[#FAF6EE] px-2.5 py-0.5 rounded-md border border-[#E6E1D5]">
            Sistem Rantai Pasok (SCM) Desa
          </span>
        </div>

        {/* Grid 5 Tab: Pada HP tampil 1 tombol Ringkasan lebar + 4 tombol 2x2. Pada tablet/PC tampil 5 kolom sejajar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {/* 1. Ringkasan */}
          <button
            type="button"
            onClick={() => handleCardClick('ringkasan')}
            className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeCard === 'ringkasan'
                ? 'bg-[#2C4219] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#433A30] hover:bg-[#F3EEDB] border border-[#E6E1D5]'
              }`}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeCard === 'ringkasan' ? 'text-white' : 'text-rose-500'}`} />
            <span>Ringkasan Utama</span>
          </button>

          {/* 2. Data Panen */}
          <button
            type="button"
            onClick={() => handleCardClick('panen')}
            className={`flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeCard === 'panen'
                ? 'bg-[#2C4219] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#433A30] hover:bg-[#F3EEDB] border border-[#E6E1D5]'
              }`}
          >
            <TrendingUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeCard === 'panen' ? 'text-white' : 'text-orange-600'}`} />
            <span>Data Panen</span>
          </button>

          {/* 3. Data Lahan */}
          <button
            type="button"
            onClick={() => handleCardClick('lahan')}
            className={`flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeCard === 'lahan'
                ? 'bg-[#2C4219] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#433A30] hover:bg-[#F3EEDB] border border-[#E6E1D5]'
              }`}
          >
            <Sprout className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeCard === 'lahan' ? 'text-white' : 'text-emerald-700'}`} />
            <span>Data Lahan</span>
          </button>

          {/* 4. Komunitas */}
          <button
            type="button"
            onClick={() => handleCardClick('anggota')}
            className={`flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeCard === 'anggota'
                ? 'bg-[#2C4219] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#433A30] hover:bg-[#F3EEDB] border border-[#E6E1D5]'
              }`}
          >
            <Users className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeCard === 'anggota' ? 'text-white' : 'text-[#572E4A]'}`} />
            <span>Komunitas</span>
          </button>

          {/* 5. Produksi */}
          <button
            type="button"
            onClick={() => handleCardClick('produksi')}
            className={`flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeCard === 'produksi'
                ? 'bg-[#2C4219] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#433A30] hover:bg-[#F3EEDB] border border-[#E6E1D5]'
              }`}
          >
            <Package className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeCard === 'produksi' ? 'text-white' : 'text-[#607829]'}`} />
            <span>Produksi</span>
          </button>
        </div>
      </div>

      {/* 1. Primary Metrics Grid: HANYA TAMPIL SAAT DI TAB RINGKASAN */}
      {activeCard === 'ringkasan' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-title font-bold text-xs sm:text-sm text-[#2C4219]">
              Pilih Salah Satu Kartu Metrik untuk Melihat Rincian Data:
            </h3>
            <span className="text-[10px] sm:text-[11px] text-[#7A7062]">Ketuk kartu apa saja</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CARD 1: Total Panen */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick('panen')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick('panen'); }}
              className="p-5 rounded-2xl border transition-all duration-200 text-left cursor-pointer flex flex-col justify-between relative overflow-hidden bg-white border-[#E6E1D5] hover:border-[#D97706] hover:shadow-xs shadow-2xs group hover:scale-[1.01] active:scale-95"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#433A30]">
                    Total Panen Terkumpul
                  </span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors bg-[#FAF6EE] text-[#D97706]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-title font-bold text-2xl text-[#D97706]">{totalHarvestKg.toLocaleString('id-ID')}</h3>
                  <span className="text-xs font-bold text-[#A8B774]">kg</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#E6E1D5]/60 mt-2 flex items-center justify-between">
                <span className="text-[10px] text-[#A8B774] font-semibold">Data SCM Hasil</span>
                <span className="text-[11px] font-bold text-[#D97706] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Lihat Data Panen →
                </span>
              </div>
            </div>

            {/* CARD 2: Total Luas Lahan */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick('lahan')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick('lahan'); }}
              className="p-5 rounded-2xl border transition-all duration-200 text-left cursor-pointer flex flex-col justify-between relative overflow-hidden bg-white border-[#E6E1D5] hover:border-[#2C4219] hover:shadow-xs shadow-2xs group hover:scale-[1.01] active:scale-95"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#433A30]">
                    Total Luas Lahan
                  </span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors bg-[#FAF6EE] text-[#2C4219]">
                    <Sprout className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-title font-bold text-2xl text-[#2C4219]">{totalAreaHa}</h3>
                  <span className="text-xs font-bold text-[#433A30]/70">{Array.from(new Set(safeLandPlots.map(p => p?.blockName).filter(Boolean))).length} Blok</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#E6E1D5]/60 mt-2 flex items-center justify-between">
                <span className="text-[10px] text-[#2C4219] font-medium">Data SCM Lahan</span>
                <span className="text-[11px] font-bold text-[#2C4219] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Lihat Data Lahan →
                </span>
              </div>
            </div>

            {/* CARD 3: Anggota Tani */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick('anggota')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick('anggota'); }}
              className="p-5 rounded-2xl border transition-all duration-200 text-left cursor-pointer flex flex-col justify-between relative overflow-hidden bg-white border-[#E6E1D5] hover:border-[#572E4A] hover:shadow-xs shadow-2xs group hover:scale-[1.01] active:scale-95"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#433A30]">
                    Anggota Tani Terdaftar
                  </span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors bg-[#FAF6EE] text-[#572E4A]">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-title font-bold text-2xl text-[#572E4A]">{totalMembers}</h3>
                  <span className="text-xs font-bold text-[#572E4A]">Ibu Tani</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#E6E1D5]/60 mt-2 flex items-center justify-between">
                <span className="text-[10px] text-[#572E4A]/70 font-semibold">Komunitas KWT SCM</span>
                <span className="text-[11px] font-bold text-[#572E4A] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Lihat Komunitas →
                </span>
              </div>
            </div>

            {/* CARD 4: Data Produksi & Stok */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick('produksi')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick('produksi'); }}
              className="p-5 rounded-2xl border transition-all duration-200 text-left cursor-pointer flex flex-col justify-between relative overflow-hidden bg-white border-[#E6E1D5] hover:border-[#607829] hover:shadow-xs shadow-2xs group hover:scale-[1.01] active:scale-95"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#433A30]">
                    Data Produksi &amp; Stok
                  </span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors bg-[#FAF6EE] text-[#607829]">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-title font-bold text-2xl text-[#2C4219]">{readyFlourKg.toLocaleString('id-ID')}</h3>
                  <span className="text-xs font-bold text-[#A8B774]">kg</span>
                </div>
              </div>
              <div className="pt-3 border-t border-[#E6E1D5]/60 mt-2 flex items-center justify-between">
                <span className="text-[10px] text-[#A8B774] font-semibold">SCM Pengolahan</span>
                <span className="text-[11px] font-bold text-[#607829] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Lihat Produksi →
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SCM Filter & Search Toolbar: HANYA TAMPIL SAAT MEMILIH TAB DATA SPESIFIK */}
      {activeCard !== 'ringkasan' && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-3.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF6EE] text-[#2C4219] flex items-center justify-center font-bold border border-[#E6E1D5]/60 shadow-2xs">
                {activeCard === 'panen' && <TrendingUp className="w-5 h-5 text-[#D97706]" />}
                {activeCard === 'lahan' && <Sprout className="w-5 h-5 text-emerald-700" />}
                {activeCard === 'anggota' && <Users className="w-5 h-5 text-[#572E4A]" />}
                {activeCard === 'produksi' && <Package className="w-5 h-5 text-[#607829]" />}
              </div>
              <div>
                <h3 className="font-title font-bold text-base text-[#2C4219]">
                  {activeCard === 'panen' && 'Data Hasil Panen (Integrasi SCM)'}
                  {activeCard === 'lahan' && 'Data Pemetaan & Progres Lahan (SCM)'}
                  {activeCard === 'anggota' && 'Data Anggota & Kelompok Tani (SCM)'}
                  {activeCard === 'produksi' && 'Data Pengolahan & Rantai Pasok (SCM)'}
                </h3>
                <p className="text-[11px] text-[#7A7062]">
                  Sinkronisasi otomatis dengan sistem database rantai pasok Bestari SCM.
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic SCM Filter Controls */}
          <div className="pt-3 border-t border-[#E6E1D5] space-y-2.5">
            {/* Row 1: Search bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#7A7062] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Cari data SCM (nama blok, varietas, petani, kode batch, tanggal)...`}
                className="w-full pl-9.5 pr-8 py-2.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] placeholder:text-[#A19D94] focus:outline-none focus:border-[#2C4219] focus:bg-white transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#7A7062] hover:text-rose-500 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Row 2: Grid of SCM-specific filters */}
            <div className={`grid grid-cols-2 ${activeCard === 'all' ? 'sm:grid-cols-3 lg:grid-cols-5' : 'sm:grid-cols-4'} gap-2.5`}>
              {/* Filter 1: Asal Blok Lahan SCM */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">Blok Lahan SCM</label>
                <select
                  value={filterBlock}
                  onChange={(e) => setFilterBlock(e.target.value)}
                  className="w-full py-2 px-2.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] focus:bg-white cursor-pointer"
                >
                  {blockOptions.map(b => (
                    <option key={b} value={b}>
                      {b === 'Semua' ? 'Semua Blok Lahan' : b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Varietas Sorgum SCM */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">Varietas Sorgum SCM</label>
                <select
                  value={filterVariety}
                  onChange={(e) => setFilterVariety(e.target.value)}
                  className="w-full py-2 px-2.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] focus:bg-white cursor-pointer"
                >
                  {varietyOptions.map(v => (
                    <option key={v} value={v}>
                      {v === 'Semua' ? 'Semua Varietas' : v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Dynamic Category-specific SCM filter */}
              {(activeCard === 'panen' || activeCard === 'all') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">Mutu / Kualitas SCM</label>
                  <select
                    value={filterQuality}
                    onChange={(e) => setFilterQuality(e.target.value)}
                    className="w-full py-2 px-2.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] focus:bg-white cursor-pointer"
                  >
                    <option value="Semua">Semua Mutu Kualitas</option>
                    <option value="Super Premium">Super Premium</option>
                    <option value="Grade A">Grade A (Standar)</option>
                    <option value="Grade B">Grade B (Pakan)</option>
                  </select>
                </div>
              )}

              {(activeCard === 'lahan' || activeCard === 'all') && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">Fase / Status Lahan SCM</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full py-2 px-2.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] focus:bg-white cursor-pointer"
                  >
                    <option value="Semua">Semua Status Kesiapan</option>
                    <option value="Siap Panen">Siap Panen (Masa Panen)</option>
                    <option value="Generatif">Generatif (Masa Pertumbuhan)</option>
                    <option value="Vegetatif">Vegetatif (Fase Awal)</option>
                    <option value="Pasca Panen">Pasca Panen (Bera)</option>
                  </select>
                </div>
              )}

              {activeCard === 'produksi' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">Status Pasok / Gudang</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full py-2 px-2.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] focus:bg-white cursor-pointer"
                  >
                    <option value="Semua">Semua Status Rantai Pasok</option>
                    <option value="Terdistribusi">Terdistribusi (Siap Jual)</option>
                    <option value="Stok Gudang">Stok Gudang SCM</option>
                    <option value="Dalam Proses">Dalam Pengolahan</option>
                  </select>
                </div>
              )}

              {activeCard === 'anggota' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">Peran Komunitas SCM</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full py-2 px-2.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] focus:bg-white cursor-pointer"
                  >
                    <option value="Semua">Semua Peran Petani</option>
                    <option value="USER">Anggota KWT</option>
                    <option value="ADMIN">Pengurus / Admin SCM</option>
                  </select>
                </div>
              )}

              {/* Filter 4: Sorting SCM */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">Urutkan Data SCM</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full py-2 px-2.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] focus:bg-white cursor-pointer"
                >
                  <option value="default">Terbaru (Default)</option>
                  {activeCard === 'panen' && (
                    <>
                      <option value="oldest">Tanggal Terlama</option>
                      <option value="weight_desc">Hasil Panen Terbesar (Kg)</option>
                      <option value="weight_asc">Hasil Panen Terkecil (Kg)</option>
                    </>
                  )}
                  {activeCard === 'lahan' && (
                    <>
                      <option value="progress_desc">Progres Tertinggi (%)</option>
                      <option value="progress_asc">Progres Terendah (%)</option>
                      <option value="area_desc">Luas Terbesar (Ha)</option>
                    </>
                  )}
                  {activeCard === 'produksi' && (
                    <>
                      <option value="output_desc">Output Tepung Terbanyak</option>
                      <option value="output_asc">Output Tepung Terendah</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Filter Status Badge & Reset Action */}
            {hasActiveFilter && (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-[#7A7062]">Filter SCM Aktif:</span>
                  {filterBlock !== 'Semua' && (
                    <span className="bg-[#2C4219]/10 text-[#2C4219] text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Blok: {filterBlock}
                    </span>
                  )}
                  {filterVariety !== 'Semua' && (
                    <span className="bg-[#2C4219]/10 text-[#2C4219] text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Varietas: {filterVariety}
                    </span>
                  )}
                  {filterQuality !== 'Semua' && (
                    <span className="bg-[#A8B774]/20 text-[#2C4219] text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Mutu: {filterQuality}
                    </span>
                  )}
                  {filterStatus !== 'Semua' && (
                    <span className="bg-[#A8B774]/20 text-[#2C4219] text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Status: {filterStatus}
                    </span>
                  )}
                  {sortBy !== 'default' && (
                    <span className="bg-[#E6E1D5] text-[#433A30] text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Sorted
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1 rounded-xl flex items-center gap-1 transition-colors shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Filter SCM
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Render Data Berdasarkan Card yang Dipilih */}

      {/* A. SECTION DATA PANEN SCM */}
      {activeCard === 'panen' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-title font-bold text-base text-[#2C4219] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2C4219]" />
                Data Hasil Panen Sorgum (SCM)
              </h3>
              <p className="text-xs text-[#7A7062] mt-0.5">
                Menampilkan <b>{filteredHarvests.length}</b> dari {safeHarvestRecords.length} catatan panen terdata
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-[#FAF6EE] text-[#2C4219] border border-[#E6E1D5] px-2.5 py-1 rounded-full">
                🌾 Total: {filteredHarvests.reduce((acc, r) => acc + (Number(r?.weightKg) || 0), 0).toLocaleString('id-ID')} Kg
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF6EE] text-[#2C4219] font-title font-bold border-b border-[#E6E1D5]">
                  <th className="p-3 rounded-l-xl">Tanggal Panen</th>
                  <th className="p-3">Asal Blok Lahan</th>
                  <th className="p-3">Varietas Sorgum</th>
                  <th className="p-3">Berat Panen (Kg)</th>
                  <th className="p-3">Mutu Kualitas SCM</th>
                  <th className="p-3 rounded-r-xl">Petani PIC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D5]">
                {filteredHarvests.length > 0 ? (
                  filteredHarvests.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#FAF6EE]/50 transition-colors">
                      <td className="p-3 font-medium text-[#433A30] whitespace-nowrap">{rec?.date || '-'}</td>
                      <td className="p-3 font-semibold text-[#2C4219] whitespace-nowrap">{rec?.blockName || '-'}</td>
                      <td className="p-3 text-[#433A30] font-medium">{rec?.cropVariety || '-'}</td>
                      <td className="p-3 font-bold text-[#2C4219] whitespace-nowrap">{(Number(rec?.weightKg) || 0).toLocaleString('id-ID')} kg</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${rec?.quality === 'Super Premium'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : rec?.quality === 'Grade A'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                          {rec?.quality || 'Grade A'}
                        </span>
                      </td>
                      <td className="p-3 text-[#433A30]/80 whitespace-nowrap">{rec?.recordedBy || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#7A7062]">
                      <p className="font-bold text-sm">Tidak ada data panen yang cocok dengan filter SCM.</p>
                      <p className="text-xs text-[#A19D94] mt-1">Coba sesuaikan kata kunci, blok lahan, atau varietas sorgum Anda.</p>
                      <button
                        onClick={handleResetFilter}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-[#2C4219] text-white text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Filter
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* B. SECTION DATA LAHAN SCM */}
      {activeCard === 'lahan' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-title font-bold text-base text-[#2C4219] flex items-center gap-2">
                <Sprout className="w-5 h-5 text-[#2C4219]" />
                Data Pemetaan &amp; Progres Pertumbuhan Lahan (SCM)
              </h3>
              <p className="text-xs text-[#7A7062] mt-0.5">
                Menampilkan <b>{filteredPlots.length}</b> dari {safeLandPlots.length} blok lahan aktif
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-[#FAF6EE] text-[#2C4219] border border-[#E6E1D5] px-2.5 py-1 rounded-full">
                📍 Total Luas: {filteredPlots.reduce((acc, p) => acc + (parseFloat(p?.areaSize || '0') || 0), 0).toFixed(1)} Ha
              </span>
            </div>
          </div>

          {filteredPlots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPlots.map((plot) => (
                <div key={plot.id} className="p-4 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-3 hover:border-[#A8B774] transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-title font-bold text-sm text-[#2C4219]">{plot.blockName}</h4>
                      <p className="text-[11px] text-[#433A30]/70">PIC Lahan: {plot.leaderName} • Luas: {plot.areaSize}</p>
                    </div>
                    <span className={`
                      px-2.5 py-0.5 rounded-full text-[10px] font-bold border
                      ${plot.status === 'Siap Panen' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-white text-[#2C4219] border-[#E6E1D5]'}
                    `}>
                      {plot.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#433A30]">
                      <span className="flex items-center gap-1.5">
                        🌾 Varietas: <b>{plot.cropVariety}</b>
                      </span>
                      <span className="font-bold text-[#2C4219]">{plot.growthProgress}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#E6E1D5] overflow-hidden">
                      <div
                        className="h-full bg-[#2C4219] transition-all duration-500 rounded-full"
                        style={{ width: `${plot.growthProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#433A30] pt-1 border-t border-[#E6E1D5]/60">
                    <div>
                      <span className="text-[#433A30]/70">Tgl Tanam:</span> <b>{plot.plantingDate}</b>
                    </div>
                    <div>
                      <span className="text-[#433A30]/70">Estimasi Panen:</span> <b>{plot.expectedHarvestDate}</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[#7A7062] bg-[#FAF6EE]/50 rounded-xl border border-dashed border-[#E6E1D5]">
              <p className="font-bold text-sm">Tidak ada blok lahan yang cocok dengan filter SCM.</p>
              <button
                onClick={handleResetFilter}
                className="mt-3 px-3 py-1.5 rounded-xl bg-[#2C4219] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* C. SECTION DATA ANGGOTA SCM (Dapat Dilihat oleh User dan Admin) */}
      {activeCard === 'anggota' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-title font-bold text-base text-[#2C4219] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#572E4A]" />
                Data Anggota Kelompok Tani (SCM)
              </h3>
              <p className="text-xs text-[#7A7062] mt-0.5">
                Menampilkan <b>{filteredMembers.length}</b> dari {members.length} anggota komunitas tani
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF6EE] text-[#2C4219] font-title font-bold border-b border-[#E6E1D5]">
                  <th className="p-3 rounded-l-xl">Nama Anggota</th>
                  <th className="p-3">Peran Anggota</th>
                  <th className="p-3">Blok Penugasan Lahan</th>
                  <th className="p-3">Varietas Sorgum Utama</th>
                  <th className="p-3 rounded-r-xl">Tanggal Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D5]">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member, idx) => {
                    const memberName = typeof member?.name === 'string' ? member.name : (member?.fullName || member?.username || 'Anggota');
                    return (
                      <tr key={member?.id || idx} className="hover:bg-[#FAF6EE]/50 transition-colors">
                        <td className="p-3 font-semibold text-[#2C4219] flex items-center gap-2 whitespace-nowrap">
                          <img
                            src={getAvatarUrl(member?.avatar, memberName)}
                            alt={memberName}
                            onError={(e) => handleAvatarError(e, memberName)}
                            className="w-6 h-6 rounded-full object-cover border border-[#2C4219]/20"
                          />
                          <span>{memberName}</span>
                        </td>
                        <td className="p-3 text-[#433A30] font-semibold whitespace-nowrap">
                          {member?.role === 'USER' ? 'Anggota KWT' : (member?.role || 'Anggota')}
                        </td>
                        <td className="p-3 text-[#433A30] whitespace-nowrap">{member?.lahanLocation || '-'}</td>
                        <td className="p-3 text-[#433A30] font-medium">{member?.sorghumType || '-'}</td>
                        <td className="p-3 text-[#433A30]/70 whitespace-nowrap">{member?.memberSince || '-'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#7A7062]">
                      <p className="font-bold text-sm">Tidak ada anggota yang cocok dengan filter SCM.</p>
                      <button
                        onClick={handleResetFilter}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-[#2C4219] text-white text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Filter
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* D. SECTION DATA PRODUKSI & RANTAI PASOK SCM */}
      {activeCard === 'produksi' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E6E1D5] shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-title font-bold text-base text-[#2C4219] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#2C4219]" />
                Data Produksi Tepung &amp; Rantai Pasok SCM
              </h3>
              <p className="text-xs text-[#7A7062] mt-0.5">
                Menampilkan <b>{filteredProduction.length}</b> dari {harvestRecords.length} batch pengolahan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-[#FAF6EE] text-[#2C4219] border border-[#E6E1D5] px-2.5 py-1 rounded-full">
                🥣 Output Tepung: {filteredProduction.reduce((s, r) => s + (Number(r?.outputKg) || 0), 0).toLocaleString('id-ID')} Kg
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF6EE] text-[#2C4219] font-title font-bold border-b border-[#E6E1D5]">
                  <th className="p-3 rounded-l-xl">Kode Batch SCM</th>
                  <th className="p-3">Tanggal Produksi</th>
                  <th className="p-3">Asal Blok Lahan</th>
                  <th className="p-3">Varietas Bahan</th>
                  <th className="p-3">Volume Input (kg)</th>
                  <th className="p-3">Output Tepung (kg)</th>
                  <th className="p-3">Rendemen</th>
                  <th className="p-3">Produk Olahan</th>
                  <th className="p-3 rounded-r-xl">Status Pasokan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D5]">
                {filteredProduction.length > 0 ? (
                  filteredProduction.map((item) => (
                    <tr key={item.idx} className="hover:bg-[#FAF6EE]/50 transition-colors">
                      <td className="p-3 font-bold text-[#2C4219] whitespace-nowrap">{item.batchCode}</td>
                      <td className="p-3 text-[#433A30] whitespace-nowrap">{item.rec?.date || '-'}</td>
                      <td className="p-3 font-semibold text-[#2C4219] whitespace-nowrap">{item.rec?.blockName || '-'}</td>
                      <td className="p-3 text-[#433A30] font-medium whitespace-nowrap">{item.rec?.cropVariety || '-'}</td>
                      <td className="p-3 text-[#433A30] whitespace-nowrap">{(Number(item.inputKg) || 0).toLocaleString('id-ID')} kg</td>
                      <td className="p-3 font-bold text-[#2C4219] whitespace-nowrap">{(Number(item.outputKg) || 0).toLocaleString('id-ID')} kg</td>
                      <td className="p-3 text-[#433A30] whitespace-nowrap">{item.rendemen || '77.5%'}</td>
                      <td className="p-3 text-[#433A30] font-medium whitespace-nowrap">{item.productType || '-'}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.statusObj?.color || 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                          {item.statusObj?.label || 'Dalam Proses'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-[#7A7062]">
                      <p className="font-bold text-sm">Tidak ada data produksi yang cocok dengan filter SCM.</p>
                      <button
                        onClick={handleResetFilter}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-[#2C4219] text-white text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset Filter
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* SCM Summary row */}
          {filteredProduction.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E6E1D5]">
              <div className="bg-[#FAF6EE] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#433A30]/60 font-semibold uppercase tracking-wide">Total Batch SCM</p>
                <p className="font-title font-bold text-lg text-[#2C4219]">{filteredProduction.length}</p>
              </div>
              <div className="bg-[#FAF6EE] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#433A30]/60 font-semibold uppercase tracking-wide">Bahan Baku Input</p>
                <p className="font-title font-bold text-lg text-[#2C4219]">
                  {filteredProduction.reduce((s, r) => s + (Number(r?.inputKg) || 0), 0).toLocaleString('id-ID')} kg
                </p>
              </div>
              <div className="bg-[#FAF6EE] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#433A30]/60 font-semibold uppercase tracking-wide">Output Tepung SCM</p>
                <p className="font-title font-bold text-lg text-[#2C4219]">
                  {filteredProduction.reduce((s, r) => s + (Number(r?.outputKg) || 0), 0).toLocaleString('id-ID')} kg
                </p>
              </div>
              <div className="bg-[#FAF6EE] rounded-xl p-3 text-center">
                <p className="text-[10px] text-[#433A30]/60 font-semibold uppercase tracking-wide">Rata-rata Rendemen</p>
                <p className="font-title font-bold text-lg text-[#A8B774]">77.5%</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
