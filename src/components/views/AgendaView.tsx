import React, { useState } from 'react';
import { AgendaEvent, UserProfile } from '../../types';
import { BASE_URL, resolveImageUrl } from '../../api/client';
import { drawCertificateOnCanvas, isCertificateActive } from '../../utils/certificate';
import { getCategoryColor, getCategoryBorderColor, getCategoryHoverBorderColor, formatEventTimeWithPeriod, isEventPast, cleanHtmlSummary } from '../../utils/agendaUtils';
import { IndonesianTimePicker, to12HourPeriod } from '../IndonesianTimePicker';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
  AlertTriangle,
  Lock,
  Package,
  Gift
} from 'lucide-react';

interface AgendaViewProps {
  appMode?: 'lite' | 'pro';
  events: AgendaEvent[];
  currentUser: UserProfile;
  onAddEvent: (event: AgendaEvent) => void;
  onEditEvent?: (event: AgendaEvent) => void;
  onDeleteEvent?: (eventId: string) => void;
  onRegisterEvent?: (eventId: string) => void;
  onUnregisterEvent?: (eventId: string) => void;
  onUpdateAttendance?: (eventId: string, status: 'Hadir' | 'Tidak Hadir') => void;
  searchQuery?: string;
}



export const AgendaView: React.FC<AgendaViewProps> = ({ 
  appMode,
  events: rawEvents, 
  currentUser, 
  onAddEvent, 
  onEditEvent, 
  onDeleteEvent, 
  onRegisterEvent, 
  onUnregisterEvent, 
  onUpdateAttendance, 
  searchQuery = '' 
}) => {
  const isUserRegistered = (e: AgendaEvent) => {
    if (e.isRegistered) return true;
    return e.peserta?.some(p => p.userId === currentUser?.id || String(p.userId) === String(currentUser?.id)) || false;
  };

  const isAdmin = Boolean(currentUser?.isAdmin || currentUser?.role?.toLowerCase().includes('admin') || currentUser?.name?.toLowerCase().includes('admin'));

  const events = rawEvents;
  const defaultSelected = events.find(e => !isEventPast(e)) || events[0];
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent>(defaultSelected);
  const [claimedCerts, setClaimedCerts] = useState<Record<string, boolean>>({});

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
  const [viewMode, setViewMode] = useState<'kalender' | 'daftar'>(appMode === 'lite' ? 'daftar' : 'kalender');
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
          { key: 'desc', match: /(?:deskripsi|isi|kegiatan)\s*/i },
          { key: 'requirements', match: /(?:perlengkapan|alat|bawa|syarat)\s*/i },
          { key: 'benefits', match: /(?:benefit|keuntungan|manfaat|fasilitas)\s*/i }
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
              if (upper.includes('BUDIDAYA')) setNewCategory('Budidaya Sorgum');
              else if (upper.includes('PANEN') || upper.includes('PASCA')) setNewCategory('Panen & Pascapanen');
              else if (upper.includes('PENGOLAHAN') || upper.includes('KREATIF')) setNewCategory('Pengolahan Sorgum');
              else if (upper.includes('LAPANGAN') || upper.includes('RAPAT')) setNewCategory('Kegiatan Lapangan');
              else if (upper.includes('PELATIHAN') || upper.includes('WORKSHOP')) setNewCategory('Pelatihan');
              else if (upper.includes('PEMASARAN') || upper.includes('UMKM')) setNewCategory('Pemasaran');
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
              let timeVal = val.toLowerCase();
              const numWords: Record<string, string> = {
                'dua belas': '12', 'sebelas': '11', 'sepuluh': '10',
                'sembilan': '9', 'delapan': '8', 'tujuh': '7', 'enam': '6',
                'lima': '5', 'empat': '4', 'tiga': '3', 'dua': '2', 'satu': '1',
                'dua puluh': '20', 'tiga puluh': '30'
              };
              Object.keys(numWords).sort((a, b) => b.length - a.length).forEach(k => {
                timeVal = timeVal.replace(new RegExp(`\\b${k}\\b`, 'g'), numWords[k]);
              });

              const times = timeVal.match(/(\d{1,2})(?::(\d{2}))?/g);
              if (times && times.length >= 2) {
                let s = times[0].includes(':') ? times[0] : `${times[0].padStart(2, '0')}:00`;
                let e = times[1].includes(':') ? times[1] : `${times[1].padStart(2, '0')}:00`;
                const sPad = s.padStart(5, '0');
                const ePad = e.padStart(5, '0');
                setNewStartTime(sPad);
                setNewEndTime(ePad);
                const period = to12HourPeriod(sPad).period;
                setNewTime(`${sPad} - ${ePad} WIB (${period})`);
              } else if (times && times.length === 1) {
                let s = times[0].includes(':') ? times[0] : `${times[0].padStart(2, '0')}:00`;
                const sPad = s.padStart(5, '0');
                setNewStartTime(sPad);
                const period = to12HourPeriod(sPad).period;
                setNewTime(`${sPad} WIB (${period})`);
              }
            } else if (curr.key === 'desc') {
              setNewDesc(val);
            } else if (curr.key === 'requirements') {
              setNewRequirements(val);
            } else if (curr.key === 'benefits') {
              setNewBenefits(val);
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
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('12:00');
  const [newLocation, setNewLocation] = useState('Balai Desa Sukamaju');
  const [newCategory, setNewCategory] = useState('Budidaya Sorgum');
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
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Akan Datang' | 'Riwayat' | 'Sudah Daftar'>('Semua');

  const categoriesList = [
    'Semua',
    'Budidaya Sorgum',
    'Panen & Pascapanen',
    'Pengolahan Sorgum',
    'Kegiatan Lapangan',
    'Pelatihan',
    'Pemasaran'
  ];
  const statusFilters = ['Semua', 'Akan Datang', 'Riwayat', 'Sudah Daftar'];

  // Filtered list based on search term and category
  const activeSearch = searchTerm || searchQuery;
  const filteredEvents = events.filter(e => {
    const isPast = isEventPast(e);
    
    // Check status filter
    if (statusFilter === 'Akan Datang' && isPast) return false;
    if (statusFilter === 'Riwayat' && !isPast) return false;
    if (statusFilter === 'Sudah Daftar' && !isUserRegistered(e)) return false;

    const title = e.title || '';
    const loc = e.location || '';
    const org = e.organizer || '';
    const matchesSearch = title.toLowerCase().includes(activeSearch.toLowerCase()) ||
      loc.toLowerCase().includes(activeSearch.toLowerCase()) ||
      org.toLowerCase().includes(activeSearch.toLowerCase());
    
    const catUpper = (e.category || '').toUpperCase();
    const selUpper = selectedCategory.toUpperCase();
    const matchesCat = selectedCategory === 'Semua' || (e.category && (
      catUpper === selUpper ||
      (selectedCategory === 'Budidaya Sorgum' && catUpper.includes('BUDIDAYA')) ||
      (selectedCategory === 'Panen & Pascapanen' && catUpper.includes('PANEN')) ||
      (selectedCategory === 'Pengolahan Sorgum' && (catUpper.includes('PENGOLAHAN') || catUpper.includes('KREATIF'))) ||
      (selectedCategory === 'Kegiatan Lapangan' && (catUpper.includes('LAPANGAN') || catUpper.includes('INSPEKSI') || catUpper.includes('RAPAT'))) ||
      (selectedCategory === 'Pelatihan' && (catUpper.includes('PELATIHAN') || catUpper.includes('WORKSHOP'))) ||
      (selectedCategory === 'Pemasaran' && (catUpper.includes('PEMASARAN') || catUpper.includes('UMKM')))
    ));
    return matchesSearch && matchesCat;
  }).sort((a, b) => {
    const aPast = isEventPast(a);
    const bPast = isEventPast(b);
    
    // If "Semua", put past events at the bottom
    if (aPast && !bPast) return 1;
    if (!aPast && bPast) return -1;
    
    // Otherwise sort by date ascending
    return (a.date || '').localeCompare(b.date || '');
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

    if (isUserRegistered(event)) {
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
    setNewStartTime('09:00');
    setNewEndTime('12:00');
    setNewLocation('Balai Desa Sukamaju');
    setNewCategory('Budidaya Sorgum');
    setNewDesc('');
    setNewOrganizer(currentUser?.name || 'Tim KWT Sorgum');
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
    const rawTime = ev.time || '';
    setNewTime(rawTime);
    const timeMatches = rawTime.match(/(\d{1,2}:\d{2})/g);
    if (timeMatches && timeMatches.length >= 2) {
      setNewStartTime(timeMatches[0]);
      setNewEndTime(timeMatches[1]);
    } else if (timeMatches && timeMatches.length === 1) {
      setNewStartTime(timeMatches[0]);
      setNewEndTime('');
    } else {
      setNewStartTime('09:00');
      setNewEndTime('12:00');
    }
    setNewLocation(ev.location);
    setNewCategory(ev.category || 'Budidaya Sorgum');
    setNewDesc(ev.description || '');
    setNewOrganizer(ev.organizer || currentUser?.name || 'Tim KWT Sorgum');
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

    if (!isEditing && currentUser?.role !== 'ADMIN' && newDate) {
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

    const period = to12HourPeriod(newStartTime).period;
    const computedFinalTime = newStartTime 
      ? (newEndTime ? `${newStartTime} - ${newEndTime} WIB (${period})` : `${newStartTime} WIB (${period})`) 
      : formatEventTimeWithPeriod(newTime);

    const isPast = isEventPast({ date: newDate, time: computedFinalTime });
    const computedStatus = isPast ? 'Selesai' : 'Belum dimulai';
    const computedStatusType = isPast ? 'neutral' : 'success';

    if (isEditing && editingEventId && onEditEvent) {
      const updatedEv: AgendaEvent = {
        ...selectedEvent,
        id: editingEventId,
        title: newTitle,
        date: newDate,
        dayNumber,
        monthAbbr,
        time: computedFinalTime,
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
        time: computedFinalTime,
        location: newLocation,
        status: computedStatus as AgendaEvent['status'],
        statusType: computedStatusType as any,
        category: newCategory,
        description: newDesc || 'Kegiatan kelompok tani KWT Sorgum.',
        organizer: newOrganizer || currentUser?.name || 'Pengurus KWT Sorgum',
        creatorId: currentUser?.id,
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

  const handleDownloadCertificate = async (certTemplateJson: string, event: AgendaEvent) => {
    try {
      localStorage.setItem(`cert_claimed_${event.id}_${currentUser?.id}`, 'true');
      setClaimedCerts(prev => ({ ...prev, [event.id]: true }));

      let config: any;
      try {
        config = JSON.parse(certTemplateJson);
      } catch {
        alert('Format sertifikat tidak valid.');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const name = currentUser?.certificateName || currentUser?.name || 'Peserta';

      // Load images async (logo & signature)
      const loadImage = (url: string): Promise<HTMLImageElement> => new Promise((res, rej) => {
        const im = new Image(); im.crossOrigin = 'Anonymous'; im.onload = () => res(im); im.onerror = rej; im.src = url;
      });

      let logoImg: HTMLImageElement | null = null;
      let sigImg: HTMLImageElement | null = null;
      
      if (config.logoUrl) {
        try { logoImg = await loadImage(resolveImageUrl(config.logoUrl)); } catch {}
      }
      if (config.signatureUrl) {
        try { sigImg = await loadImage(resolveImageUrl(config.signatureUrl)); } catch {}
      }

      drawCertificateOnCanvas(canvas, config, name, event, logoImg, sigImg);

      // Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Sertifikat-${event.title}-${name}.png`;
      link.href = dataUrl;
      link.click();
    } catch(err) {
      console.error('Gagal mengunduh sertifikat:', err);
      alert('Terjadi kesalahan saat mencetak sertifikat. Pastikan koneksi internet stabil.');
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

  const unclaimedCertificates = events.filter(e => {
    return isEventPast(e) && 
           isCertificateActive(e.certificateTemplate) && 
           e.peserta?.find(p => p.userId === currentUser?.id)?.attended &&
           !localStorage.getItem(`cert_claimed_${e.id}_${currentUser?.id}`) &&
           !claimedCerts[e.id];
  });

  return (
    <div className="space-y-6 pb-24 md:pb-12 animate-in fade-in duration-300">
      {unclaimedCertificates.length > 0 && (
        <div className="bg-gradient-to-r from-[#D97706] to-[#B45309] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-white/20 rounded-full animate-pulse">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Sertifikat Baru Tersedia!</h3>
              <p className="text-xs text-white/90">Anda memiliki {unclaimedCertificates.length} sertifikat kegiatan yang belum diunduh.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              if (unclaimedCertificates[0]?.certificateTemplate) {
                handleDownloadCertificate(unclaimedCertificates[0].certificateTemplate, unclaimedCertificates[0]);
              }
            }}
            className="w-full sm:w-auto px-4 py-2 bg-white text-[#B45309] font-bold text-xs rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
          >
            Unduh Sertifikat
          </button>
        </div>
      )}

      {/* UNIFIED TOP CONTROL BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* View Toggle Buttons */}
        {appMode !== 'lite' && (
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
        )}

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

          {/* <button
            onClick={openAddModal}
            className="px-6 py-3 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-bold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
            title="Tambah Agenda Baru"
          >
            <Plus className="w-5 h-5 text-[#A8B774]" />
            <span>Tambah Agenda</span>
          </button> */}
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

                  const dayEvents = events.filter(e => {
                    const isDateMatch = (e.dayNumber === formattedDay && e.monthAbbr === dMonthStr) || 
                      (Boolean(e.date) && e.date === `${dYearStr}-${dMonthNumStr}-${formattedDay}`);
                    if (!isDateMatch) return false;
                    if (isEventPast(e)) return false;
                    if (isAdmin) return true;
                    return isUserRegistered(e);
                  });

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
                            {isUserRegistered(ev) && <Check className="w-4 h-4 shrink-0" />}
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
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E6E1D5] shadow-xs space-y-5 transition-all duration-300">
                {/* Header: Category & Date */}
                <div className="flex items-center justify-between">
                  <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-xs ${getCategoryColor(selectedEvent.category)}`}>
                    {selectedEvent.category}
                  </span>

                  <div className="flex items-center gap-3">
                    <span className="text-[#7A7062] font-semibold text-sm">
                      {`${selectedEvent.dayNumber || ''} ${selectedEvent.monthAbbr || ''} ${selectedEvent.date?.split('-')[0] || '2026'}`.trim()}
                    </span>
                    {Boolean(selectedEvent.creatorId && currentUser?.id && selectedEvent.creatorId === currentUser.id) && (
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
                <h2 className="font-title font-bold text-lg sm:text-xl text-[#2C4219] leading-snug line-clamp-2 break-words" title={selectedEvent.title}>
                  {selectedEvent.title}
                </h2>

                {/* Description dibatasi agar tidak kepanjangan di sebelah kalender */}
                <p className="text-xs sm:text-sm text-[#433A30]/90 leading-relaxed line-clamp-3 break-words">
                  {cleanHtmlSummary(selectedEvent.description) || 'Tidak ada keterangan tambahan.'}
                </p>

                <hr className="border-[#E6E1D5]" />

                {/* Time */}
                <div className="flex items-center gap-2.5 text-[#433A30]">
                  <Clock className="w-5 h-5 text-[#2C4219]" />
                  <span className="font-medium text-sm">{formatEventTimeWithPeriod(selectedEvent.time)}</span>
                </div>

                <hr className="border-[#E6E1D5]" />

                {/* Footer: Rincian & Daftar */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E6E1D5]">
                  <button
                    type="button"
                    onClick={() => setShowDetailModal(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#2C4219] border border-[#2C4219]/25 bg-[#FAF6EE] hover:bg-[#A8B774]/20 hover:border-[#2C4219]/50 transition-all shadow-2xs hover:shadow-xs active:scale-95 whitespace-nowrap shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2C4219]" />
                    <span>Rincian Kegiatan</span>
                  </button>
                  {!isAdmin && (
                    isEventPast(selectedEvent) ? (
                      isUserRegistered(selectedEvent) ? (
                        <div className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs cursor-default border border-emerald-400 whitespace-nowrap shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>Telah Diikuti</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#E6E1D5]/50 text-[#7A7062] cursor-default whitespace-nowrap shrink-0">
                          <span>Telah Selesai</span>
                        </div>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRegistration(selectedEvent.id);
                        }}
                        className={`inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-95 whitespace-nowrap shrink-0 ${
                          isUserRegistered(selectedEvent)
                            ? 'bg-[#A8B774] text-[#2C4219] hover:bg-[#92A360]'
                            : 'bg-[#2C4219] text-white hover:bg-[#1E2E11]'
                        }`}
                      >
                        {isUserRegistered(selectedEvent) ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2C4219]" />
                            <span>Terdaftar</span>
                          </>
                        ) : (
                          <span>Daftar</span>
                        )}
                      </button>
                    )
                  )}
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
                {events.filter(e => !isEventPast(e)).slice(0, 3).map((ev) => {
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
                        p-3 rounded-2xl bg-white transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-md
                        ${isSelected ? `border-2 ${getCategoryBorderColor(ev.category)} shadow-sm` : 'border border-[#E6E1D5] hover:bg-gray-50'}
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
                          <span className={`inline-block text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shadow-2xs mb-0.5 ${getCategoryColor(ev.category)}`}>
                            {ev.category}
                          </span>
                          <h4 className="font-title font-bold text-xs text-[#2C4219] truncate leading-tight">
                            {ev.title}
                          </h4>
                          <p className="text-[11px] text-[#433A30]/70 truncate flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-[#433A30]/50 shrink-0" />
                            <span>{formatEventTimeWithPeriod(ev.time)}</span>
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
          {/* Filters Bar */}
          {appMode === 'lite' ? (
            <div className="flex flex-col gap-3 pb-2">
              <div className="grid grid-cols-2 gap-3">
                {/* Category Dropdown */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none bg-white border-2 border-[#E6E1D5] text-[#2C4219] font-bold text-xs py-3 pl-4 pr-10 rounded-xl shadow-xs focus:outline-none focus:border-[#607829] transition-colors cursor-pointer"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat === 'Semua' ? 'Semua Kategori' : cat}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#2C4219]">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                
                {/* Status/Waktu Dropdown */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full appearance-none bg-white border-2 border-[#E6E1D5] text-[#2C4219] font-bold text-xs py-3 pl-4 pr-10 rounded-xl shadow-xs focus:outline-none focus:border-[#607829] transition-colors cursor-pointer"
                  >
                    {statusFilters.map((st) => (
                      <option key={st} value={st}>{st === 'Semua' ? 'Semua Waktu' : st}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#2C4219]">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar flex-1">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border
                      ${selectedCategory === cat
                        ? (cat === 'Semua' 
                            ? 'bg-[#2C4219] text-white border-[#2C4219] shadow-md scale-105' 
                            : `${getCategoryColor(cat)} border-transparent shadow-md scale-105`)
                        : 'bg-white text-[#433A30] border-[#E6E1D5] hover:bg-[#FAF6EE] hover:scale-105'}
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              
              {/* Status Filter Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="appearance-none bg-white border border-[#E6E1D5] text-[#2C4219] font-bold text-xs py-2 pl-4 pr-10 rounded-xl shadow-xs focus:outline-none focus:border-[#E5A300] focus:ring-1 focus:ring-[#E5A300] cursor-pointer hover:bg-[#FAF6EE] transition-colors min-w-[140px]"
                >
                  {statusFilters.map((st) => (
                    <option key={st} value={st}>{st === 'Semua' ? 'Semua Waktu' : st}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#A19D94]">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* Agenda Event Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 border-[#E6E1D5] ${getCategoryHoverBorderColor(ev.category)} hover:border-2 hover:shadow-md`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${getCategoryColor(ev.category)}`}>
                      {ev.category}
                    </span>
                    <span className="text-xs text-[#433A30]/70 font-semibold">
                      {`${ev.dayNumber || ''} ${ev.monthAbbr || ''} ${ev.date?.split('-')[0] || '2026'}`.trim()}
                    </span>
                  </div>

                  <h3 className="font-title font-bold text-base text-[#2C4219]">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-[#433A30] leading-relaxed line-clamp-2">
                    {ev.description}
                  </p>

                  <div className="space-y-1 text-xs text-[#433A30]/80 pt-2 border-t border-[#E6E1D5]">
                    <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#2C4219]" /> {formatEventTimeWithPeriod(ev.time)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#E6E1D5]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEvent(ev);
                      setShowDetailModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2C4219] hover:underline whitespace-nowrap"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#2C4219]" />
                    <span>Rincian Kegiatan</span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isAdmin && (
                      isEventPast(ev) ? (
                        isUserRegistered(ev) ? (
                          <div className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs flex items-center gap-1 cursor-default border border-emerald-400 whitespace-nowrap">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Telah Diikuti</span>
                          </div>
                        ) : (
                          <div className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E6E1D5]/50 text-[#7A7062] flex items-center gap-1 cursor-default whitespace-nowrap">
                            <span>Selesai</span>
                          </div>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleRegistration(ev.id)}
                          className={`
                            inline-flex items-center justify-center gap-1 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 whitespace-nowrap
                            ${isUserRegistered(ev) ? 'bg-[#A8B774] text-[#2C4219] hover:bg-[#92A360]' : 'bg-[#2C4219] text-white hover:bg-[#1E2E11]'}
                          `}
                        >
                          {isUserRegistered(ev) ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-[#2C4219]" />
                              <span>Terdaftar</span>
                            </>
                          ) : (
                            'Daftar'
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAILED ACTIVITY MODAL (RINCIAN FULL KEGIATAN) */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E6E1D5] space-y-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E6E1D5]">
              <div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded ${getCategoryColor(selectedEvent.category)}`}>
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
            <div className="text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border border-[#E6E1D5] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#433A30]/60">Waktu & Tanggal</span>
                <p className="font-bold text-[#2C4219] flex items-center gap-1.5 flex-wrap">
                  <Clock className="w-4 h-4 text-[#2C4219]" />
                  <span>{selectedEvent.date}</span>
                  <span className="text-[#A19D94]">•</span>
                  <span>{formatEventTimeWithPeriod(selectedEvent.time)}</span>
                </p>
              </div>
            </div>

            {/* 1. Deskripsi Kegiatan */}
            <div className="space-y-2">
              <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2C4219]" />
                Deskripsi Kegiatan
              </h3>
              <p className="text-xs text-[#433A30] leading-relaxed bg-white p-4 rounded-2xl border border-[#E6E1D5] whitespace-pre-line break-words">
                {selectedEvent.description || 'Tidak ada keterangan tambahan.'}
              </p>
            </div>

            {/* 2. Perlengkapan yang Dibawa */}
            {selectedEvent.requirements && selectedEvent.requirements.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-title font-bold text-sm text-[#B45309] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#B45309]" />
                  Perlengkapan yang Dibawa
                </h3>
                <div className="bg-[#FFFBEB] p-4 rounded-2xl border border-[#FDE68A] space-y-2">
                  <ul className="space-y-1.5">
                    {selectedEvent.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#92400E] font-medium leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-1.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 3. Benefit / Keuntungan Peserta */}
            {selectedEvent.benefits && selectedEvent.benefits.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                  <Gift className="w-4 h-4 text-[#2C4219]" />
                  Benefit & Keuntungan Peserta
                </h3>
                <div className="bg-[#F4F8EC] p-4 rounded-2xl border border-[#D5E5B8] space-y-2">
                  <ul className="space-y-1.5">
                    {selectedEvent.benefits.map((ben, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-[#2C4219] font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-[#2C4219] mt-0.5 shrink-0" />
                        <span>{ben}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Materi & Dokumentasi */}
            {(() => {
              const isRegistered = isUserRegistered(selectedEvent);
              const isPast = isEventPast(selectedEvent);
              const isAttended = selectedEvent.peserta?.some(p => (p.userId === currentUser?.id || String(p.userId) === String(currentUser?.id)) && p.attended);
              // User boleh melihat jika: Admin, atau jika belum lewat sudah daftar, atau jika sudah lewat sudah daftar dan hadir/mengikuti
              const canAccessMateri = isAdmin || (isPast ? (isRegistered && isAttended) : isRegistered);

              if (!canAccessMateri) {
                return (
                  <div className="pt-2">
                    <div className="bg-[#FAF6EE] p-5 rounded-2xl border border-[#E6E1D5] flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#A8B774]/20 flex items-center justify-center text-[#2C4219] shrink-0 mt-0.5">
                        <Lock className="w-5 h-5 text-[#2C4219]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-title font-bold text-sm text-[#2C4219]">Materi Khusus Peserta</h4>
                        <p className="text-xs text-[#5C5246] leading-relaxed">
                          {isPast
                            ? 'Materi kegiatan dan sertifikat hanya dapat diakses oleh peserta yang telah terdaftar dan mengikuti agenda ini.'
                            : 'Materi, berkas, dan tautan kegiatan hanya dapat diakses setelah Anda mendaftar dan mengikuti kegiatan ini.'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-4 pt-2">
                  {selectedEvent.materiUrls && selectedEvent.materiUrls.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#E5A300]/20 flex items-center justify-center text-[#E5A300]">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        Unduh Materi Kegiatan
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedEvent.materiUrls.map((url, idx) => {
                          const resolvedUrl = resolveImageUrl(url);
                          const isImage = resolvedUrl.toLowerCase().match(/\.(jpeg|jpg|png|webp)$/) != null;

                          if (isImage) {
                            return (
                              <a key={idx} href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl border-2 border-transparent hover:border-[#E5A300] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 aspect-video sm:aspect-auto sm:h-20 relative bg-[#FAF6EE]">
                                <img src={resolvedUrl} alt={`Materi Gambar ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                                  <span className="text-white text-[10px] font-bold flex items-center gap-1.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    Lihat Gambar
                                  </span>
                                </div>
                              </a>
                            );
                          }

                          return (
                            <a key={idx} href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="group bg-gradient-to-br from-white to-[#FAF6EE] p-3 rounded-2xl border border-[#E6E1D5] shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#E5A300] flex items-center gap-3 text-xs font-bold text-[#2C4219] transition-all duration-300">
                              <div className="w-10 h-10 rounded-xl bg-[#E5A300]/10 text-[#E5A300] flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[13px]">Materi Berkas {idx + 1}</span>
                                <span className="text-[10px] text-[#A19D94] font-medium mt-0.5">Ketuk untuk mengunduh</span>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {selectedEvent.dokumentasiUrls && selectedEvent.dokumentasiUrls.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#A8B774]/30 flex items-center justify-center text-[#2C4219]">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        Galeri Dokumentasi
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedEvent.dokumentasiUrls.map((url, idx) => {
                          const resolvedUrl = resolveImageUrl(url);
                          return (
                            <a key={idx} href={resolvedUrl} target="_blank" rel="noopener noreferrer" className="group block rounded-2xl border-2 border-transparent hover:border-[#A8B774] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 aspect-[4/3] relative bg-[#FAF6EE]">
                              <img src={resolvedUrl} alt={`Dokumentasi ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                                <span className="text-white text-[10px] font-bold flex items-center gap-1.5">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                  Lihat Penuh
                                </span>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {selectedEvent.linkUrls && selectedEvent.linkUrls.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h3 className="font-title font-bold text-sm text-[#2C4219] flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#293379]/20 flex items-center justify-center text-[#293379]">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                        </div>
                        Tautan Tambahan
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedEvent.linkUrls.map((url, idx) => (
                          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group bg-gradient-to-br from-white to-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] shadow-xs hover:shadow-md hover:-translate-y-1 hover:border-[#293379] flex items-center gap-3 text-xs font-bold text-[#1E293B] transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-[#293379]/10 text-[#293379] flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden">
                              <span className="text-[13px] truncate">Tautan {idx + 1}</span>
                              <span className="text-[10px] text-[#64748B] font-medium mt-0.5 truncate">{url}</span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Sertifikat Kehadiran */}
                  {isEventPast(selectedEvent) && isUserRegistered(selectedEvent) && 
                   selectedEvent.certificateTemplate && 
                   selectedEvent.peserta?.some(p => (p.userId === currentUser?.id || String(p.userId) === String(currentUser?.id)) && p.attended) && (
                    <div className="space-y-3 pt-2">
                      <h3 className="font-title font-bold text-sm text-[#D97706] flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#D97706]/20 flex items-center justify-center text-[#D97706]">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        Sertifikat Penghargaan
                      </h3>
                      
                      {isCertificateActive(selectedEvent.certificateTemplate) ? (
                        <button
                          onClick={() => handleDownloadCertificate(selectedEvent.certificateTemplate!, selectedEvent)}
                          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-br from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          Unduh Sertifikat Kehadiran Anda
                        </button>
                      ) : (
                        <div className="relative overflow-hidden bg-gradient-to-br from-[#FEF2F2] to-[#FFF7ED] border border-[#FECACA] rounded-2xl p-4 sm:p-5 shadow-sm animate-in fade-in zoom-in-95 duration-300">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                          <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="w-10 h-10 rounded-full bg-red-100/80 flex items-center justify-center shrink-0 border border-red-200">
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                              </svg>
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-sm text-red-700">Sertifikat Dinonaktifkan</h4>
                              <p className="text-[11px] sm:text-xs text-red-600/80 font-medium leading-relaxed">
                                Sertifikat untuk agenda ini sedang tidak tersedia atau dinonaktifkan sementara. Silakan hubungi <strong>admin</strong> untuk informasi lebih lanjut atau bantuan pencetakan manual.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {(!selectedEvent.materiUrls?.length && !selectedEvent.dokumentasiUrls?.length && !selectedEvent.linkUrls?.length && !isCertificateActive(selectedEvent.certificateTemplate)) && (
                    <div className="bg-[#FAF6EE]/50 p-4 rounded-2xl border border-[#E6E1D5]/50 text-center">
                      <p className="text-[11px] text-[#A19D94] font-medium italic">Belum ada berkas materi, dokumentasi, atau tautan yang diunggah.</p>
                    </div>
                  )}
                </div>
              );
            })()}
            

            {/* Modal Footer Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4 border-t border-[#E6E1D5]">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 sm:py-2.5 rounded-xl border border-[#E6E1D5] text-xs font-semibold text-[#433A30] hover:bg-[#FAF6EE] text-center transition-colors"
              >
                Tutup Window
              </button>

              {!isAdmin && (
                isEventPast(selectedEvent) ? (
                  isUserRegistered(selectedEvent) ? (
                    <div className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs cursor-default border border-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Kegiatan Telah Selesai Diikuti</span>
                    </div>
                  ) : (
                    <div className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-[#E6E1D5]/50 text-[#7A7062] cursor-default">
                      <span>Kegiatan Telah Selesai</span>
                    </div>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      toggleRegistration(selectedEvent.id);
                      setShowDetailModal(false);
                    }}
                    className={`
                      px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95
                      ${isUserRegistered(selectedEvent) ? 'bg-[#A8B774] text-[#2C4219] hover:bg-[#92A360]' : 'bg-[#2C4219] text-white hover:bg-[#1E2E11]'}
                    `}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUserRegistered(selectedEvent) ? 'Terdaftar (Batal Ikut)' : 'Ikut Kegiatan Ini'}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD AGENDA MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
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
                      Keyword <b>Judul</b>: [Judul kegiatan]<br/>
                      Keyword <b>Kategori</b>: [Kategori kegiatan]<br/>
                      Keyword <b>Tanggal</b>: [Tanggal kegiatan]<br/>
                      Keyword <b>Waktu</b>: [Waktu/jam kegiatan]<br/>
                      Keyword <b>Deskripsi</b>: [Penjelasan singkat kegiatan]<br/>
                      Keyword <b>Perlengkapan</b>: [Alat / barang yang dibawa]<br/>
                      Keyword <b>Benefit</b>: [Fasilitas / keuntungan yang didapat]
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
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#2C4219]">Waktu Kegiatan *</label>
                <div className="flex items-end gap-3 sm:gap-4 flex-wrap">
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <label className="text-xs font-bold text-[#7A7062]">Jam Mulai</label>
                    <IndonesianTimePicker
                      value={newStartTime}
                      align="left"
                      onChange={(val) => {
                        setNewStartTime(val);
                        const period = to12HourPeriod(val).period;
                        setNewTime(val ? (newEndTime ? `${val} - ${newEndTime} WIB (${period})` : `${val} WIB (${period})`) : '');
                      }}
                    />
                  </div>

                  <div className="pb-3 px-1 text-xs font-bold text-[#7A7062] shrink-0 select-none">
                    s/d
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <label className="text-xs font-bold text-[#7A7062]">Jam Selesai</label>
                    <IndonesianTimePicker
                      value={newEndTime}
                      onChange={(val) => {
                        setNewEndTime(val);
                        const period = to12HourPeriod(newStartTime || val).period;
                        setNewTime(newStartTime ? (val ? `${newStartTime} - ${val} WIB (${period})` : `${newStartTime} WIB (${period})`) : '');
                      }}
                    />
                  </div>

                  <div className="pb-0 shrink-0">
                    <span className="inline-flex items-center justify-center h-11 px-3.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs font-bold text-[#2C4219]">
                      WIB
                    </span>
                  </div>
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

              <div className="space-y-1">
                <label className="block font-bold text-[#2C4219]">Perlengkapan yang Dibawa (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Bawa sampel olahan, HP berkamera"
                  value={newRequirements}
                  onChange={(e) => setNewRequirements(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219] transition-all"
                />
                <span className="text-[10px] text-[#7A7062]">Pisahkan dengan koma jika lebih dari satu</span>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#2C4219]">Benefit Peserta (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Stiker gratis, Snack, Sertifikat"
                  value={newBenefits}
                  onChange={(e) => setNewBenefits(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] text-xs font-semibold focus:outline-none focus:border-[#2C4219] transition-all"
                />
                <span className="text-[10px] text-[#7A7062]">Pisahkan dengan koma jika lebih dari satu</span>
              </div>

              <div className="pt-3 border-t border-[#E6E1D5] flex flex-wrap items-center justify-end gap-3">
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
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
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

