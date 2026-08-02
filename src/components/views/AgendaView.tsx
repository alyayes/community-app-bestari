import React, { useState } from 'react';
import { AgendaEvent } from '../../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  User, 
  Plus, 
  Share2, 
  Bell, 
  Check, 
  Search, 
  List, 
  Grid,
  FileText,
  Users,
  Phone,
  CheckCircle2,
  Award
} from 'lucide-react';

interface AgendaViewProps {
  events: AgendaEvent[];
  onAddEvent: (event: AgendaEvent) => void;
  searchQuery?: string;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ events, onAddEvent, searchQuery = '' }) => {
  // Primary selected event (defaulting to Workshop Pengolahan Tepung Sorgum or first event)
  const defaultSelected = events.find(e => e.id === 'ev_10') || events[0];
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent>(defaultSelected);
  
  // View mode switcher: 'kalender' | 'daftar'
  const [viewMode, setViewMode] = useState<'kalender' | 'daftar'>('kalender');
  const [calendarGranularity, setCalendarGranularity] = useState<'hari' | 'minggu' | 'bulan'>('bulan');
  const [remindedEvents, setRemindedEvents] = useState<Record<string, boolean>>({});
  const [registeredEvents, setRegisteredEvents] = useState<Record<string, boolean>>({
    ev_10: true
  });

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // Form State for creating a new agenda event
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('2026-10-15');
  const [newTime, setNewTime] = useState('09:00 - 12:00 WIB');
  const [newLocation, setNewLocation] = useState('Balai Desa Sukamaju');
  const [newCategory, setNewCategory] = useState('WORKSHOP KREATIF');
  const [newDesc, setNewDesc] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('Tim KWT Sorgum');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categoriesList = ['Semua', 'WORKSHOP KREATIF', 'WORKSHOP', 'PANEN BERSAMA', 'PELATIHAN UMKM', 'RAPAT RUTIN'];

  // Filtered list based on search term and category
  const activeSearch = searchTerm || searchQuery;
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
                          (e.location && e.location.toLowerCase().includes(activeSearch.toLowerCase())) ||
                          (e.organizer && e.organizer.toLowerCase().includes(activeSearch.toLowerCase()));
    const matchesCat = selectedCategory === 'Semua' || e.category?.toUpperCase() === selectedCategory.toUpperCase();
    return matchesSearch && matchesCat;
  });

  const toggleReminder = (eventId: string) => {
    setRemindedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const toggleRegistration = (eventId: string) => {
    setRegisteredEvents(prev => {
      const isReg = !prev[eventId];
      if (isReg) {
        alert(`Selamat! Pendaftaran Anda untuk kegiatan "${selectedEvent.title}" telah berhasil disimpan.`);
      } else {
        alert(`Pendaftaran kegiatan "${selectedEvent.title}" telah dibatalkan.`);
      }
      return {
        ...prev,
        [eventId]: isReg
      };
    });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const dateObj = new Date(newDate);
    const dayNumber = dateObj.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
    const monthAbbr = monthNames[dateObj.getMonth()] || 'OKT';

    const newEv: AgendaEvent = {
      id: `ev_${Date.now()}`,
      title: newTitle,
      date: newDate,
      dayNumber,
      monthAbbr,
      time: newTime,
      location: newLocation,
      status: 'Pendaftaran Dibuka',
      statusType: 'success',
      category: newCategory,
      description: newDesc || 'Kegiatan kelompok tani KWT Sorgum.',
      organizer: newOrganizer || 'Pengurus KWT Sorgum'
    };

    onAddEvent(newEv);
    setSelectedEvent(newEv);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  // Helper mapping for calendar days (October 2026 starts on Thursday, Oct 1)
  // Grid layout: 7 columns (MIN, SEN, SEL, RAB, KAM, JUM, SAB)
  // Day 1 of Oct 2026 is Thursday (Index 4: MIN=0, SEN=1, SEL=2, RAB=3, KAM=4, JUM=5, SAB=6)
  const daysInMonth = 31;
  const startDayOffset = 4; // 4 empty cells before Oct 1

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* UNIFIED TOP CONTROL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* View Toggle Buttons */}
        <div className="bg-[#FAF6EE] p-1 rounded-2xl border border-[#E6E1D5] flex items-center gap-1 shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('kalender')}
            className={`
              px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all
              ${viewMode === 'kalender' 
                ? 'bg-white text-[#2C4219] shadow-2xs' 
                : 'text-[#433A30]/70 hover:text-[#2C4219]'}
            `}
          >
            <Grid className="w-4 h-4 text-[#2C4219]" />
            <span>Kalender</span>
          </button>
          <button
            onClick={() => setViewMode('daftar')}
            className={`
              px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all
              ${viewMode === 'daftar' 
                ? 'bg-white text-[#2C4219] shadow-2xs' 
                : 'text-[#433A30]/70 hover:text-[#2C4219]'}
            `}
          >
            <List className="w-4 h-4 text-[#2C4219]" />
            <span>Daftar</span>
          </button>
        </div>

        {/* Right Section: Search Bar & Add Agenda Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80 md:w-[380px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#433A30]/50" />
            <input
              type="text"
              placeholder="Cari agenda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#E6E1D5] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#433A30] placeholder-[#433A30]/50 focus:outline-none focus:border-[#2C4219] shadow-2xs"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
            title="Tambah Agenda Baru"
          >
            <Plus className="w-4 h-4 text-[#A8B774]" />
            <span>Tambah Agenda</span>
          </button>
        </div>
      </div>

      {/* KALENDER VIEW MODE (MATCHING REFERENCE IMAGE) */}
      {viewMode === 'kalender' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: CALENDAR GRID WIDGET (8 COLS ON DESKTOP) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-5">
            {/* Calendar Top Navigation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="font-title font-bold text-lg sm:text-xl text-[#2C4219]">
                  Oktober 2026
                </h2>
                <div className="flex items-center gap-1">
                  <button className="p-1 rounded-lg border border-[#E6E1D5] hover:bg-[#FAF6EE] text-[#433A30]/70 hover:text-[#2C4219] transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1 rounded-lg border border-[#E6E1D5] hover:bg-[#FAF6EE] text-[#433A30]/70 hover:text-[#2C4219] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Granularity Switcher Buttons (Hari, Minggu, Bulan) */}
              <div className="flex items-center gap-1.5 text-xs font-semibold bg-[#FAF6EE] p-1 rounded-xl border border-[#E6E1D5] self-start sm:self-auto">
                <button 
                  onClick={() => setCalendarGranularity('hari')}
                  className={`px-3 py-1 rounded-lg transition-all ${calendarGranularity === 'hari' ? 'bg-[#A8B774] text-[#2C4219] font-bold shadow-2xs' : 'text-[#433A30]/70 hover:text-[#2C4219]'}`}
                >
                  Hari
                </button>
                <button 
                  onClick={() => setCalendarGranularity('minggu')}
                  className={`px-3 py-1 rounded-lg transition-all ${calendarGranularity === 'minggu' ? 'bg-[#A8B774] text-[#2C4219] font-bold shadow-2xs' : 'text-[#433A30]/70 hover:text-[#2C4219]'}`}
                >
                  Minggu
                </button>
                <button 
                  onClick={() => setCalendarGranularity('bulan')}
                  className={`px-3 py-1 rounded-lg transition-all ${calendarGranularity === 'bulan' ? 'bg-[#A8B774] text-[#2C4219] font-bold shadow-2xs' : 'text-[#433A30]/70 hover:text-[#2C4219]'}`}
                >
                  Bulan
                </button>
              </div>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-bold text-[#433A30]/70 uppercase tracking-wider border-b border-[#E6E1D5] pb-2.5">
              <span>MIN</span>
              <span>SEN</span>
              <span>SEL</span>
              <span>RAB</span>
              <span>KAM</span>
              <span>JUM</span>
              <span>SAB</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center min-h-[360px]">
              {/* Offset Empty Cells for October 2026 (Starts Thursday = 4 offset cells) */}
              {[...Array(startDayOffset)].map((_, i) => (
                <div key={`offset_${i}`} className="min-h-[64px] rounded-2xl bg-[#FAF6EE]/30 border border-transparent" />
              ))}

              {/* Day Cells 1 to 31 */}
              {[...Array(daysInMonth)].map((_, idx) => {
                const dayNum = idx + 1;
                const formattedDay = dayNum.toString().padStart(2, '0');

                // Find events matching this day number in October 2026
                const dayEvents = events.filter(e => e.dayNumber === formattedDay && (e.monthAbbr === 'OKT' || e.date.includes('-10-')));
                const isSelected = selectedEvent?.dayNumber === formattedDay;
                const isHighlightDay = dayNum === 10; // Oct 10 orange badge highlight per screenshot

                return (
                  <div
                    key={`day_${dayNum}`}
                    onClick={() => {
                      if (dayEvents.length > 0) {
                        setSelectedEvent(dayEvents[0]);
                      }
                    }}
                    className={`
                      min-h-[70px] sm:min-h-[76px] p-1.5 rounded-2xl border transition-all flex flex-col justify-between items-start text-left cursor-pointer group
                      ${isSelected 
                        ? 'border-[#2C4219] bg-[#FAF6EE] shadow-2xs ring-2 ring-[#2C4219]/10' 
                        : dayEvents.length > 0 
                          ? 'border-[#E6E1D5] bg-white hover:border-[#2C4219]/40 hover:bg-[#FAF6EE]/50' 
                          : 'border-[#E6E1D5]/60 bg-white hover:bg-[#FAF6EE]/30'}
                    `}
                  >
                    {/* Day Number Display */}
                    <div className="w-full flex items-center justify-between">
                      {isHighlightDay ? (
                        <span className="w-6 h-6 rounded-full bg-[#D97706] text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
                          {dayNum}
                        </span>
                      ) : (
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#2C4219]' : 'text-[#433A30]'}`}>
                          {dayNum}
                        </span>
                      )}
                    </div>

                    {/* Render Event Badges inside calendar cell */}
                    <div className="w-full space-y-1 mt-1">
                      {dayEvents.map(ev => (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`
                            px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold truncate transition-transform group-hover:scale-98
                            ${ev.category === 'PELATIHAN UMKM' 
                              ? 'bg-[#A8B774]/30 text-[#2C4219] border border-[#A8B774]' 
                              : 'bg-[#2C4219] text-white'}
                          `}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: EVENT DETAILS CARD & UPCOMING EVENTS LIST (4 COLS ON DESKTOP) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* TOP CARD: SELECTED EVENT DETAIL CARD */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-5">
              {/* Category Pill Tag & Status */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-block bg-[#A8B774] text-[#2C4219] text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-2xs">
                  {selectedEvent.category}
                </span>
                <span className={`
                  px-2.5 py-0.5 rounded-full text-[10px] font-bold border
                  ${selectedEvent.statusType === 'warning' ? 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/30' : 'bg-[#2C4219]/10 text-[#2C4219] border-[#2C4219]/20'}
                `}>
                  {selectedEvent.status}
                </span>
              </div>

              {/* Event Title */}
              <h2 className="font-title font-bold text-lg sm:text-xl text-[#2C4219] leading-snug">
                {selectedEvent.title}
              </h2>

              {/* Event Metadata List */}
              <div className="space-y-2.5 text-xs text-[#433A30]">
                {/* Time & Date */}
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#2C4219] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#2C4219]">
                      {selectedEvent.dayNumber === '10' ? 'Sabtu, 10 Okt 2026' : `${selectedEvent.dayNumber} ${selectedEvent.monthAbbr} 2026`}
                    </span>
                    <span className="block text-[#433A30]/80">{selectedEvent.time}</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#2C4219] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#2C4219]">Lokasi Pelaksanaan:</span>
                    <span className="block text-[#433A30]/80">{selectedEvent.location}</span>
                  </div>
                </div>

                {/* Organizer */}
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-[#2C4219] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#2C4219]">Penyelenggara / Instruktur:</span>
                    <span className="block text-[#433A30]/80">{selectedEvent.organizer}</span>
                  </div>
                </div>


              </div>

              {/* Event Description */}
              <p className="text-xs text-[#433A30]/90 leading-relaxed pt-2 border-t border-[#E6E1D5]">
                {selectedEvent.description}
              </p>



            </div>

            {/* BOTTOM CARD: KEGIATAN MENDATANG (UPCOMING EVENTS LIST) */}
            <div className="bg-[#FAF6EE]/90 p-5 rounded-3xl border border-[#E6E1D5] space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-title font-bold text-sm text-[#2C4219]">
                  Kegiatan Mendatang
                </h3>
                <button 
                  onClick={() => setViewMode('daftar')}
                  className="text-[10px] font-bold text-[#433A30]/70 hover:text-[#2C4219] uppercase tracking-wider transition-colors"
                >
                  LIHAT SEMUA
                </button>
              </div>

              {/* List of Upcoming Items */}
              <div className="space-y-2.5">
                {events.slice(0, 3).map((ev) => {
                  const isSelected = selectedEvent.id === ev.id;
                  const isUpcomingNov = ev.monthAbbr === 'NOV';
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className={`
                        p-3 rounded-2xl bg-white border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:border-[#2C4219]
                        ${isSelected ? 'border-[#2C4219] ring-1 ring-[#2C4219]/20' : 'border-[#E6E1D5]'}
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Date Badge Box */}
                        <div className={`
                          w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0
                          ${isUpcomingNov ? 'bg-[#E6E1D5]/60 text-[#433A30]' : 'bg-[#A8B774]/30 text-[#2C4219]'}
                        `}>
                          <span className="font-bold text-xs leading-none">{ev.dayNumber}</span>
                          <span className="text-[9px] font-bold leading-none mt-0.5">{ev.monthAbbr}</span>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="min-w-0">
                          <h4 className="font-title font-bold text-xs text-[#2C4219] truncate">
                            {ev.title}
                          </h4>
                          <p className="text-[11px] text-[#433A30]/70 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#433A30]/50 shrink-0" />
                            <span>{ev.location}</span>
                          </p>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#2C4219]' : 'text-[#433A30]/40'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* DAFTAR VIEW MODE (LIST VIEW WITH FULL DETAILS & FILTERING) */
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all
                  ${selectedCategory === cat
                    ? 'bg-[#2C4219] text-white shadow-2xs'
                    : 'bg-white text-[#433A30] border border-[#E6E1D5] hover:bg-[#FAF6EE]'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Agenda Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-white p-5 rounded-2xl border border-[#E6E1D5] shadow-2xs hover:border-[#2C4219] transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-[#A8B774] text-[#2C4219] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded">
                      {ev.category}
                    </span>
                    <span className="text-xs text-[#433A30]/70 font-semibold">
                      {ev.dayNumber} {ev.monthAbbr} 2026
                    </span>
                  </div>

                  <h3 className="font-title font-bold text-base text-[#2C4219]">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-[#433A30] leading-relaxed line-clamp-2">
                    {ev.description}
                  </p>

                  <div className="space-y-1 text-xs text-[#433A30]/80 pt-2 border-t border-[#E6E1D5]">
                    <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#2C4219]" /> {ev.time}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#2C4219]" /> {ev.location}</p>
                    <p className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-[#2C4219]" /> {ev.organizer}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E6E1D5]">
                  <button
                    onClick={() => {
                      setSelectedEvent(ev);
                      setShowDetailModal(true);
                    }}
                    className="text-xs font-bold text-[#2C4219] hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#2C4219]" />
                    <span>Rincian Kegiatan</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRegistration(ev.id)}
                      className={`
                        px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                        ${registeredEvents[ev.id] ? 'bg-[#A8B774] text-[#2C4219]' : 'bg-[#2C4219] text-white'}
                      `}
                    >
                      {registeredEvents[ev.id] ? 'Terdaftar' : 'Daftar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAILED ACTIVITY MODAL (RINCIAN FULL KEGIATAN) */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E6E1D5] space-y-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E6E1D5]">
              <div>
                <span className="bg-[#A8B774] text-[#2C4219] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded">
                  {selectedEvent.category}
                </span>
                <h2 className="font-title font-bold text-xl sm:text-2xl text-[#2C4219] mt-2">
                  {selectedEvent.title}
                </h2>
                <p className="text-xs text-[#433A30]/80 mt-1">
                  Penyelenggara: <strong className="text-[#2C4219]">{selectedEvent.organizer}</strong>
                </p>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-full bg-[#FAF6EE] text-[#433A30] hover:bg-[#E6E1D5] flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-[#433A30]/60">Waktu & Tanggal</span>
                <p className="font-bold text-[#2C4219] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#2C4219]" />
                  {selectedEvent.date} ({selectedEvent.time})
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-1">
                <span className="text-[10px] uppercase font-extrabold text-[#433A30]/60">Tempat Pelaksanaan</span>
                <p className="font-bold text-[#2C4219] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#2C4219]" />
                  {selectedEvent.location}
                </p>
              </div>

              {selectedEvent.targetParticipants && (
                <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-[#433A30]/60">Target Peserta</span>
                  <p className="font-bold text-[#2C4219] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#2C4219]" />
                    {selectedEvent.targetParticipants}
                  </p>
                </div>
              )}

              {selectedEvent.contactPerson && (
                <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-1">
                  <span className="text-[10px] uppercase font-extrabold text-[#433A30]/60">Kontak Person (PIC)</span>
                  <p className="font-bold text-[#2C4219] flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-[#2C4219]" />
                    {selectedEvent.contactPerson.name} ({selectedEvent.contactPerson.phone})
                  </p>
                </div>
              )}
            </div>

            {/* Deskripsi Kegiatan */}
            <div className="space-y-2">
              <h3 className="font-title font-bold text-sm text-[#2C4219]">Deskripsi Lengkap Kegiatan</h3>
              <p className="text-xs text-[#433A30] leading-relaxed bg-white p-4 rounded-2xl border border-[#E6E1D5]">
                {selectedEvent.description}
              </p>
            </div>

            {/* Susunan Acara (Rundown) */}
            {selectedEvent.rundown && selectedEvent.rundown.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2C4219]" />
                  <span>Susunan Acara (Rundown)</span>
                </h3>
                <div className="space-y-2">
                  {selectedEvent.rundown.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-[#2C4219] text-white font-bold text-[11px] shrink-0">
                        {item.time}
                      </span>
                      <span className="font-medium text-[#433A30] mt-0.5">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Persyaratan & Manfaat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Persyaratan / Perlengkapan */}
              {selectedEvent.requirements && selectedEvent.requirements.length > 0 && (
                <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#E6E1D5]">
                  <h4 className="font-title font-bold text-xs text-[#2C4219] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                    <span>Persyaratan & Alat yang Dibawa</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#433A30]/90">
                    {selectedEvent.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] shrink-0 mt-1.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fasilitas / Benefit */}
              {selectedEvent.benefits && selectedEvent.benefits.length > 0 && (
                <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#E6E1D5]">
                  <h4 className="font-title font-bold text-xs text-[#2C4219] flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#2C4219]" />
                    <span>Fasilitas & Manfaat Peserta</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#433A30]/90">
                    {selectedEvent.benefits.map((ben, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A8B774] shrink-0 mt-1.5" />
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E6E1D5]">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 rounded-xl border border-[#E6E1D5] text-xs font-semibold text-[#433A30] hover:bg-[#FAF6EE]"
              >
                Tutup Window
              </button>

              <button
                onClick={() => {
                  toggleRegistration(selectedEvent.id);
                  setShowDetailModal(false);
                }}
                className={`
                  px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95
                  ${registeredEvents[selectedEvent.id] ? 'bg-[#A8B774] text-[#2C4219]' : 'bg-[#2C4219] text-white hover:bg-[#1E2E11]'}
                `}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{registeredEvents[selectedEvent.id] ? 'Terdaftar (Batal Pendaftaran)' : 'Konfirmasi Pendaftaran Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD AGENDA MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-xl border border-[#E6E1D5] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D5]">
              <h3 className="font-title font-bold text-base text-[#2C4219]">Tambah Agenda Kegiatan Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#433A30]/70 hover:text-[#2C4219]">✕</button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#433A30] mb-1">Judul Agenda</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Workshop Pengolahan Tepung Sorgum"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#2C4219]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#433A30] mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#2C4219]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#433A30] mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#2C4219]"
                  >
                    {categoriesList.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#433A30] mb-1">Waktu</label>
                  <input
                    type="text"
                    placeholder="09:00 - 12:00 WIB"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#2C4219]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#433A30] mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#2C4219]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#433A30] mb-1">Instruktur / Penyelenggara</label>
                <input
                  type="text"
                  placeholder="Contoh: Instruktur: KWT Sari (Dian Permata)"
                  value={newOrganizer}
                  onChange={(e) => setNewOrganizer(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#2C4219]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#433A30] mb-1">Deskripsi Ringkas</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan tujuan dan deskripsi kegiatan..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E1D5] focus:outline-none focus:border-[#2C4219]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6E1D5] text-[#433A30] hover:bg-[#FAF6EE]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2C4219] text-white font-bold hover:bg-[#1E2E11]"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

