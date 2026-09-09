import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronDown, X } from 'lucide-react';

interface IndonesianTimePickerProps {
  value: string; // e.g. "09:00" atau "12:00"
  onChange: (time24: string) => void;
  disabled?: boolean;
  className?: string;
  align?: 'left' | 'right' | 'auto';
}

const PERIODS = [
  { label: 'Pagi', value: 'Pagi', desc: '06:00 - 10:59' },
  { label: 'Siang', value: 'Siang', desc: '11:00 - 14:59' },
  { label: 'Sore', value: 'Sore', desc: '15:00 - 17:59' },
  { label: 'Malam', value: 'Malam', desc: '18:00 - 05:59' }
];

export const to12HourPeriod = (time24: string) => {
  if (!time24) return { hour: '09', minute: '00', period: 'Pagi' };
  const parts = time24.split(':');
  let h = parseInt(parts[0] || '9', 10);
  if (isNaN(h)) h = 9;
  const m = (parts[1] || '00').slice(0, 2).padStart(2, '0');

  let period = 'Pagi';
  if (h >= 11 && h < 15) {
    period = 'Siang';
  } else if (h >= 15 && h < 18) {
    period = 'Sore';
  } else if (h >= 18 || h < 5) {
    period = 'Malam';
  } else {
    period = 'Pagi';
  }

  let h12 = h;
  if (h === 0) h12 = 12;
  else if (h > 12) h12 = h - 12;

  return {
    hour: String(h12).padStart(2, '0'),
    minute: m,
    period
  };
};

export const to24Hour = (hourStr: string, minuteStr: string, period: string) => {
  let h = parseInt(hourStr || '9', 10);
  if (isNaN(h)) h = 9;
  const m = (minuteStr || '00').padStart(2, '0');

  // Jika user mengetik langsung format 24 jam (13 s/d 23)
  if (h >= 13 && h <= 23) {
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  if (h === 0) {
    return `00:${m}`;
  }

  if (h < 1) h = 1;
  if (h > 12) h = 12;

  let h24 = h;
  if (period === 'Pagi') {
    // 01:00 - 10:59, 12 siang jika user pilih 12
    if (h === 12) h24 = 12;
    else h24 = h;
  } else if (period === 'Siang') {
    // 11:00, 12:00, 1 siang (13:00), 2 siang (14:00)
    if (h === 11 || h === 12) h24 = h;
    else if (h < 11) h24 = h + 12;
  } else if (period === 'Sore') {
    // 03:00 sore (15:00), 04:00 (16:00), 05:00 (17:00)
    if (h < 12) h24 = h + 12;
    else h24 = 15;
  } else if (period === 'Malam') {
    // 06 malam (18:00) - 11 malam (23:00), 12 malam (00:00), 01 malam (01:00)
    if (h === 12) h24 = 0;
    else if (h >= 6 && h <= 11) h24 = h + 12;
    else if (h < 6) h24 = h;
  }

  return `${String(h24).padStart(2, '0')}:${m}`;
};

export const IndonesianTimePicker: React.FC<IndonesianTimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  align = 'auto'
}) => {
  const { hour, minute, period } = to12HourPeriod(value);
  const [hourInput, setHourInput] = useState(hour);
  const [minuteInput, setMinuteInput] = useState(minute);
  const [isOpen, setIsOpen] = useState(false);
  const [popoverAlign, setPopoverAlign] = useState<'left' | 'right'>('left');

  const containerRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);

  // Sync saat prop value berubah dari luar
  useEffect(() => {
    setHourInput(hour);
    setMinuteInput(minute);
  }, [hour, minute]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Hitung posisi aman popover agar tidak pernah terpotong di tepi layar/modal
  useEffect(() => {
    if (isOpen && containerRef.current) {
      if (align === 'left' || align === 'right') {
        setPopoverAlign(align);
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.left;
      // Jika sisi kanan sempit (< 320px) dan sisi kiri cukup longgar, baru gunakan align right
      if (spaceRight < 320 && rect.right >= 320) {
        setPopoverAlign('right');
      } else {
        // Default selalu align left agar mengembang ke kanan (area lapang form)
        setPopoverAlign('left');
      }
    }
  }, [isOpen, align]);

  // Handle Ketik Jam (Ketik Bebas: 1-12 atau 13-23)
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setHourInput(val);

    if (val.length === 2) {
      const num = parseInt(val, 10);
      if (num >= 13 && num <= 23) {
        onChange(`${String(num).padStart(2, '0')}:${minuteInput || minute}`);
        return;
      }
      if (num === 0) {
        onChange(`00:${minuteInput || minute}`);
        return;
      }
      
      let targetPeriod = period;
      if (num === 12 && (period === 'Pagi' || period === 'Malam')) {
        targetPeriod = 'Siang';
      }
      const clamped = num > 12 ? 12 : num < 1 ? 1 : num;
      const formatted = String(clamped).padStart(2, '0');
      onChange(to24Hour(formatted, minuteInput || minute, targetPeriod));
    }
  };

  const handleHourBlur = () => {
    let num = parseInt(hourInput || '9', 10);
    if (isNaN(num)) num = 9;

    if (num >= 13 && num <= 23) {
      onChange(`${String(num).padStart(2, '0')}:${minuteInput || minute}`);
      return;
    }
    if (num === 0) {
      onChange(`00:${minuteInput || minute}`);
      return;
    }

    let targetPeriod = period;
    if (num === 12 && (period === 'Pagi' || period === 'Malam')) {
      targetPeriod = 'Siang';
    }
    const clamped = num > 12 ? 12 : num < 1 ? 1 : num;
    const formatted = String(clamped).padStart(2, '0');
    setHourInput(formatted);
    onChange(to24Hour(formatted, minuteInput || minute, targetPeriod));
  };

  // Handle Ketik Menit
  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMinuteInput(val);

    if (val.length === 2) {
      let num = parseInt(val, 10);
      if (isNaN(num) || num < 0) num = 0;
      if (num > 59) num = 59;
      const formatted = String(num).padStart(2, '0');
      onChange(to24Hour(hourInput || hour, formatted, period));
    }
  };

  const handleMinuteBlur = () => {
    let num = parseInt(minuteInput || '0', 10);
    if (isNaN(num) || num < 0) num = 0;
    if (num > 59) num = 59;
    const formatted = String(num).padStart(2, '0');
    setMinuteInput(formatted);
    onChange(to24Hour(hourInput || hour, formatted, period));
  };

  const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      let num = parseInt(hourInput || '9', 10);
      if (isNaN(num)) num = 9;
      if (e.key === 'ArrowUp') {
        num = num >= 12 ? 1 : num + 1;
      } else {
        num = num <= 1 ? 12 : num - 1;
      }
      const formatted = String(num).padStart(2, '0');
      setHourInput(formatted);
      let targetPeriod = period;
      if (num === 12 && (period === 'Pagi' || period === 'Malam')) targetPeriod = 'Siang';
      onChange(to24Hour(formatted, minuteInput || minute, targetPeriod));
    } else if (e.key === 'Enter' || e.key === ':') {
      e.preventDefault();
      handleHourBlur();
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      let num = parseInt(minuteInput || '0', 10);
      if (isNaN(num)) num = 0;
      const step = 5;
      if (e.key === 'ArrowUp') {
        num = (num + step) % 60;
      } else {
        num = (num - step + 60) % 60;
      }
      const formatted = String(num).padStart(2, '0');
      setMinuteInput(formatted);
      onChange(to24Hour(hourInput || hour, formatted, period));
    } else if (e.key === 'Enter') {
      handleMinuteBlur();
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    onChange(to24Hour(hourInput || hour, minuteInput || minute, newPeriod));
  };

  // Pilih dari Popover
  const selectHour = (h: string) => {
    setHourInput(h);
    let targetPeriod = period;
    if (h === '12' && (period === 'Pagi' || period === 'Malam')) {
      targetPeriod = 'Siang';
    }
    onChange(to24Hour(h, minuteInput || minute, targetPeriod));
  };

  const selectMinute = (m: string) => {
    setMinuteInput(m);
    onChange(to24Hour(hourInput || hour, m, period));
  };

  const selectPreset = (timeStr: string) => {
    onChange(timeStr);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Box Utama: Input Jam, Menit, Dropdown Periode & Tombol Clock */}
      <div
        className={`h-11 px-3 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl inline-flex items-center justify-between gap-2 text-xs font-semibold transition-all shrink-0 w-[190px] sm:w-[205px] whitespace-nowrap select-none ${
          disabled
            ? 'opacity-60 cursor-not-allowed'
            : 'hover:border-[#2C4219]/40 focus-within:border-[#2C4219] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2C4219]/10 shadow-xs'
        } ${className}`}
      >
        <div className="flex items-center gap-1 text-[#2C4219] shrink-0">
          {/* Input Jam (Ketik Langsung: 01-12) */}
          <input
            ref={hourRef}
            type="text"
            inputMode="numeric"
            disabled={disabled}
            value={hourInput}
            onChange={handleHourChange}
            onKeyDown={handleHourKeyDown}
            onBlur={handleHourBlur}
            onFocus={(e) => e.target.select()}
            placeholder="09"
            title="Ketik jam (01-12)"
            className="w-7 text-center font-bold text-xs text-[#2C4219] bg-transparent p-0 m-0 border-0 outline-none leading-none focus:outline-none shrink-0"
          />

          <span className="font-bold text-[#7A7062] select-none shrink-0">:</span>

          {/* Input Menit (Ketik Langsung: 00-59) */}
          <input
            ref={minuteRef}
            type="text"
            inputMode="numeric"
            disabled={disabled}
            value={minuteInput}
            onChange={handleMinuteChange}
            onKeyDown={handleMinuteKeyDown}
            onBlur={handleMinuteBlur}
            onFocus={(e) => e.target.select()}
            placeholder="00"
            title="Ketik menit (00-59)"
            className="w-7 text-center font-bold text-xs text-[#2C4219] bg-transparent p-0 m-0 border-0 outline-none leading-none focus:outline-none shrink-0"
          />

          {/* Badge Periode: Pagi / Siang / Sore / Malam */}
          <div className="relative ml-1 shrink-0">
            <select
              disabled={disabled}
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="appearance-none bg-[#EAE5D9] hover:bg-[#E0D9C8] text-[#2C4219] font-bold text-[11px] py-1 pl-2 pr-5 rounded-lg focus:outline-none cursor-pointer transition-colors"
            >
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value} className="bg-white text-[#2C4219]">
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#2C4219]/70 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Tombol Icon Clock untuk Buka Dropdown Popover Pilihan */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          title="Buka pilihan jam & menit"
          className={`p-1.5 rounded-lg transition-all shrink-0 active:scale-95 ${
            isOpen
              ? 'bg-[#2C4219] text-white'
              : 'text-[#7A7062] hover:text-[#2C4219] hover:bg-[#EAE5D9]'
          }`}
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>

      {/* Popover Dropdown Pilihan Jam, Menit, & Preset Cepat */}
      {isOpen && !disabled && (
        <div
          className={`absolute top-full mt-2 z-[100] ${
            popoverAlign === 'right' ? 'right-0' : 'left-0'
          } bg-white rounded-2xl border border-[#E6E1D5] shadow-2xl p-4 w-[310px] sm:w-[325px] max-w-[calc(100vw-32px)] space-y-3.5 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5`}
        >
          {/* Header Popover */}
          <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#FAF6EE] border border-[#E6E1D5] flex items-center justify-center text-[#2C4219]">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[#2C4219]">Pilih Waktu Agenda</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#2C4219] bg-[#FAF6EE] px-2.5 py-1 rounded-lg border border-[#E6E1D5]">
                {hourInput}:{minuteInput} {period}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#7A7062] hover:text-[#2C4219] rounded-lg hover:bg-[#FAF6EE] transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preset Kegiatan Cepat (1-Klik) */}
          <div>
            <div className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Pilihan Cepat (Populer):</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { time: '08:00', label: '08:00 Pagi' },
                { time: '09:00', label: '09:00 Pagi' },
                { time: '10:00', label: '10:00 Pagi' },
                { time: '12:00', label: '12:00 Siang' },
                { time: '13:00', label: '13:00 Siang' },
                { time: '14:00', label: '14:00 Siang' },
                { time: '15:00', label: '15:00 Sore' },
                { time: '16:00', label: '16:00 Sore' },
                { time: '19:30', label: '19:30 Malam' },
              ].map((preset) => {
                const isSelected = value === preset.time;
                return (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => selectPreset(preset.time)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center transition-all ${
                      isSelected
                        ? 'bg-[#2C4219] text-white shadow-xs'
                        : 'bg-[#FAF6EE] text-[#433A30] hover:bg-[#A8B774]/25 hover:text-[#2C4219] border border-[#E6E1D5]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Periode Waktu (Pagi / Siang / Sore / Malam) */}
          <div className="border-t border-[#E6E1D5] pt-2.5">
            <div className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider mb-1.5">
              Bagian Waktu:
            </div>
            <div className="grid grid-cols-4 gap-1">
              {PERIODS.map((p) => {
                const isSelected = period === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handlePeriodChange(p.value)}
                    className={`py-1.5 rounded-xl text-[11px] font-bold text-center transition-all ${
                      isSelected
                        ? 'bg-[#2C4219] text-white shadow-xs'
                        : 'bg-[#FAF6EE] text-[#7A7062] hover:text-[#2C4219] hover:bg-[#EAE5D9] border border-[#E6E1D5]'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pilihan Jam (01 - 12) */}
          <div className="border-t border-[#E6E1D5] pt-2.5">
            <div className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider mb-1.5">
              Jam (01 - 12):
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((h) => {
                const isSelected = hourInput === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => selectHour(h)}
                    className={`h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#2C4219] text-white shadow-sm ring-2 ring-[#2C4219]/20'
                        : 'bg-[#FAF6EE] text-[#2C4219] hover:bg-[#A8B774]/25 border border-[#E6E1D5]'
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pilihan Menit (00 - 55) */}
          <div className="border-t border-[#E6E1D5] pt-2.5">
            <div className="text-[10px] font-bold text-[#7A7062] uppercase tracking-wider mb-1.5">
              Menit:
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => {
                const isSelected = minuteInput === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectMinute(m)}
                    className={`h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#2C4219] text-white shadow-sm ring-2 ring-[#2C4219]/20'
                        : 'bg-[#FAF6EE] text-[#2C4219] hover:bg-[#A8B774]/25 border border-[#E6E1D5]'
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Popover */}
          <div className="pt-2.5 border-t border-[#E6E1D5] flex items-center justify-between">
            <span className="text-[10px] text-[#A19D94] italic leading-tight">
              Bisa ketik angka langsung di kotak
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 rounded-xl bg-[#2C4219] text-white text-xs font-bold hover:bg-[#1E2E11] transition-all shadow-xs"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
