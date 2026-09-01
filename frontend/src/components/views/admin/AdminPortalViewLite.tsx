import React, { useState } from 'react';
import { UserProfile, InfoArticle, Announcement, ForumThread, AgendaEvent, LandPlot, HarvestRecord, CmsData } from '../../../types';
import { LayoutDashboard, FileText, Megaphone, MessageSquare, Users, Server, ShieldCheck, CheckCircle2, ChevronRight, X, Calendar, Award } from 'lucide-react';

interface AdminPortalViewLiteProps {
  currentUser: UserProfile;
  articles: InfoArticle[];
  announcements: Announcement[];
  threads: ForumThread[];
  agendas?: AgendaEvent[];
  landPlots: LandPlot[];
  harvestRecords: HarvestRecord[];
  members: any[];
  onLogout: () => void;
  setAppMode: (mode: 'lite' | 'pro') => void;
  dashboardStats?: { totalUsers?: number; totalRawMaterialKg?: number };
}

type AdminTab = 'dashboard' | 'agenda' | 'sertifikat' | 'informasi' | 'pengumuman' | 'moderation' | 'datasorgum' | 'users' | 'cms';

export const AdminPortalViewLite: React.FC<AdminPortalViewLiteProps> = ({
  currentUser,
  articles,
  announcements,
  threads,
  agendas = [],
  landPlots,
  harvestRecords,
  members,
  onLogout,
  setAppMode,
  dashboardStats
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Kelola Agenda', icon: Calendar },
    { id: 'sertifikat', label: 'Kelola Sertifikat', icon: Award },
    { id: 'informasi', label: 'Berita & Info', icon: FileText },
    { id: 'pengumuman', label: 'Pengumuman', icon: Megaphone },
    { id: 'moderation', label: 'Moderasi Diskusi', icon: MessageSquare },
    { id: 'datasorgum', label: 'Data Sorgum', icon: Server },
    { id: 'users', label: 'Daftar Pengguna', icon: Users },
    { id: 'cms', label: 'Kelola Tampilan', icon: ShieldCheck },
  ] as const;

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-[#FAF6EE] p-6 rounded-3xl border-2 border-[#E6E1D5]">
        <h2 className="text-3xl font-bold text-[#2C4219] mb-2">Halo Admin, {currentUser.name}!</h2>
        <p className="text-lg text-[#433A30]">Pilih menu di samping atau tombol di bawah untuk mengelola aplikasi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border-2 border-[#E6E1D5] flex flex-col items-center justify-center text-center shadow-sm">
          <Users className="w-12 h-12 text-[#2C4219] mb-3" />
          <h3 className="text-5xl font-black text-[#2C4219]">{dashboardStats?.totalUsers || members.length}</h3>
          <p className="text-lg font-bold text-[#433A30] mt-2">Total Pengguna</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-[#E6E1D5] flex flex-col items-center justify-center text-center shadow-sm">
          <Calendar className="w-12 h-12 text-[#2C4219] mb-3" />
          <h3 className="text-5xl font-black text-[#2C4219]">{agendas.length}</h3>
          <p className="text-lg font-bold text-[#433A30] mt-2">Total Agenda</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-[#E6E1D5] flex flex-col items-center justify-center text-center shadow-sm">
          <Server className="w-12 h-12 text-[#2C4219] mb-3" />
          <h3 className="text-5xl font-black text-[#2C4219]">{dashboardStats?.totalRawMaterialKg || harvestRecords.reduce((s, r) => s + r.yieldKg, 0)}</h3>
          <p className="text-lg font-bold text-[#433A30] mt-2">Total Panen (Kg)</p>
        </div>
      </div>
    </div>
  );

  const renderSimpleList = (items: any[], titleField: string, subtitleField: string) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-[#FAF6EE] p-6 rounded-3xl border-2 border-[#E6E1D5]">
        <h2 className="text-2xl font-bold text-[#2C4219]">Data {TABS.find(t => t.id === activeTab)?.label}</h2>
        <button 
          onClick={() => setAppMode('pro')}
          className="bg-[#2C4219] text-white px-6 py-3 rounded-xl font-bold text-lg active:scale-95"
        >
          Tambah / Kelola (Mode Pro)
        </button>
      </div>

      <div className="space-y-4">
        {items.length > 0 ? items.map((item, idx) => (
          <div key={item.id || idx} className="bg-white p-6 rounded-3xl border-2 border-[#E6E1D5] flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2C4219]">{item[titleField]}</h3>
              <p className="text-lg text-[#433A30]/80 mt-1">{item[subtitleField] || 'Tidak ada detail'}</p>
            </div>
            <button className="p-3 bg-[#FAF6EE] rounded-full active:scale-95">
              <ChevronRight className="w-6 h-6 text-[#2C4219]" />
            </button>
          </div>
        )) : (
          <p className="text-center p-8 text-xl text-[#433A30]/50 border-2 border-dashed border-[#E6E1D5] rounded-3xl">Data kosong atau belum tersedia.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex">
      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-80 bg-white border-r-2 border-[#E6E1D5] z-50 transform transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b-2 border-[#E6E1D5] flex justify-between items-center shrink-0">
          <div className="font-title font-black text-2xl text-[#2C4219]">Admin Lite</div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 bg-[#FAF6EE] rounded-xl"><X className="w-6 h-6 text-[#2C4219]" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-colors ${activeTab === tab.id ? 'bg-[#2C4219] text-white' : 'hover:bg-[#FAF6EE] text-[#433A30]'}`}
            >
              <tab.icon className="w-6 h-6" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t-2 border-[#E6E1D5] shrink-0 space-y-4">
          <button onClick={() => setAppMode('pro')} className="w-full flex flex-col items-center p-4 bg-[#1E2E11] text-white rounded-2xl font-bold">
            <span className="text-lg">Beralih ke Pro Mode</span>
            <span className="text-xs opacity-70">Untuk fitur lengkap</span>
          </button>
          <button onClick={onLogout} className="w-full py-4 text-red-600 font-bold text-lg rounded-2xl hover:bg-red-50">Keluar (Logout)</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        <header className="bg-white border-b-2 border-[#E6E1D5] p-4 lg:p-6 sticky top-0 z-30 flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-[#FAF6EE] rounded-xl">
            <LayoutDashboard className="w-6 h-6 text-[#2C4219]" />
          </button>
          <h1 className="text-2xl font-black text-[#2C4219] flex-1">{TABS.find(t => t.id === activeTab)?.label}</h1>
        </header>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'agenda' && renderSimpleList(agendas, 'title', 'date')}
          {activeTab === 'sertifikat' && renderSimpleList(agendas.filter(a => a.status === 'Selesai'), 'title', 'date')}
          {activeTab === 'informasi' && renderSimpleList(articles, 'title', 'category')}
          {activeTab === 'pengumuman' && renderSimpleList(announcements, 'title', 'category')}
          {activeTab === 'moderation' && renderSimpleList(threads, 'title', 'author')}
          {activeTab === 'datasorgum' && renderSimpleList(harvestRecords, 'date', 'farmerName')}
          {activeTab === 'users' && renderSimpleList(members, 'name', 'role')}
          {activeTab === 'cms' && (
            <div className="text-center p-12 bg-white rounded-3xl border-2 border-[#E6E1D5]">
              <ShieldCheck className="w-16 h-16 text-[#2C4219] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#2C4219] mb-4">Pengaturan Tampilan</h2>
              <p className="text-lg text-[#433A30] mb-8">Fitur pengaturan *landing page* dan konfigurasi lanjutan hanya dapat diakses melalui Pro Mode.</p>
              <button onClick={() => setAppMode('pro')} className="bg-[#2C4219] text-white px-8 py-4 rounded-xl font-bold text-xl active:scale-95">Buka Pro Mode</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
