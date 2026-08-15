import React, { useState } from 'react';
import { AgendaEvent, UserProfile } from '../../types';
import { BASE_URL } from '../../api/client';
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
  Award,
  Edit2,
  Trash2,
  Mic,
  Square,
  Loader2,
  Sparkles,
  X,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface AgendaViewProps {
  events: AgendaEvent[];
  currentUser: UserProfile;
  onAddEvent: (event: AgendaEvent) => void;
  onEditEvent?: (event: AgendaEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onRegisterEvent?: (eventId: string) => void;
  onUnregisterEvent?: (eventId: string) => void;
  searchQuery?: string;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ events: rawEvents, currentUser, onAddEvent, onEditEvent, onDeleteEvent, onRegisterEvent, onUnregisterEvent, searchQuery = '' }) => {
  const events = rawEvents.filter(e => {
    const isPast = e.date && !isNaN(new Date(e.date).getTime()) && new Date(e.date).getTime() < new Date().setHours(0, 0, 0, 0);
    return e.status !== 'Selesai' && !isPast;
  });
  const defaultSelected = events.find(e => e.id === 'ev_10') || events[0];
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent>(defaultSelected);

  // Sync selected event when events list updates (e.g. registration status changes, or event date goes past)
  React.useEffect(() => {
    if (selectedEvent) {
      const updated = events.find(e => e.id === selectedEvent.id);
      if (updated) {
        // Event masih aktif, update dengan data terbaru
        setSelectedEvent(updated);
      } else {
        // Event sudah hilang dari list (tanggal lewat / Selesai), pindah ke event berikutnya
        setSelectedEvent(events.find(e => e.id === 'ev_10') || events[0] || ({} as AgendaEvent));
      }
    } else {
      setSelectedEvent(events.find(e => e.id === 'ev_10') || events[0]);
    }
  }, [events]);

  // View mode switcher: 'kalender' | 'daftar'
  const [viewMode, setViewMode] = useState<'kalender' | 'daftar'>('kalender');
  const [calendarGranularity, setCalendarGranularity] = useState<'hari' | 'minggu' | 'bulan'>('bulan');
  const [remindedEvents, setRemindedEvents] = useState<Record<string, boolean>>({});

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showDateWarning, setShowDateWarning] = useState<boolean>(false);

  // STT Recording State
  const [inputMode, setInputMode] = useState<'manual' | 'voice'>('manual');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingSTT, setIsProcessingSTT] = useState(false);
  const [sttError, setSTTError] = useState<string | null>(null);
  const [sttSuccess, setSTTSuccess] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSTTError("Browser Anda tidak mendukung fitur Asisten Suara. Gunakan Google Chrome atau Edge.");
      return;
    }

    setSTTError(null);
    setSTTSuccess(false);
    setIsRecording(true);
    setIsProcessingSTT(true);

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      setIsProcessingSTT(false);
      const text = event.results[0][0].transcript;
      if (text) {
        // Hapus tanda baca agar tidak mengganggu parser
        const cleanText = text.replace(/[,.!?\-]/g, ' ').replace(/\s+/g, ' ').trim();

        const keywords = [
          { key: 'title', match: /(?:judul)\s*/i },
          { key: 'category', match: /(?:kategori)\s*/i },
          { key: 'date', match: /(?:tanggal)\s*/i },
          { key: 'time', match: /(?:waktu|jam)\s*/i },
          { key: 'desc', match: /(?:deskripsi|isi)\s*/i }
        ];

        let foundPositions: { key: string; index: number; length: number }[] = [];
        keywords.forEach(kw => {
          const match = cleanText.match(kw.match);
          if (match && match.index !== undefined) {
            foundPositions.push({ key: kw.key, index: match.index, length: match[0].length });
          }
        });

        if (foundPositions.length === 0) {
          // No keywords found, put entire text in title
          setNewTitle(cleanText);
        } else {
          foundPositions.sort((a, b) => a.index - b.index);

          for (let i = 0; i < foundPositions.length; i++) {
            const curr = foundPositions[i];
            const next = foundPositions[i + 1];

            const start = curr.index + curr.length;
            const end = next ? next.index : cleanText.length;

            const val = cleanText.substring(start, end).trim();
            if (!val) continue;

            if (curr.key === 'title') {
              setNewTitle(val);
            } else if (curr.key === 'category') {
              const upper = val.toUpperCase();
              if (upper.includes('WORKSHOP') || upper.includes('KREATIF')) setNewCategory('WORKSHOP KREATIF');
              else if (upper.includes('PANEN') || upper.includes('BERSAMA')) setNewCategory('PANEN BERSAMA');
              else if (upper.includes('RAPAT') || upper.includes('RUTIN')) setNewCategory('RAPAT RUTIN');
              else if (upper.includes('PELATIHAN') || upper.includes('UMKM')) setNewCategory('PELATIHAN UMKM');
              else setNewCategory(val); // Fallback: put as-is
            } else if (curr.key === 'date') {
              // Fix STT numeric spacing issues for dates
              let dateVal = val.toLowerCase();
              const numMap: Record<string, string> = {
                'satu': '1', 'dua': '2', 'tiga': '3', 'empat': '4', 'lima': '5',
                'enam': '6', 'tujuh': '7', 'delapan': '8', 'sembilan': '9', 'sepuluh': '10',
                'sebelas': '11', 'belas': '1', // fallback for 'dua belas' if 'dua' is replaced first
                'dua puluh': '20', 'tiga puluh': '30', 'puluh': '0'
              };
              // Sort keys by length descending to replace longer phrases first
              Object.keys(numMap).sort((a, b) => b.length - a.length).forEach(k => {
                dateVal = dateVal.replace(new RegExp(`\\b${k}\\b`, 'g'), numMap[k]);
              });

              // Handle cases where STT outputs digit + word (e.g., "2 puluh")
              dateVal = dateVal.replace(/(\d)\s*puluh/g, '$10');
              dateVal = dateVal.replace(/(\d)\s*belas/g, '1$1');

              // Run the spacing fixes repeatedly to ensure cascading merges (e.g., "2 0 7" -> "20 7" -> "27")
              for (let i = 0; i < 2; i++) {
                dateVal = dateVal
                  .replace(/\b([123]0)\s+([1-9])\b/g, (m, p1, p2) => String(parseInt(p1) + parseInt(p2)))
                  .replace(/\b([123])\s+([0-9])\b/g, '$1$2');
              }
              
              dateVal = dateVal
                .replace(/\b(2002)\s+(\d)\b/g, '202$2')
                .replace(/\b(200|20)\s+(\d{2})\b/g, '20$2');

              const matchDate = dateVal.match(/(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|jun|jul|agu|sep|okt|nov|des)[a-z]*(?:\s+(\d{4}))?/i);
              if (matchDate) {
                const day = matchDate[1].padStart(2, '0');
                const mMap: Record<string, string> = {
                  januari: '01', jan: '01', februari: '02', feb: '02',
                  maret: '03', mar: '03', april: '04', apr: '04',
                  mei: '05', juni: '06', jun: '06', juli: '07', jul: '07',
                  agustus: '08', agu: '08', september: '09', sep: '09',
                  oktober: '10', okt: '10', november: '11', nov: '11',
                  desember: '12', des: '12'
                };
                const month = mMap[matchDate[2].toLowerCase().substring(0, 3)] ||
                  mMap[matchDate[2].toLowerCase()];
                const year = matchDate[3] || new Date().getFullYear();
                if (month) setNewDate(`${year}-${month}-${day}`);
              } else {
                // Try YYYY-MM-DD or DD/MM/YYYY
                const isoDate = dateVal.match(/(\d{4})-(\d{2})-(\d{2})/);
                const slashDate = dateVal.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
                if (isoDate) {
                  setNewDate(`${isoDate[1]}-${isoDate[2]}-${isoDate[3]}`);
                } else if (slashDate) {
                  const year = slashDate[3] || new Date().getFullYear();
                  setNewDate(`${year}-${slashDate[2].padStart(2, '0')}-${slashDate[1].padStart(2, '0')}`);
                }
              }
            } else if (curr.key === 'time') {
              setNewTime(val);
            } else if (curr.key === 'desc') {
              setNewDesc(val);
            }
          }
        }
        setSTTSuccess(true);
        setTimeout(() => setSTTSuccess(false), 3000);
      } else {
        setSTTError('Suara tidak terdeteksi. Coba lagi.');
      }
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      setIsProcessingSTT(false);
      if (event.error === 'no-speech') {
        setSTTError('Tidak ada suara terdeteksi. Silakan coba lagi.');
      } else {
        setSTTError(`Error pengenalan suara: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessingSTT(false);
    };

    try {
      recognition.start();
    } catch (e: any) {
      setIsRecording(false);
      setIsProcessingSTT(false);
      setSTTError(e.message || 'Gagal memulai mikrofon.');
    }
  };

  // Form State for creating a new agenda event
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [newTime, setNewTime] = useState('09:00 - 12:00 WIB');
  const [newLocation, setNewLocation] = useState('Balai Desa Sukamaju');
  const [newCategory, setNewCategory] = useState('WORKSHOP KREATIF');
  const [newDesc, setNewDesc] = useState('');
  const [newOrganizer, setNewOrganizer] = useState('Tim KWT Sorgum');
  const [newTargetParticipants, setNewTargetParticipants] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newBenefits, setNewBenefits] = useState('');
  const [newStatus, setNewStatus] = useState('Belum dimulai');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categoriesList = ['Semua', 'WORKSHOP KREATIF', 'WORKSHOP', 'PANEN BERSAMA', 'PELATIHAN UMKM', 'RAPAT RUTIN'];

  // Filtered list based on search term and category
  const activeSearch = searchTerm || searchQuery;
  const filteredEvents = events.filter(e => {
    // Sembunyikan agenda yang sudah selesai (lewat tanggal) dari daftar user
    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
    if (e.status === 'Selesai' || e.date < todayStr) return false;
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

  const [popupData, setPopupData] = useState<{ show: boolean, type: 'register' | 'unregister' | 'creator_error', eventName: string }>({ show: false, type: 'register', eventName: '' });

  const toggleRegistration = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (event.isRegistered) {
      if (event.creatorId && event.creatorId === currentUser?.id) {
        setPopupData({ show: true, type: 'creator_error', eventName: event.title });
        return;
      }
      if (onUnregisterEvent) onUnregisterEvent(eventId);
      setPopupData({ show: true, type: 'unregister', eventName: event.title });
    } else {
      if (onRegisterEvent) onRegisterEvent(eventId);
      setPopupData({ show: true, type: 'register', eventName: event.title });
    }
  };

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingEventId(null);
    setNewTitle('');
    setNewDate(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    setNewTime('09:00 - 12:00 WIB');
    setNewLocation('Balai Desa Sukamaju');
    setNewCategory('WORKSHOP KREATIF');
    setNewDesc('');
    setNewOrganizer(currentUser.name || 'Tim KWT Sorgum');
    setNewTargetParticipants('');
    setNewContactName('');
    setNewContactPhone('');
    setNewRequirements('');
    setNewBenefits('');
    setNewStatus('Belum dimulai');
    setShowAddModal(true);
  };

  const openEditModal = (ev: AgendaEvent) => {
    setIsEditing(true);
    setEditingEventId(ev.id);
    setNewTitle(ev.title);
    setNewDate(ev.date);
    setNewTime(ev.time);
    setNewLocation(ev.location);
    setNewCategory(ev.category || 'WORKSHOP KREATIF');
    setNewDesc(ev.description || '');
    setNewOrganizer(ev.organizer || currentUser.name || 'Tim KWT Sorgum');
    setNewTargetParticipants(ev.targetParticipants || '');
    setNewContactName(ev.contactPerson?.name || '');
    setNewContactPhone(ev.contactPerson?.phone || '');
    setNewRequirements(ev.requirements?.join(', ') || '');
    setNewBenefits(ev.benefits?.join(', ') || '');
    setNewStatus(ev.status || 'Belum dimulai');
    setShowAddModal(true);
  };

  const handleCreateOrEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (newDate) {
      const selectedDate = new Date(newDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!isNaN(selectedDate.getTime()) && selectedDate < today) {
        setShowDateWarning(true);
        return;
      }
    }

    const dateObj = new Date(newDate);
    const dayNumber = dateObj.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
    const monthAbbr = monthNames[dateObj.getMonth()] || 'OKT';

    const reqList = newRequirements.split(',').map(s => s.trim()).filter(Boolean);
    const benList = newBenefits.split(',').map(s => s.trim()).filter(Boolean);
    const contactObj = newContactName || newContactPhone ? { name: newContactName, phone: newContactPhone } : undefined;

    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
    const computedStatus = newDate < todayStr ? 'Selesai' : newStatus;
    const computedStatusType = computedStatus === 'Selesai' ? 'neutral' : (computedStatus === 'Belum dimulai' ? 'success' : 'warning');

    if (isEditing && editingEventId && onEditEvent) {
      const updatedEv: AgendaEvent = {
        ...selectedEvent,
        id: editingEventId,
        title: newTitle,
        date: newDate,
        dayNumber,
        monthAbbr,
        time: newTime,
        location: newLocation,
        category: newCategory,
        description: newDesc,
        organizer: newOrganizer,
        targetParticipants: newTargetParticipants,
        contactPerson: contactObj,
        requirements: reqList.length > 0 ? reqList : undefined,
        benefits: benList.length > 0 ? benList : undefined,
        status: computedStatus as AgendaEvent['status'],
        statusType: computedStatusType as any
      };
      onEditEvent(updatedEv);
      setSelectedEvent(updatedEv);
    } else {
      const newEv: AgendaEvent = {
        id: `ev_${Date.now()}`,
        title: newTitle,
        date: newDate,
        dayNumber,
        monthAbbr,
        time: newTime,
        location: newLocation,
        status: computedStatus as AgendaEvent['status'],
        statusType: computedStatusType as any,
        category: newCategory,
        description: newDesc || 'Kegiatan kelompok tani KWT Sorgum.',
        organizer: newOrganizer || currentUser.name || 'Pengurus KWT Sorgum',
        creatorId: currentUser.id,
        targetParticipants: newTargetParticipants,
        contactPerson: contactObj,
        requirements: reqList.length > 0 ? reqList : undefined,
        benefits: benList.length > 0 ? benList : undefined
      };
      onAddEvent(newEv);
      setSelectedEvent(newEv);
      // Pindah ke bulan acara yang baru dibuat
      setCurrentMonth(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));
    }

    setShowAddModal(false);
  };

  const handleDelete = (eventId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
      if (onDeleteEvent) onDeleteEvent(eventId);
      if (selectedEvent.id === eventId) {
        setSelectedEvent(events.find(e => e.id !== eventId) || events[0] || ({} as AgendaEvent));
      }
    }
  };

  // Real Calendar Logic State
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const handlePrevMonth = () => {
    if (calendarGranularity === 'hari') {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
    } else {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (calendarGranularity === 'hari') {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
    } else {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const startDayOffset = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const monthNamesFull = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

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
          {viewMode === 'daftar' && (
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
          )}

          <button
            onClick={openAddModal}
            className="px-6 py-3 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
            title="Tambah Agenda Baru"
          >
            <Plus className="w-5 h-5 text-[#A8B774]" />
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
                <div className="relative flex items-center group cursor-pointer gap-2 bg-[#FAF6EE] px-3 py-1.5 rounded-xl border border-[#E6E1D5] hover:border-[#A8B774] transition-all shadow-xs">
                  <CalendarIcon className="w-5 h-5 text-[#2C4219] group-hover:text-[#A8B774] transition-colors" />
                  <h2 className="font-title font-bold text-lg sm:text-xl text-[#2C4219] group-hover:text-[#A8B774] transition-colors">
                    {calendarGranularity === 'hari' ? `${currentMonth.getDate()} ` : ''}{monthNamesFull[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h2>
                  <input
                    type="date"
                    value={`${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(currentMonth.getDate()).padStart(2, '0')}`}
                    onChange={(e) => {
                      if (e.target.value) {
                        const [year, month, day] = e.target.value.split('-');
                        setCurrentMonth(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
                        
                        // Select the first event on that specific date if any
                        const selectedDateStr = `${year}-${month}-${day}`;
                        const eventOnDate = events.find(ev => ev.date === selectedDateStr);
                        if (eventOnDate) {
                          setSelectedEvent(eventOnDate);
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    title="Pilih Tanggal, Bulan, & Tahun"
                    onClick={(e) => {
                      try {
                        if (typeof e.currentTarget.showPicker === 'function') {
                          e.currentTarget.showPicker();
                        }
                      } catch (err) {}
                    }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={handlePrevMonth} className="p-1 rounded-lg border border-[#E6E1D5] hover:bg-[#FAF6EE] text-[#433A30]/70 hover:text-[#2C4219] transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={handleNextMonth} className="p-1 rounded-lg border border-[#E6E1D5] hover:bg-[#FAF6EE] text-[#433A30]/70 hover:text-[#2C4219] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Granularity Switcher Buttons (Hari, Minggu, Bulan) */}
              <div className="flex items-center gap-1.5 text-xs font-semibold bg-[#FAF6EE] p-1 rounded-xl border border-[#E6E1D5] self-start sm:self-auto">
                <button
                  onClick={() => setCalendarGranularity('hari')}
                  className={`px-3 py-1 rounded-lg transition-all ${calendarGranularity === 'hari' ? 'bg-[#2C4219] text-[#FAF6EE] font-bold shadow-2xs' : 'text-[#433A30]/70 hover:text-[#2C4219]'}`}
                >
                  Hari
                </button>
                <button
                  onClick={() => setCalendarGranularity('minggu')}
                  className={`px-3 py-1 rounded-lg transition-all ${calendarGranularity === 'minggu' ? 'bg-[#2C4219] text-[#FAF6EE] font-bold shadow-2xs' : 'text-[#433A30]/70 hover:text-[#2C4219]'}`}
                >
                  Minggu
                </button>
                <button
                  onClick={() => setCalendarGranularity('bulan')}
                  className={`px-3 py-1 rounded-lg transition-all ${calendarGranularity === 'bulan' ? 'bg-[#2C4219] text-[#FAF6EE] font-bold shadow-2xs' : 'text-[#433A30]/70 hover:text-[#2C4219]'}`}
                >
                  Bulan
                </button>
              </div>
            </div>

            {/* Calendar Days Header */}
            {calendarGranularity !== 'hari' && (
              <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-bold text-[#433A30]/70 uppercase tracking-wider border-b border-[#E6E1D5] pb-2.5">
                <span>MIN</span>
                <span>SEN</span>
                <span>SEL</span>
                <span>RAB</span>
                <span>KAM</span>
                <span>JUM</span>
                <span>SAB</span>
              </div>
            )}

            {/* Calendar Days Grid */}
            <div className={`grid ${calendarGranularity === 'hari' ? 'grid-cols-1' : 'grid-cols-7'} gap-1 sm:gap-2 text-center min-h-[360px] ${calendarGranularity === 'minggu' ? 'max-h-[600px] overflow-y-auto custom-scrollbar pr-1' : ''}`}>
              {(() => {
                const renderDayCell = (d: Date, dayNumToDisplay?: string | number) => {
                  const dayNum = d.getDate();
                  const formattedDay = dayNum.toString().padStart(2, '0');
                  const dMonthStr = monthNamesFull[d.getMonth()].substring(0, 3).toUpperCase();
                  const dMonthNumStr = (d.getMonth() + 1).toString().padStart(2, '0');
                  const dYearStr = d.getFullYear().toString();

                  const dayEvents = events.filter(e => e.isRegistered && e.dayNumber === formattedDay && (e.monthAbbr === dMonthStr || e.date.startsWith(`${dYearStr}-${dMonthNumStr}-`)));

                  const isSelected = dayEvents.some(e => e.id === selectedEvent?.id);
                  const today = new Date();
                  const isHighlightDay = dayNum === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();

                  return (
                    <div
                      key={`day_${d.getTime()}`}
                      onClick={() => {
                        setCurrentMonth(d);
                        if (dayEvents.length > 0) {
                          setSelectedEvent(dayEvents[0]);
                        }
                      }}
                      className={`
                        ${calendarGranularity === 'hari' ? 'w-full h-full min-h-[360px] p-4' : calendarGranularity === 'minggu' ? 'min-h-[140px] p-2' : 'aspect-square p-1 sm:p-1.5'}
                        rounded-2xl border transition-all flex flex-col justify-start items-start text-left cursor-pointer group
                        ${isSelected
                          ? 'border-[#2C4219] bg-[#FAF6EE] shadow-2xs ring-2 ring-[#2C4219]/10'
                          : dayEvents.length > 0
                            ? 'border-[#E6E1D5] bg-white hover:border-[#2C4219]/40 hover:bg-[#FAF6EE]/50'
                            : 'border-[#E6E1D5]/60 bg-white hover:bg-[#FAF6EE]/30'}
                      `}
                    >
                      <div className="w-full flex items-center justify-between">
                        {isHighlightDay ? (
                          <span className="w-6 h-6 rounded-full bg-[#D97706] text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                            {dayNumToDisplay ?? dayNum}
                          </span>
                        ) : (
                          <span className={`text-xs font-bold ${isSelected ? 'text-[#2C4219]' : 'text-[#433A30]'}`}>
                            {dayNumToDisplay ?? dayNum}
                          </span>
                        )}
                        {calendarGranularity === 'hari' && (
                          <span className="text-xs font-bold text-[#433A30]/50">
                            {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()]}, {dayNum} {monthNamesFull[d.getMonth()]} {d.getFullYear()}
                          </span>
                        )}
                      </div>
                      <div className={`w-full space-y-1 mt-1 ${calendarGranularity === 'hari' ? 'space-y-3 mt-4' : ''}`}>
                        {dayEvents.map(ev => (
                          <div
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(ev);
                            }}
                            className={`
                              ${calendarGranularity === 'hari' ? 'px-3 py-2 text-sm border' : 'px-1.5 py-0.5 text-[9px] sm:text-[10px]'}
                              rounded font-semibold truncate transition-transform group-hover:scale-98 flex items-center justify-between gap-1
                              ${ev.category === 'PELATIHAN UMKM'
                                ? 'bg-[#A8B774]/30 text-[#2C4219] border-[#A8B774]'
                                : 'bg-[#2C4219] text-white'}
                            `}
                            title={ev.title}
                          >
                            <span className="truncate">{ev.title}</span>
                            {ev.isRegistered && <Check className="w-4 h-4 shrink-0" />}
                          </div>
                        ))}
                        {calendarGranularity === 'hari' && dayEvents.length === 0 && (
                          <div className="text-sm text-[#433A30]/50 text-center mt-10">
                            Tidak ada agenda untuk hari ini.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                };

                if (calendarGranularity === 'bulan' || calendarGranularity === 'minggu') {
                  return (
                    <>
                      {[...Array(startDayOffset)].map((_, i) => (
                        <div key={`offset_${i}`} className={`rounded-2xl bg-[#FAF6EE]/30 border border-transparent ${calendarGranularity === 'minggu' ? 'min-h-[140px]' : 'aspect-square'}`} />
                      ))}
                      {[...Array(daysInMonth)].map((_, idx) => {
                        const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), idx + 1);
                        return renderDayCell(d);
                      })}
                    </>
                  );
                } else {
                  // Hari
                  return renderDayCell(currentMonth);
                }
              })()}
            </div>
          </div>

          {/* RIGHT COLUMN: EVENT DETAILS CARD & UPCOMING EVENTS LIST (4 COLS ON DESKTOP) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* TOP CARD: SELECTED EVENT DETAIL CARD */}
            {selectedEvent ? (
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-5">
                {/* Header: Category & Date */}
                <div className="flex items-center justify-between">
                  <span className="inline-block bg-[#A8B774] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-xs">
                    {selectedEvent.category}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-[#7A7062] font-semibold text-sm">
                      {`${selectedEvent.dayNumber} ${selectedEvent.monthAbbr} ${selectedEvent.date?.split('-')[0] || '2026'}`}
                    </span>
                    {selectedEvent.creatorId === currentUser.id && (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEditModal(selectedEvent)} className="p-1.5 rounded-lg border border-[#E6E1D5] bg-white text-[#433A30]/70 hover:bg-[#FAF6EE] hover:text-[#2C4219] transition-colors shadow-xs" title="Edit Agenda">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(selectedEvent.id)} className="p-1.5 rounded-lg border border-[#E6E1D5] bg-white text-[#433A30]/70 hover:bg-rose-50 hover:text-red-600 transition-colors shadow-xs" title="Hapus Agenda">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h2 className="font-title font-bold text-xl sm:text-2xl text-[#2C4219] leading-snug">
                  {selectedEvent.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-[#433A30]/90 leading-relaxed">
                  {selectedEvent.description}
                </p>

                <hr className="border-[#E6E1D5]" />

                {/* Time */}
                <div className="flex items-center gap-2.5 text-[#433A30]">
                  <Clock className="w-5 h-5 text-[#2C4219]" />
                  <span className="font-medium text-sm">{selectedEvent.time}</span>
                </div>

                <hr className="border-[#E6E1D5]" />

                {/* Footer: Rincian & Daftar */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setShowDetailModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-[#2C4219] border border-[#2C4219]/30 bg-[#FAF6EE] hover:bg-[#A8B774]/20 hover:border-[#2C4219]/60 transition-all shadow-xs hover:shadow-sm active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    Rincian Kegiatan
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRegistration(selectedEvent.id);
                    }}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${selectedEvent.isRegistered
                      ? 'bg-[#A8B774] text-[#2C4219] hover:bg-[#92A360]'
                      : 'bg-[#2C4219] text-white hover:bg-[#1E2E11]'
                      }`}
                  >
                    {selectedEvent.isRegistered ? 'Terdaftar' : 'Daftar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E6E1D5] shadow-xs flex flex-col items-center justify-center min-h-[250px] text-center">
                <p className="text-[#7A7062] font-medium">Belum ada agenda tersedia.</p>
              </div>
            )}

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
                  const isSelected = selectedEvent?.id === ev.id;
                  const isUpcomingNov = ev.monthAbbr === 'NOV';
                  return (
                    <div
                      key={ev.id}
                      onClick={() => {
                        setSelectedEvent(ev);
                        if (ev.date) setCurrentMonth(new Date(ev.date));
                      }}
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
                            <Clock className="w-3 h-3 text-[#433A30]/50 shrink-0" />
                            <span>{ev.time}</span>
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
                    <span className="bg-[#A8B774] text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded">
                      {ev.category}
                    </span>
                    <span className="text-xs text-[#433A30]/70 font-semibold">
                      {ev.dayNumber} {ev.monthAbbr} {ev.date?.split('-')[0] || '2026'}
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
                        ${ev.isRegistered ? 'bg-[#A8B774] text-[#2C4219]' : 'bg-[#2C4219] text-white'}
                      `}
                    >
                      {ev.isRegistered ? 'Terdaftar' : 'Daftar'}
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
                <span className="bg-[#A8B774] text-[#2C4219] text-[10px] font-bold uppercase px-2.5 py-1 rounded">
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
                <span className="text-[10px] uppercase font-bold text-[#433A30]/60">Waktu & Tanggal</span>
                <p className="font-bold text-[#2C4219] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#2C4219]" />
                  {selectedEvent.date} ({selectedEvent.time})
                </p>
              </div>
            </div>

            {/* Deskripsi Kegiatan */}
            <div className="space-y-2">
              <h3 className="font-title font-bold text-sm text-[#2C4219]">Deskripsi Lengkap Kegiatan</h3>
              <p className="text-xs text-[#433A30] leading-relaxed bg-white p-4 rounded-2xl border border-[#E6E1D5]">
                {selectedEvent.description}
              </p>
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
                  ${selectedEvent.isRegistered ? 'bg-[#A8B774] text-[#2C4219]' : 'bg-[#2C4219] text-white hover:bg-[#1E2E11]'}
                `}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{selectedEvent.isRegistered ? 'Terdaftar (Batal Pendaftaran)' : 'Konfirmasi Pendaftaran Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD AGENDA MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E6E1D5] shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-4">
              <h3 className="font-title font-bold text-lg text-[#2C4219]">
                {isEditing ? 'Sunting Agenda Kegiatan' : 'Tambah Agenda Baru'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-[#FAF6EE] text-[#7A7062]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex bg-[#F0EDE4] rounded-xl p-1 mb-2">
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${inputMode === 'manual' ? 'bg-white text-[#2C4219] shadow-sm border border-[#E6E1D5]' : 'text-[#7A7062] hover:text-[#2C4219] hover:bg-white/50'}`}
              >
                ✍️ Isi Manual
              </button>
              <button
                type="button"
                onClick={() => setInputMode('voice')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${inputMode === 'voice' ? 'bg-[#2C4219] text-white shadow-sm' : 'text-[#7A7062] hover:text-[#2C4219] hover:bg-white/50'}`}
              >
                🎙️ Asisten Suara
              </button>
            </div>

            {inputMode === 'voice' && (
              <div className="bg-[#FAF6EE] border border-[#A8B774] rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#A8B774]/20 rounded-full blur-xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-[#2C4219]" />
                    <span className="font-bold text-[#2C4219] text-sm">Asisten Suara Pintar</span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={isProcessingSTT}
                    className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${isRecording
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse shadow-rose-100'
                      : isProcessingSTT
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-[#2C4219] text-white hover:bg-[#1E2E11] hover:scale-105 active:scale-95'
                      }`}
                  >
                    {isProcessingSTT ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Memproses Suara...
                      </>
                    ) : isRecording ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        Berhenti Merekam
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Mulai Bicara Sekarang
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2 relative z-10">
                  <p className="text-xs text-[#5C5246] leading-relaxed">
                    Cukup berbicara untuk mengisi formulir secara otomatis. <br />
                    <b>Caranya:</b> Tekan tombol mikrofon di atas, lalu sebutkan kata kunci (Keyword) dan isi sendiri datanya:
                  </p>
                  <div className="bg-white/60 rounded-lg p-3 border border-[#E6E1D5]/50 space-y-1">
                    <p className="text-[11px] text-[#433A30] font-medium leading-relaxed">
                      Keyword <b>Judul</b>: [Isi sendiri]<br/>
                      Keyword <b>Kategori</b>: [Isi sendiri]<br/>
                      Keyword <b>Tanggal</b>: [Isi sendiri]<br/>
                      Keyword <b>Waktu</b>: [Isi sendiri]<br/>
                      Keyword <b>Deskripsi</b>: [Isi sendiri]
                    </p>
                  </div>
                  {isProcessingSTT && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
                      <svg className="animate-spin w-3.5 h-3.5 text-amber-600 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      <p className="text-[11px] text-amber-700 font-semibold">AI sedang menganalisis rekaman Anda, harap tunggu...</p>
                    </div>
                  )}
                  {sttSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <p className="text-[11px] text-green-700 font-semibold">Form berhasil diisi otomatis!</p>
                    </div>
                  )}
                  {sttError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2">
                      <span className="text-red-500">✗</span>
                      <p className="text-[11px] text-red-600 font-semibold">{sttError}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleCreateOrEditEvent} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-[#2C4219]">Judul Agenda & Kegiatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Workshop Pengolahan Tepung Sorgum"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Kategori Agenda *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  >
                    {categoriesList.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Tanggal Kegiatan *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-[#2C4219]">Waktu Kegiatan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 09:00 WIB"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C4219]">Deskripsi Agenda</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Keterangan singkat kegiatan..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className={`w-full p-3 rounded-xl border ${isRecording ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/30' : 'border-[#E6E1D5] bg-[#FAF6EE]'} text-xs font-semibold focus:outline-none focus:border-[#2C4219] transition-all`}
                />
              </div>

              <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E6E1D5] text-[#7A7062] font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#2C4219] text-white font-title font-bold shadow-md hover:bg-[#1E2E11]"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP MODAL */}
      {popupData.show && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg ${popupData.type === 'register' ? 'bg-[#A8B774]/20 text-[#2C4219]' : popupData.type === 'creator_error' ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500'}`}>
              {popupData.type === 'register' ? <CheckCircle2 className="w-10 h-10" /> : popupData.type === 'creator_error' ? <AlertTriangle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>
            <h3 className="font-title font-bold text-2xl text-[#2C4219] mb-2">
              {popupData.type === 'register' ? 'Berhasil Daftar!' : popupData.type === 'creator_error' ? 'Tidak Dapat Dibatalkan' : 'Pendaftaran Batal'}
            </h3>
            <p className="text-[#433A30]/80 text-sm mb-8 leading-relaxed">
              {popupData.type === 'register'
                ? <>Selamat! Pendaftaran Anda untuk kegiatan <strong>{popupData.eventName}</strong> telah berhasil disimpan.</>
                : popupData.type === 'creator_error'
                  ? <>Anda adalah pembuat kegiatan <strong>{popupData.eventName}</strong>. Anda tidak dapat membatalkan pendaftaran diri sendiri. Silakan Edit atau Hapus agenda jika diperlukan.</>
                  : <>Pendaftaran kegiatan <strong>{popupData.eventName}</strong> telah dibatalkan.</>}
            </p>
            <button
              onClick={() => setPopupData({ ...popupData, show: false })}
              className="w-full py-3.5 rounded-2xl bg-[#2C4219] text-white font-bold hover:bg-[#1E2E11] transition-all shadow-md active:scale-95"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
      {/* Date Warning Modal */}
      {showDateWarning && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-title font-bold text-xl text-[#2C4219] mb-2">Tanggal Tidak Valid</h3>
            <p className="text-sm text-[#7A7062] mb-6 leading-relaxed">
              Anda tidak dapat {isEditing ? 'mengubah' : 'menambahkan'} agenda dengan tanggal di masa lalu. Silakan pilih hari ini atau tanggal di masa mendatang.
            </p>
            <button
              onClick={() => setShowDateWarning(false)}
              className="w-full py-3 px-4 bg-[#2C4219] hover:bg-[#1E2E11] text-white font-bold rounded-xl transition-colors shadow-lg"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

