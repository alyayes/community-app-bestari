import React, { useState } from 'react';
import { AgendaEvent, UserProfile } from '../../types';
import { Calendar, Clock, MapPin, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

interface AgendaViewLiteProps {
  events: AgendaEvent[];
  currentUser: UserProfile;
  onRegisterEvent?: (eventId: string) => void;
  onUnregisterEvent?: (eventId: string) => void;
}

export const AgendaViewLite: React.FC<AgendaViewLiteProps> = ({
  events,
  currentUser,
  onRegisterEvent,
  onUnregisterEvent
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter events to only show upcoming and maybe a few past
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const isUserRegistered = (ev: AgendaEvent) => {
    return ev.peserta?.some(p => p.userId === currentUser?.id) || ev.isRegistered;
  };

  const isEventPast = (ev: AgendaEvent) => {
    return ev.date && !isNaN(new Date(ev.date).getTime()) && new Date(ev.date).getTime() < new Date().setHours(0, 0, 0, 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full pb-8">
      <div className="mb-6 border-b border-[#E6E1D5] pb-4">
        <h1 className="font-title font-bold text-2xl text-[#2C4219] flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#A8B774]" />
          Jadwal Kegiatan
        </h1>
        <p className="text-sm text-[#433A30]/70 mt-1">Daftar agenda kegiatan dan pelatihan kelompok tani.</p>
      </div>

      <div className="space-y-4">
        {sortedEvents.map(ev => {
          const isRegistered = isUserRegistered(ev);
          const isPast = isEventPast(ev);
          const isExpanded = expandedId === ev.id;

          return (
            <div 
              key={ev.id} 
              className={`bg-white rounded-2xl border p-4 transition-all shadow-sm ${isRegistered ? 'border-[#A8B774]' : 'border-[#E6E1D5]'}`}
            >
              <div 
                className="flex flex-col sm:flex-row justify-between gap-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : ev.id)}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#433A30]/80">
                      {ev.date}
                    </span>
                    {isRegistered && !isPast && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#A8B774]/20 text-[#2C4219] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Terdaftar
                      </span>
                    )}
                    {isPast && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        Selesai
                      </span>
                    )}
                  </div>
                  <h3 className="font-title font-bold text-lg text-[#2C4219] leading-tight">
                    {ev.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-[#433A30]/70">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2C4219]" />
                      <span>{ev.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2C4219]" />
                      <span className="line-clamp-1">{ev.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center sm:justify-end gap-3 sm:w-auto w-full border-t sm:border-0 border-[#E6E1D5] pt-3 sm:pt-0">
                  <div className="text-[#433A30]/50 p-1 sm:block hidden">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-[#E6E1D5] space-y-4 animate-in slide-in-from-top-2">
                  <div>
                    <h4 className="text-xs font-bold text-[#2C4219] mb-1">Rincian Kegiatan</h4>
                    <p className="text-sm text-[#433A30]/80 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>
                  {!isPast && (
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      {isRegistered ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); onUnregisterEvent?.(ev.id); }}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#C53030]/10 text-[#C53030] font-bold text-sm rounded-xl hover:bg-[#C53030]/20 transition-all border border-[#C53030]/20"
                        >
                          Batal Daftar
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRegisterEvent?.(ev.id); }}
                          className="w-full sm:w-auto px-6 py-2.5 bg-[#2C4219] text-white font-bold text-sm rounded-xl hover:bg-[#1E2E11] transition-all shadow-md"
                        >
                          Daftar Kegiatan Ini
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {sortedEvents.length === 0 && (
          <div className="text-center py-12 text-[#433A30]/50">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Belum ada agenda kegiatan.</p>
          </div>
        )}
      </div>
    </div>
  );
};
