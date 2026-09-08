import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

interface IndonesianTimePickerProps {
  value: string; // e.g. "09:00"
  onChange: (time24: string) => void;
  disabled?: boolean;
  className?: string;
}

const PERIODS = [
  { label: 'Pagi', value: 'Pagi' },
  { label: 'Siang', value: 'Siang' },
  { label: 'Sore', value: 'Sore' },
  { label: 'Malam', value: 'Malam' }
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
  if (h < 1) h = 1;
  if (h > 12) h = 12;
  const m = (minuteStr || '00').padStart(2, '0');

  if (period === 'Pagi') {
    if (h === 12) h = 0;
  } else if (period === 'Siang') {
    if (h < 11) h += 12;
  } else if (period === 'Sore') {
    if (h < 12) h += 12;
  } else if (period === 'Malam') {
    if (h < 12) h += 12;
    else if (h === 12) h = 0;
  }

  return `${String(h).padStart(2, '0')}:${m}`;
};

export const IndonesianTimePicker: React.FC<IndonesianTimePickerProps> = ({
  value,
  onChange,
  disabled = false,
  className = ''
}) => {
  const { hour, minute, period } = to12HourPeriod(value);
  const [hourInput, setHourInput] = useState(hour);
  const [minuteInput, setMinuteInput] = useState(minute);

  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHourInput(hour);
    setMinuteInput(minute);
  }, [hour, minute]);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setHourInput(val);

    if (val.length === 2) {
      let num = parseInt(val, 10);
      if (num < 1) num = 1;
      if (num > 12) num = 12;
      const formatted = String(num).padStart(2, '0');
      setHourInput(formatted);
      onChange(to24Hour(formatted, minuteInput || minute, period));
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const handleHourBlur = () => {
    let num = parseInt(hourInput || '9', 10);
    if (isNaN(num) || num < 1) num = 1;
    if (num > 12) num = 12;
    const formatted = String(num).padStart(2, '0');
    setHourInput(formatted);
    onChange(to24Hour(formatted, minuteInput || minute, period));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2);
    setMinuteInput(val);

    if (val.length === 2) {
      let num = parseInt(val, 10);
      if (num < 0) num = 0;
      if (num > 59) num = 59;
      const formatted = String(num).padStart(2, '0');
      setMinuteInput(formatted);
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
      onChange(to24Hour(formatted, minuteInput || minute, period));
    } else if (e.key === 'Enter') {
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

  const handleContainerClick = (e: React.MouseEvent) => {
    if (e.target !== minuteRef.current && (e.target as HTMLElement).tagName !== 'SELECT') {
      hourRef.current?.focus();
      hourRef.current?.select();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className={`h-11 px-3 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl inline-flex items-center justify-between gap-2 text-xs font-semibold transition-all cursor-text shrink-0 w-[185px] sm:w-[195px] whitespace-nowrap select-none ${
        disabled
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:border-[#2C4219]/40 focus-within:border-[#2C4219] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2C4219]/10 shadow-xs'
      } ${className}`}
    >
      <div className="flex items-center gap-1 text-[#2C4219] shrink-0">
        {/* Input Jam */}
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
          className="w-7 text-center font-bold text-xs text-[#2C4219] bg-transparent p-0 m-0 border-0 outline-none leading-none focus:outline-none shrink-0"
        />

        <span className="font-bold text-[#7A7062] select-none shrink-0">:</span>

        {/* Input Menit */}
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

      {/* Clock icon on the right */}
      <Clock className="w-4 h-4 text-[#7A7062] shrink-0 pointer-events-none ml-1" />
    </div>
  );
};
