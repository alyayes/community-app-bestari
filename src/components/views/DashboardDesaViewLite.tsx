import React, { useState, useMemo } from 'react';
import type { LandPlot, HarvestRecord, UserProfile } from '../../types';
import {
  Package,
  Sprout,
  Users,
  LayoutList,
  MapPin,
  ChevronRight,
  Heart,
  TrendingUp,
  Search,
  X,
  RotateCcw,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import { getAvatarUrl, handleAvatarError } from '../../api/client';

interface DashboardDesaViewLiteProps {
  landPlots?: LandPlot[];
  harvestRecords?: HarvestRecord[];
  members?: UserProfile[];
  onOpenMulaiPanen: () => void;
}

export const DashboardDesaViewLite: React.FC<DashboardDesaViewLiteProps> = ({
  landPlots = [],
  harvestRecords = [],
  members = [],
  onOpenMulaiPanen,
}) => {
  const safeHarvestRecords = Array.isArray(harvestRecords) ? harvestRecords : [];
  const safeLandPlots = Array.isArray(landPlots) ? landPlots : [];
  const safeMembers = Array.isArray(members) ? members : [];

  const [activeTab, setActiveTab] = useState<'ringkasan' | 'panen' | 'lahan' | 'anggota' | 'produksi'>('ringkasan');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterBlock, setFilterBlock] = useState<string>('Semua');
  const [filterVariety, setFilterVariety] = useState<string>('Semua');
  const [filterQuality, setFilterQuality] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterRole, setFilterRole] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<string>('default');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  const totalPanenKg = safeHarvestRecords.reduce((sum, record) => sum + (Number(record?.yieldKg) || Number(record?.weightKg) || 0), 0);
  const totalAreaValue = safeLandPlots.reduce((acc, p) => acc + (parseFloat(p?.areaSize || '0') || 0), 0);
  const totalAreaHa = `${totalAreaValue.toFixed(1)} Ha`;
  const totalTepungSorgumKg = safeHarvestRecords.reduce((sum, record) => sum + (Number(record?.processedFlourKg) || Math.round((Number(record?.weightKg) || 0) * 0.775)), 0);

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

  // Tab switcher
  const tabs = [
    { id: 'ringkasan', label: 'Ringkasan', icon: <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'panen', label: 'Data Panen', icon: <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'lahan', label: 'Data Lahan', icon: <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'anggota', label: 'Komunitas', icon: <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'produksi', label: 'Produksi', icon: <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
  ] as const;

  const handleTabChange = (tabId: 'ringkasan' | 'lahan' | 'panen' | 'produksi' | 'anggota') => {
    setActiveTab(tabId);
    setSearchQuery('');
    setFilterBlock('Semua');
    setFilterVariety('Semua');
    setFilterQuality('Semua');
    setFilterStatus('Semua');
    setFilterRole('Semua');
    setSortBy('default');
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setFilterBlock('Semua');
    setFilterVariety('Semua');
    setFilterQuality('Semua');
    setFilterStatus('Semua');
    setFilterRole('Semua');
    setSortBy('default');
  };

  // Filtered lists: Panen SCM
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

  // Filtered lists: Lahan SCM
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

  // Filtered lists: Anggota Komunitas SCM
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
        mLocation.includes(sQuery) ||
        mRole.includes(sQuery) ||
        mSorghum.includes(sQuery)
      );

      return matchBlock && matchVariety && matchRole && matchSearch;
    });
  }, [safeMembers, filterBlock, filterVariety, filterRole, searchQuery]);

  // Filtered lists: Produksi SCM
  const filteredProduction = useMemo(() => {
    const sQuery = (searchQuery || '').trim().toLowerCase();
    const fBlock = (filterBlock || 'Semua').toLowerCase();
    const fVariety = (filterVariety || 'Semua').toLowerCase();

    const mapped = safeHarvestRecords.map((rec, idx) => {
      const inputKg = Number(rec?.weightKg) || 0;
      const outputKg = Math.round(inputKg * 0.775);
      const statuses = [
        { label: 'Terdistribusi', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
        { label: 'Stok Gudang', color: 'bg-amber-50 text-amber-800 border-amber-200' },
        { label: 'Dalam Proses', color: 'bg-blue-50 text-blue-800 border-blue-200' },
      ];
      const statusObj = statuses[idx % statuses.length] || statuses[0];
      const batchCode = `PRD-2026-${String(idx + 1).padStart(3, '0')}`;
      return { rec, idx, inputKg, outputKg, statusObj, batchCode };
    });

    let result = mapped.filter(item => {
      const bName = (item.rec?.blockName || '').toLowerCase();
      const cVariety = (item.rec?.cropVariety || '').toLowerCase();
      const bCode = (item.batchCode || '').toLowerCase();
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

      const matchSearch = sQuery === '' || (
        bCode.includes(sQuery) ||
        bName.includes(sQuery) ||
        cVariety.includes(sQuery) ||
        rDate.includes(sQuery) ||
        sLabel.includes(sQuery)
      );

      return matchBlock && matchVariety && matchStatus && matchSearch;
    });

    if (sortBy === 'output_desc') {
      result = [...result].sort((a, b) => (b.outputKg || 0) - (a.outputKg || 0));
    } else if (sortBy === 'output_asc') {
      result = [...result].sort((a, b) => (a.outputKg || 0) - (b.outputKg || 0));
    }

    return result;
  }, [safeHarvestRecords, filterBlock, filterVariety, filterStatus, searchQuery, sortBy]);

  const activeFilterCount = (
    (filterBlock !== 'Semua' ? 1 : 0) +
    (filterVariety !== 'Semua' ? 1 : 0) +
    (filterQuality !== 'Semua' ? 1 : 0) +
    (filterStatus !== 'Semua' ? 1 : 0) +
    (filterRole !== 'Semua' ? 1 : 0) +
    (sortBy !== 'default' ? 1 : 0)
  );

  const hasActiveFilter = searchQuery.trim() !== '' || activeFilterCount > 0;

  // Responsive SCM Filter Toolbar
  const renderScmFilterToolbar = () => {
    return (
      <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#E6E1D5] sm:border-2 shadow-xs space-y-2.5">
        {/* Row 1: Search bar + Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7A7062] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari blok, varietas, petani..."
              className="w-full pl-8.5 pr-8 py-2 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] placeholder:text-[#A19D94] focus:outline-none focus:border-[#2C4219] focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFilterOpen(prev => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 border ${
              isFilterOpen || activeFilterCount > 0
                ? 'bg-[#2C4219] text-white border-[#2C4219] shadow-xs'
                : 'bg-[#FAF6EE] text-[#433A30] border-[#E6E1D5] hover:bg-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#A8B774] text-[#2C4219] text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Dropdowns (Collapsible on mobile, always visible on sm+ screens or when expanded) */}
        <div className={`${isFilterOpen ? 'grid' : 'hidden sm:grid'} grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#E6E1D5]/60 animate-in fade-in duration-200`}>
          {/* Filter 1: Blok Lahan SCM */}
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">
              Blok Lahan SCM
            </label>
            <select
              value={filterBlock}
              onChange={(e) => setFilterBlock(e.target.value)}
              className="w-full py-1.5 px-2 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] cursor-pointer"
            >
              {blockOptions.map(b => (
                <option key={b} value={b}>{b === 'Semua' ? 'Semua Blok' : b}</option>
              ))}
            </select>
          </div>

          {/* Filter 2: Varietas Sorgum SCM */}
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">
              Varietas SCM
            </label>
            <select
              value={filterVariety}
              onChange={(e) => setFilterVariety(e.target.value)}
              className="w-full py-1.5 px-2 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] cursor-pointer"
            >
              {varietyOptions.map(v => (
                <option key={v} value={v}>{v === 'Semua' ? 'Semua Varietas' : v}</option>
              ))}
            </select>
          </div>

          {/* Filter 3: Contextual Mutu / Status SCM */}
          {activeTab === 'panen' && (
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">
                Mutu SCM
              </label>
              <select
                value={filterQuality}
                onChange={(e) => setFilterQuality(e.target.value)}
                className="w-full py-1.5 px-2 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] cursor-pointer"
              >
                <option value="Semua">Semua Mutu</option>
                <option value="Super Premium">Super Premium</option>
                <option value="Grade A">Grade A (Standar)</option>
                <option value="Grade B">Grade B (Pakan)</option>
              </select>
            </div>
          )}

          {activeTab === 'lahan' && (
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">
                Status Lahan SCM
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full py-1.5 px-2 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="Siap Panen">Siap Panen</option>
                <option value="Generatif">Generatif (Tumbuh)</option>
                <option value="Vegetatif">Vegetatif (Awal)</option>
                <option value="Pasca Panen">Pasca Panen (Bera)</option>
              </select>
            </div>
          )}

          {activeTab === 'produksi' && (
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">
                Status Pasok SCM
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full py-1.5 px-2 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="Terdistribusi">Terdistribusi (Siap Jual)</option>
                <option value="Stok Gudang">Stok Gudang SCM</option>
                <option value="Dalam Proses">Dalam Pengolahan</option>
              </select>
            </div>
          )}

          {activeTab === 'anggota' && (
            <div className="space-y-1">
              <label className="text-[9px] sm:text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">
                Peran Komunitas
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full py-1.5 px-2 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] cursor-pointer"
              >
                <option value="Semua">Semua Peran</option>
                <option value="USER">Anggota KWT</option>
                <option value="ADMIN">Pengurus / PIC</option>
              </select>
            </div>
          )}

          {/* Filter 4: Sorting SCM */}
          <div className="space-y-1">
            <label className="text-[9px] sm:text-[10px] font-bold text-[#7A7062] uppercase tracking-wider block">
              Urutkan SCM
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-1.5 px-2 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-semibold text-[#2C4219] focus:outline-none focus:border-[#2C4219] cursor-pointer"
            >
              <option value="default">Terbaru (Default)</option>
              {activeTab === 'panen' && (
                <>
                  <option value="oldest">Terlama</option>
                  <option value="weight_desc">Hasil Terbesar (Kg)</option>
                  <option value="weight_asc">Hasil Terkecil (Kg)</option>
                </>
              )}
              {activeTab === 'lahan' && (
                <>
                  <option value="progress_desc">Progres Tertinggi (%)</option>
                  <option value="progress_asc">Progres Terendah (%)</option>
                  <option value="area_desc">Luas Terbesar (Ha)</option>
                </>
              )}
              {activeTab === 'produksi' && (
                <>
                  <option value="output_desc">Output Terbanyak</option>
                  <option value="output_asc">Output Terendah</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilter && (
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E6E1D5]/60 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold text-[#433A30]">
              <span className="text-[#7A7062]">Filter:</span>
              {filterBlock !== 'Semua' && (
                <span className="bg-[#2C4219]/10 text-[#2C4219] px-2 py-0.5 rounded-md">
                  Blok: {filterBlock}
                </span>
              )}
              {filterVariety !== 'Semua' && (
                <span className="bg-[#2C4219]/10 text-[#2C4219] px-2 py-0.5 rounded-md">
                  Varietas: {filterVariety}
                </span>
              )}
              {filterQuality !== 'Semua' && (
                <span className="bg-[#A8B774]/20 text-[#2C4219] px-2 py-0.5 rounded-md">
                  Mutu: {filterQuality}
                </span>
              )}
              {filterStatus !== 'Semua' && (
                <span className="bg-[#A8B774]/20 text-[#2C4219] px-2 py-0.5 rounded-md">
                  Status: {filterStatus}
                </span>
              )}
              {filterRole !== 'Semua' && (
                <span className="bg-[#572E4A]/10 text-[#572E4A] px-2 py-0.5 rounded-md">
                  Peran: {filterRole}
                </span>
              )}
              {sortBy !== 'default' && (
                <span className="bg-[#E6E1D5] text-[#433A30] px-2 py-0.5 rounded-md">
                  Sorted
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetFilter}
              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors shrink-0 ml-auto"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Reset SCM
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 pb-16 md:pb-12 animate-in fade-in duration-300 w-full">
      {/* Compact Responsive Greeting Header */}
      <div className="bg-gradient-to-r from-[#2C4219] to-[#607829] rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-0.5 sm:space-y-1 pr-12 sm:pr-0">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#A8B774] bg-white/10 px-2 py-0.5 rounded-full inline-block">
            Sistem Rantai Pasok (SCM) Desa
          </span>
          <h2 className="text-lg sm:text-2xl font-black leading-tight">Data Sorgum Terpadu</h2>
          <p className="text-[11px] sm:text-xs text-white/80 font-medium line-clamp-1 sm:line-clamp-none">
            Ketuk salah satu kartu metrik untuk melihat rincian datanya secara terpisah.
          </p>
        </div>
        <Sprout className="w-16 h-16 sm:w-28 sm:h-28 absolute -right-3 sm:-right-4 -bottom-3 sm:-bottom-4 text-white/10 rotate-12 pointer-events-none" />
      </div>

      {/* Menu Kategori Data (Tanpa Geser, Semua Terlihat Jelas untuk Ibu-Ibu) */}
      <div className="bg-white p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl border border-[#E6E1D5] sm:border-2 shadow-xs space-y-2">
        <div className="px-1">
          <p className="text-[11px] sm:text-xs font-bold text-[#7A7062] uppercase tracking-wider">
            Pilih Kategori Data:
          </p>
        </div>

        {/* Grid 5 Tab: Pada HP tampil 1 tombol Ringkasan lebar + 4 tombol 2x2. Pada tablet/PC tampil 5 kolom sejajar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
          {/* 1. Ringkasan */}
          <button
            type="button"
            onClick={() => handleTabChange('ringkasan')}
            className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'ringkasan'
                ? 'bg-[#2C4219] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#433A30] hover:bg-[#F3EEDB] border border-[#E6E1D5]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'ringkasan' ? 'text-white' : 'text-rose-500'}`} />
            <span>Ringkasan Utama</span>
          </button>

          {/* 2. Data Panen */}
          <button
            type="button"
            onClick={() => handleTabChange('panen')}
            className={`flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'panen'
                ? 'bg-[#2C4219] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#433A30] hover:bg-[#F3EEDB] border border-[#E6E1D5]'
            }`}
          >
            <TrendingUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'panen' ? 'text-white' : 'text-orange-600'}`} />
            <span>Data Panen</span>
          </button>

          {/* 3. Data Lahan */}
          <button
            type="button"
            onClick={() => handleTabChange('lahan')}
            className={`flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'lahan'
                ? 'bg-[#2C4219] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#433A30] hover:bg-[#F3EEDB] border border-[#E6E1D5]'
            }`}
          >
            <Sprout className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'lahan' ? 'text-white' : 'text-emerald-700'}`} />
            <span>Data Lahan</span>
          </button>

          {/* 4. Komunitas */}
          <button
            type="button"
            onClick={() => handleTabChange('anggota')}
            className={`flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'anggota'
                ? 'bg-[#2C4219] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#433A30] hover:bg-[#F3EEDB] border border-[#E6E1D5]'
            }`}
          >
            <Users className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'anggota' ? 'text-white' : 'text-[#572E4A]'}`} />
            <span>Komunitas</span>
          </button>

          {/* 5. Produksi */}
          <button
            type="button"
            onClick={() => handleTabChange('produksi')}
            className={`flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'produksi'
                ? 'bg-[#2C4219] text-white shadow-xs'
                : 'bg-[#FAF6EE] text-[#433A30] hover:bg-[#F3EEDB] border border-[#E6E1D5]'
            }`}
          >
            <Package className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'produksi' ? 'text-white' : 'text-[#607829]'}`} />
            <span>Produksi</span>
          </button>
        </div>
      </div>

      <div className="mt-1 sm:mt-2 transition-all duration-300">
        {/* ==================== TAB: RINGKASAN (4 KARTU METRIK INTERAKTIF) ==================== */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-title font-bold text-xs sm:text-sm text-[#2C4219]">Pilih Kartu untuk Melihat Data:</h3>
              <span className="text-[10px] sm:text-[11px] text-[#7A7062]">Ketuk salah satu kartu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
              {/* CARD 1: TOTAL PANEN -> KLIK KE TAB PANEN */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleTabChange('panen')}
                className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6E1D5] sm:border-2 hover:border-[#D97706] shadow-xs flex flex-col justify-between space-y-2.5 sm:space-y-3 cursor-pointer group transition-all hover:scale-[1.01] active:scale-95"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                  </div>
                  <span className="text-[10px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    Lihat Data <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#7A7062] uppercase tracking-wide">Total Hasil Panen (SCM)</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#D97706] mt-0.5">
                    {totalPanenKg.toLocaleString('id-ID')} <span className="text-xs sm:text-sm font-bold">Kg</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#7A7062] mt-0.5">Riwayat penimbangan panen &amp; grade mutu sorgum</p>
                </div>
              </div>

              {/* CARD 2: TOTAL LUAS LAHAN -> KLIK KE TAB LAHAN */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleTabChange('lahan')}
                className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6E1D5] sm:border-2 hover:border-[#2C4219] shadow-xs flex flex-col justify-between space-y-2.5 sm:space-y-3 cursor-pointer group transition-all hover:scale-[1.01] active:scale-95"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    Lihat Data <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#7A7062] uppercase tracking-wide">Total Luas Lahan (SCM)</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#2C4219] mt-0.5">
                    {totalAreaHa}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#7A7062] mt-0.5">{landPlots.length} blok lahan aktif, varietas &amp; progres panen</p>
                </div>
              </div>

              {/* CARD 3: ANGGOTA KOMUNITAS -> KLIK KE TAB ANGGOTA */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleTabChange('anggota')}
                className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6E1D5] sm:border-2 hover:border-[#572E4A] shadow-xs flex flex-col justify-between space-y-2.5 sm:space-y-3 cursor-pointer group transition-all hover:scale-[1.01] active:scale-95"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#572E4A]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#572E4A] bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    Lihat Data <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#7A7062] uppercase tracking-wide">Anggota Komunitas SCM</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#572E4A] mt-0.5">
                    {members.length} <span className="text-xs sm:text-sm font-bold">Ibu Tani</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#7A7062] mt-0.5">Daftar petani binaan &amp; pengelola blok tanaman</p>
                </div>
              </div>

              {/* CARD 4: TOTAL PRODUKSI TEPUNG -> KLIK KE TAB PRODUKSI */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleTabChange('produksi')}
                className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6E1D5] sm:border-2 hover:border-[#607829] shadow-xs flex flex-col justify-between space-y-2.5 sm:space-y-3 cursor-pointer group transition-all hover:scale-[1.01] active:scale-95"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F4F8EC] rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#607829]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#607829] bg-[#F4F8EC] border border-[#D5E5B8] px-2 py-0.5 rounded-full flex items-center gap-1">
                    Lihat Data <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
                <div>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#7A7062] uppercase tracking-wide">Produksi Tepung SCM</p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#2C4219] mt-0.5">
                    {totalTepungSorgumKg.toLocaleString('id-ID')} <span className="text-xs sm:text-sm font-bold">Kg</span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-[#7A7062] mt-0.5">Rantai pasok pengolahan tepung siap distribusi</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: DATA PANEN SCM ==================== */}
        {activeTab === 'panen' && (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="font-black text-sm sm:text-lg text-[#2C4219] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#D97706]" />
                  Data Hasil Panen (SCM)
                </h3>
                <p className="text-[10px] sm:text-xs text-[#7A7062]">
                  Menampilkan {filteredHarvests.length} dari {harvestRecords.length} catatan panen
                </p>
              </div>
            </div>

            {/* SCM Filters */}
            {renderScmFilterToolbar()}

            {/* List Panen */}
            <div className="space-y-2.5 sm:space-y-3">
              {filteredHarvests.length > 0 ? filteredHarvests.map(record => (
                <div key={record.id} className="bg-[#FAF6EE] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6E1D5] sm:border-2 relative overflow-hidden shadow-2xs hover:border-[#D97706] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-bold text-[#7A7062]">{record.date}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black ${
                      record.quality === 'Super Premium' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                        : 'bg-[#A8B774]/20 text-[#2C4219] border border-[#A8B774]/30'
                    }`}>
                      {record.quality}
                    </span>
                  </div>
                  
                  <h4 className="font-black text-base sm:text-xl text-[#2C4219] mt-1">{record.blockName}</h4>
                  
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] sm:text-xs text-[#433A30] font-bold bg-white px-2 py-0.5 rounded-md border border-[#E6E1D5]">
                      🌾 Varietas: {record.cropVariety}
                    </span>
                  </div>
                  
                  <div className="my-2.5 sm:my-3 py-2 sm:py-3 border-y border-[#E6E1D5]/80 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase text-[#7A7062]">Hasil Timbangan</p>
                      <p className="text-xl sm:text-2xl font-black text-[#D97706]">
                        {record.weightKg.toLocaleString('id-ID')} <span className="text-xs sm:text-sm">Kg</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase text-[#7A7062]">PIC Lapangan</p>
                      <p className="text-xs sm:text-sm font-bold text-[#433A30] truncate max-w-[140px]">
                        {record.recordedBy || 'Admin Lapangan'}
                      </p>
                    </div>
                  </div>
                  
                  {record.notes && (
                    <p className="text-[10px] sm:text-[11px] text-[#7A7062] italic truncate">
                      "{record.notes}"
                    </p>
                  )}
                </div>
              )) : (
                <div className="text-center py-8 sm:py-10 bg-white rounded-2xl sm:rounded-3xl border border-[#E6E1D5] space-y-2">
                  <p className="font-bold text-xs sm:text-sm text-[#433A30]">Tidak ada riwayat panen yang cocok dengan filter SCM.</p>
                  <button onClick={handleResetFilter} className="px-3 py-1.5 bg-[#2C4219] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Reset Filter SCM
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: DATA LAHAN SCM ==================== */}
        {activeTab === 'lahan' && (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="font-black text-sm sm:text-lg text-[#2C4219] flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
                  Data Lahan Desa (SCM)
                </h3>
                <p className="text-[10px] sm:text-xs text-[#7A7062]">
                  Menampilkan {filteredPlots.length} dari {landPlots.length} blok lahan
                </p>
              </div>
            </div>

            {/* SCM Filters */}
            {renderScmFilterToolbar()}

            {/* List Lahan */}
            <div className="space-y-2.5 sm:space-y-3">
              {filteredPlots.length > 0 ? filteredPlots.map(plot => (
                <div key={plot.id} className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6E1D5] sm:border-2 shadow-2xs relative overflow-hidden group hover:border-[#2C4219] transition-colors">
                  <div className="flex justify-between items-start gap-2 mb-2 sm:mb-3">
                    <div className="min-w-0">
                      <h4 className="font-black text-base sm:text-lg text-[#2C4219] truncate">{plot.blockName}</h4>
                      <p className="text-[#433A30] text-[10px] sm:text-xs font-bold mt-0.5 bg-[#FAF6EE] px-2 py-0.5 rounded-md inline-block border border-[#E6E1D5]">
                        PIC: {plot.leaderName}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold shrink-0 ${
                      plot.status === 'Siap Panen' ? 'bg-[#A8B774] text-[#2C4219]' :
                      plot.status === 'Generatif' ? 'bg-amber-100 text-amber-800' :
                      plot.status === 'Pasca Panen' ? 'bg-purple-100 text-purple-800' :
                      'bg-[#FAF6EE] text-[#433A30] border border-[#E6E1D5]'
                    }`}>
                      {plot.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-xs text-[#433A30] mb-2 sm:mb-3">
                    <span className="bg-[#FAF6EE] px-2 py-0.5 rounded-md border border-[#E6E1D5] text-[10px] sm:text-xs font-bold">
                      🌾 {plot.cropVariety}
                    </span>
                    <span className="bg-[#FAF6EE] px-2 py-0.5 rounded-md border border-[#E6E1D5] text-[10px] sm:text-xs font-bold">
                      📍 {plot.areaSize}
                    </span>
                    {plot.estimatedYieldKg ? (
                      <span className="text-[10px] sm:text-xs text-[#607829] font-bold">
                        Est. {plot.estimatedYieldKg.toLocaleString('id-ID')} Kg
                      </span>
                    ) : null}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] sm:text-[11px] font-bold text-[#433A30] uppercase">
                      <span>Progres Pertumbuhan</span>
                      <span className="text-[#607829]">{plot.growthProgress}%</span>
                    </div>
                    <div className="w-full bg-[#FAF6EE] rounded-full h-2.5 sm:h-3 overflow-hidden border border-[#E6E1D5]">
                      <div 
                        className="bg-gradient-to-r from-[#8CA352] to-[#607829] h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${plot.growthProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs text-[#433A30] pt-2.5 mt-2.5 border-t border-[#E6E1D5]">
                    <div>
                      <span className="text-[#7A7062]">Tgl Tanam:</span> <b>{plot.plantingDate}</b>
                    </div>
                    <div>
                      <span className="text-[#7A7062]">Est. Panen:</span> <b>{plot.expectedHarvestDate}</b>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 sm:py-10 bg-white rounded-2xl sm:rounded-3xl border border-[#E6E1D5] space-y-2">
                  <p className="font-bold text-xs sm:text-sm text-[#433A30]">Tidak ada data lahan yang sesuai filter SCM.</p>
                  <button onClick={handleResetFilter} className="px-3 py-1.5 bg-[#2C4219] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Reset Filter SCM
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: DATA PRODUKSI SCM ==================== */}
        {activeTab === 'produksi' && (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="font-black text-sm sm:text-lg text-[#2C4219] flex items-center gap-1.5">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#607829]" />
                  Data Produksi &amp; Rantai Pasok (SCM)
                </h3>
                <p className="text-[10px] sm:text-xs text-[#7A7062]">
                  Menampilkan {filteredProduction.length} batch pengolahan tepung
                </p>
              </div>
            </div>

            {/* SCM Filters */}
            {renderScmFilterToolbar()}

            {/* List Produksi */}
            <div className="space-y-2.5 sm:space-y-3">
              {filteredProduction.length > 0 ? filteredProduction.map((item, idx) => (
                <div key={idx} className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#E6E1D5] sm:border-2 shadow-2xs hover:border-[#607829] transition-colors">
                  <div className="flex justify-between items-start mb-2.5 pb-2.5 border-b border-[#E6E1D5]">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-bold font-mono bg-[#2C4219]/10 text-[#2C4219] px-2 py-0.5 rounded-md">
                        {item.batchCode}
                      </span>
                      <h4 className="font-black text-base sm:text-lg text-[#2C4219] mt-0.5">{item.rec.blockName}</h4>
                      <p className="text-[10px] sm:text-xs text-[#7A7062]">Varietas: <b>{item.rec.cropVariety}</b></p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black border inline-block ${item.statusObj.color}`}>
                        {item.statusObj.label}
                      </span>
                      <p className="text-[10px] sm:text-[11px] font-bold text-[#7A7062] mt-1">{item.rec.date}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#FAF6EE] rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 flex items-center justify-between border border-[#E6E1D5]">
                    <div className="text-center flex-1">
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase text-[#7A7062] mb-0.5">Input Biji</p>
                      <p className="font-black text-[#D97706] text-lg sm:text-xl">{item.inputKg} <span className="text-[10px] sm:text-xs">kg</span></p>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center shadow-2xs shrink-0 border border-[#E6E1D5]">
                      <ChevronRight className="w-4 h-4 text-[#2C4219]" />
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-[9px] sm:text-[10px] font-bold uppercase text-[#7A7062] mb-0.5">Output Tepung</p>
                      <p className="font-black text-[#2C4219] text-xl sm:text-2xl">{item.outputKg} <span className="text-[10px] sm:text-xs">kg</span></p>
                    </div>
                  </div>
                  
                  <div className="mt-2.5 flex items-center justify-between text-[10px] sm:text-xs text-[#433A30] bg-[#F4F8EC] p-2 sm:p-2.5 rounded-xl border border-[#A8B774]/30">
                    <p className="font-bold text-[#2C4219]">Rendemen: 77.5%</p>
                    <span className="font-bold text-[#607829]">Tepung Bebas Gluten ✨</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 sm:py-10 bg-white rounded-2xl sm:rounded-3xl border border-[#E6E1D5] space-y-2">
                  <p className="font-bold text-xs sm:text-sm text-[#433A30]">Tidak ada data produksi yang cocok dengan filter SCM.</p>
                  <button onClick={handleResetFilter} className="px-3 py-1.5 bg-[#2C4219] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Reset Filter SCM
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: ANGGOTA KOMUNITAS SCM ==================== */}
        {activeTab === 'anggota' && (
          <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="font-black text-sm sm:text-lg text-[#2C4219] flex items-center gap-1.5">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#572E4A]" />
                  Anggota Komunitas Tani (SCM)
                </h3>
                <p className="text-[10px] sm:text-xs text-[#7A7062]">
                  Menampilkan {filteredMembers.length} dari {members.length} anggota petani
                </p>
              </div>
            </div>

            {/* SCM Filters */}
            {renderScmFilterToolbar()}

            {/* List Anggota */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E6E1D5] sm:border-2 shadow-2xs overflow-hidden divide-y divide-[#E6E1D5]">
              {filteredMembers.length > 0 ? filteredMembers.map((member, idx) => (
                <div key={idx} className="p-3 sm:p-4 flex items-center gap-3 hover:bg-[#FAF6EE] transition-colors">
                  <img
                    src={getAvatarUrl(member.avatar, member.name)}
                    alt={member.name}
                    onError={(e) => handleAvatarError(e, member.name)}
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-full object-cover border-2 border-[#A8B774] shadow-2xs shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-xs sm:text-base text-[#2C4219] truncate">{member.name}</h4>
                    <p className="text-[10px] sm:text-xs font-medium text-[#433A30] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0 text-[#7A7062]" />
                      <span className="truncate">{member.lahanLocation || 'Belum ditugaskan blok'}</span>
                    </p>
                    {member.sorghumType && (
                      <p className="text-[10px] sm:text-[11px] font-bold text-[#607829] mt-0.5 truncate">
                        🌾 Varietas: {member.sorghumType}
                      </p>
                    )}
                  </div>
                  <div className="bg-[#F4F8EC] border border-[#A8B774]/30 px-2.5 py-1 rounded-xl text-center shadow-2xs shrink-0">
                    <p className="text-[9px] font-bold text-[#607829] uppercase">Peran</p>
                    <p className="text-[10px] sm:text-xs font-black text-[#2C4219]">
                      {member.role === 'ADMIN' ? 'PIC / Pengurus' : 'Anggota KWT'}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 sm:py-10 space-y-2">
                  <p className="font-bold text-xs sm:text-sm text-[#433A30]">Tidak ada anggota yang cocok dengan filter SCM.</p>
                  <button onClick={handleResetFilter} className="px-3 py-1.5 bg-[#2C4219] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Reset Filter SCM
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
