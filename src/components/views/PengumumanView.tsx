import React, { useState } from 'react';
import { Announcement } from '../../types';
import {
  Search,
  ChevronRight,
  Megaphone,
  Wheat,
  Users,
} from 'lucide-react';

interface PengumumanViewProps {
  announcements: Announcement[];
  selectedAnnouncement: Announcement | null;
  onSelectAnnouncement: (announcement: Announcement) => void;
  searchQuery?: string;
}

const categoryIcon = (cat: string) => {
  if (cat === 'PENTING') return <Megaphone className="w-3.5 h-3.5" />;
  if (cat === 'HASIL PANEN') return <Wheat className="w-3.5 h-3.5" />;
  if (cat === 'INFORMASI ANGGOTA') return <Users className="w-3.5 h-3.5" />;
  return <Megaphone className="w-3.5 h-3.5" />;
};

export const PengumumanView: React.FC<PengumumanViewProps> = ({
  announcements,
  onSelectAnnouncement,
  searchQuery = ''
}) => {
  const [localSearch, setLocalSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'Semua' | 'PENTING' | 'HASIL PANEN' | 'INFORMASI ANGGOTA'>('Semua');

  const activeSearch = localSearch || searchQuery;
  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesTab = activeTab === 'Semua' || ann.category === activeTab;
    const matchesSearch =
      ann.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
      ann.summary.toLowerCase().includes(activeSearch.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-16">

      {/* UNIFIED TOP FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* CATEGORY FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['Semua', 'PENTING', 'HASIL PANEN', 'INFORMASI ANGGOTA'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                ${activeTab === tab
                  ? 'bg-[#2C4219] text-white shadow-sm'
                  : 'bg-white text-[#433A30] border border-[#E6E1D5] hover:border-[#A8B774]'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full sm:w-80 md:w-[380px] shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#433A30]/50" />
          <input
            type="text"
            placeholder="Cari pengumuman..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-white border border-[#E6E1D5] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#433A30] placeholder-[#433A30]/40 focus:outline-none focus:border-[#2C4219] shadow-2xs"
          />
        </div>
      </div>

      {/* COUNT */}
      <p className="text-xs text-[#433A30]/50 font-medium">
        {filteredAnnouncements.length} pengumuman
      </p>

      {/* CARD LIST */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E6E1D5] p-12 text-center text-[#433A30]/50">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Tidak ada pengumuman ditemukan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnnouncements.map((ann) => {
            const isUrgent = ann.category === 'MENDESAK';

            return (
              <button
                key={ann.id}
                onClick={() => onSelectAnnouncement(ann)}
                className={`
                  w-full text-left bg-white rounded-3xl border transition-all overflow-hidden group
                  ${isUrgent ? 'border-red-300 ring-1 ring-red-200' : 'border-[#E6E1D5]'}
                  shadow-xs hover:shadow-md hover:border-[#A8B774] hover:-translate-y-0.5
                `}
              >
                <div className="p-5">
                  {/* Badge & Time */}
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shrink-0"
                      style={{ backgroundColor: ann.badgeColor }}
                    >
                      {categoryIcon(ann.category)}
                      {ann.category}
                    </span>
                    <span className="text-[11px] text-[#433A30]/50 font-medium shrink-0">
                      {ann.timeAgo}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-title font-extrabold text-base sm:text-lg text-[#2C4219] leading-snug mt-3 mb-2 group-hover:text-[#3d5a23] transition-colors">
                    {ann.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-sm text-[#433A30]/80 leading-relaxed line-clamp-2">
                    {ann.summary}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E6E1D5]/60">
                    <span className="text-xs text-[#433A30]/50">
                      Oleh: <span className="font-semibold text-[#433A30]/70">{ann.postedBy}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-[#2C4219]/50 group-hover:text-[#2C4219] transition-colors">
                      Selengkapnya
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
