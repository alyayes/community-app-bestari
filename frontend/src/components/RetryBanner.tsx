import React, { useEffect, useState } from 'react';

// Banner "Gagal memuat data" + tombol Coba Lagi.
// App memberi status lewat event 'bestari:load-status' ({ failed: string[] }),
// tombol Coba Lagi memicu event 'bestari:retry' (App memuat ulang data tanpa refresh halaman).

export const LOAD_STATUS_EVENT = 'bestari:load-status';
export const RETRY_EVENT = 'bestari:retry';

export const RetryBanner: React.FC = () => {
  const [failed, setFailed] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onStatus = (e: Event) => {
      setFailed(((e as CustomEvent).detail?.failed as string[]) || []);
      setBusy(false);
    };
    window.addEventListener(LOAD_STATUS_EVENT, onStatus);
    return () => window.removeEventListener(LOAD_STATUS_EVENT, onStatus);
  }, []);

  if (failed.length === 0) return null;

  return (
    <div
      role="alert"
      className="fixed left-1/2 -translate-x-1/2 bottom-20 md:bottom-6 z-[10000] w-[calc(100%-2rem)] max-w-md bg-white border border-rose-200 shadow-xl rounded-2xl p-3.5 flex items-center gap-3"
    >
      <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 text-lg">!</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#2C4219]">Sebagian data gagal dimuat</p>
        <p className="text-[11px] text-[#7A7062] truncate">Periksa koneksi internet, lalu coba lagi.</p>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => { setBusy(true); window.dispatchEvent(new Event(RETRY_EVENT)); }}
        className="shrink-0 px-4 py-2 rounded-xl bg-[#2C4219] text-white text-xs font-bold hover:bg-[#1F3011] active:scale-95 transition-all disabled:opacity-60"
      >
        {busy ? 'Memuat...' : 'Coba Lagi'}
      </button>
    </div>
  );
};
