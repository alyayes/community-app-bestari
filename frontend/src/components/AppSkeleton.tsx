import React from 'react';

/** Kerangka tampilan saat aplikasi pertama kali memuat data (menggantikan spinner polos). */
export const AppSkeleton: React.FC = () => {
  const bar = 'bg-[#E6E1D5] rounded-lg animate-pulse';
  return (
    <div className="min-h-screen bg-[#FAF6EE] flex" aria-busy="true" aria-label="Memuat aplikasi">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-4 p-5 bg-white border-r border-[#E6E1D5]">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full ${bar}`} />
          <div className="flex-1 space-y-2">
            <div className={`h-3.5 w-3/4 ${bar}`} />
            <div className={`h-2.5 w-1/2 ${bar}`} />
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className={`h-9 w-full rounded-full ${bar}`} />)}
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className={`h-7 w-48 sm:w-72 ${bar}`} />
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full ${bar}`} />
            <div className={`h-8 w-28 rounded-full ${bar}`} />
          </div>
        </div>
        {/* Banner */}
        <div className={`h-36 sm:h-44 w-full rounded-3xl ${bar}`} />
        {/* Kartu */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-[#E6E1D5] p-4 space-y-3">
              <div className={`h-32 w-full rounded-2xl ${bar}`} />
              <div className={`h-3.5 w-4/5 ${bar}`} />
              <div className={`h-3 w-3/5 ${bar}`} />
            </div>
          ))}
        </div>
        <p className="text-center text-xs font-semibold text-[#7A7062]">Memuat data...</p>
      </main>
    </div>
  );
};
