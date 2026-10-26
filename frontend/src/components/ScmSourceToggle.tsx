import React from 'react';

export type ScmSource = 'real' | 'demo';

interface Props {
  value: ScmSource;
  onChange: (v: ScmSource) => void;
  dark?: boolean; // untuk header hijau (versi Lite)
}

/** Pilih sumber data SCM: data asli (real) atau data dummy (demo). */
export const ScmSourceToggle: React.FC<Props> = ({ value, onChange, dark }) => {
  const base = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all';
  const on = dark ? 'bg-white text-[#2C4219] shadow-xs' : 'bg-[#2C4219] text-white shadow-xs';
  const off = dark ? 'text-white/80 hover:text-white' : 'text-[#7A7062] hover:text-[#2C4219]';
  return (
    <div
      role="radiogroup"
      aria-label="Sumber data SCM"
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-full border ${dark ? 'bg-black/20 border-white/20' : 'bg-[#FAF6EE] border-[#E6E1D5]'}`}
    >
      {(['real', 'demo'] as ScmSource[]).map(v => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => value !== v && onChange(v)}
          className={`${base} ${value === v ? on : off}`}
          title={v === 'real' ? 'Data asli dari SCM LivingLabs' : 'Data dummy (contoh) untuk demo'}
        >
          {v === 'real' ? 'Data Real' : 'Data Dummy'}
        </button>
      ))}
    </div>
  );
};
