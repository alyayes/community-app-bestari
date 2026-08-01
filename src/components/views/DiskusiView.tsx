import React, { useState, useRef, useEffect } from 'react';
import { ForumThread, ForumComment, UserProfile } from '../../types';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Trash2, 
  Send, 
  Paperclip, 
  Smile, 
  Users, 
  X, 
  CheckCheck, 
  CornerDownRight, 
  Filter, 
  Heart,
  ShieldCheck,
  Sparkles,
  Settings,
  Upload,
  AlertCircle,
  Lock
} from 'lucide-react';

interface DiskusiViewProps {
  threads: ForumThread[];
  currentUser: UserProfile;
  onOpenCreateModal: () => void;
  onToggleLikeThread: (threadId: string) => void;
  onAddComment: (threadId: string, parentCommentId: string | null, content: string) => void;
  onDeleteThread: (threadId: string) => void;
  onUpdateThread: (updatedThread: ForumThread) => void;
}

export const DiskusiView: React.FC<DiskusiViewProps> = ({
  threads,
  currentUser,
  onOpenCreateModal,
  onToggleLikeThread,
  onAddComment,
  onDeleteThread,
  onUpdateThread,
}) => {
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua Topik');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active chat group selection state
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.id || '');
  
  // Quoted reply state inside chat
  const [quotedComment, setQuotedComment] = useState<{ id: string; authorName: string; text: string } | null>(null);
  
  // Message input state
  const [inputMessage, setInputMessage] = useState<string>('');
  
  // Show emoji picker dummy state
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  // Moderation modal state
  const [threadToDelete, setThreadToDelete] = useState<ForumThread | null>(null);

  // Chat scroll container ref
  const chatStreamRef = useRef<HTMLDivElement>(null);

  // Edit group settings states
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editGroupAvatar, setEditGroupAvatar] = useState<string | null>(null);
  const [editAllowMemberMessages, setEditAllowMemberMessages] = useState<boolean>(true);
  const [editErrorMsg, setEditErrorMsg] = useState<string>('');
  const editAvatarInputRef = useRef<HTMLInputElement | null>(null);

  // Ensure activeThreadId points to valid thread
  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId]);

  // Auto-scroll chat stream to bottom when active thread or messages change
  useEffect(() => {
    if (chatStreamRef.current) {
      chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
    }
  }, [activeThreadId, threads]);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const categoryOptions = [
    { name: 'Semua Topik', label: '💬 Semua Topik' },
    { name: 'Produksi & Pengolahan', label: '🥣 Produksi & Pengolahan' },
    { name: 'Budidaya Lahan', label: '🌾 Budidaya Lahan' },
    { name: 'Pemasaran & UMKM', label: '🛍️ Pemasaran & UMKM' },
    { name: 'Informasi Umum', label: '📢 Informasi Umum' }
  ];

  const filteredThreads = threads.filter(t => {
    const matchesCategory = 
      selectedCategory === 'Semua Topik' || 
      t.category === selectedCategory ||
      (selectedCategory === 'Produksi & Pengolahan' && t.category.includes('Produksi')) ||
      (selectedCategory === 'Budidaya Lahan' && t.category.includes('Budidaya')) ||
      (selectedCategory === 'Pemasaran & UMKM' && t.category.includes('Pemasaran')) ||
      (selectedCategory === 'Informasi Umum' && (t.category.includes('Umum') || t.category.includes('Informasi')));

    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.authorName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeThread) return;

    onAddComment(
      activeThread.id, 
      quotedComment ? quotedComment.id : null, 
      inputMessage.trim()
    );

    setInputMessage('');
    setQuotedComment(null);
    setShowEmojiPicker(false);
  };

  const sampleEmojis = ['😊', '🌾', '🥣', '👍', '🙏', '👏', '❤️', '🔥', '✨', '📦'];

  const handleAddEmoji = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const getCategoryEmoji = (category: string) => {
    if (category.includes('Produksi')) return '🥣';
    if (category.includes('Budidaya')) return '🌾';
    if (category.includes('Pemasaran')) return '🛍️';
    return '📢';
  };

  const canDeleteThread = (thread: ForumThread) => {
    return (
      currentUser.isAdmin || 
      currentUser.role === 'Administrator' || 
      currentUser.role?.toLowerCase().includes('admin') || 
      currentUser.role?.toLowerCase().includes('ketua') || 
      currentUser.name === thread.authorName
    );
  };

  const canSendMessage = (thread: ForumThread) => {
    if (thread.allowMemberMessages !== false) return true;
    return (
      currentUser.isAdmin || 
      currentUser.role === 'Administrator' || 
      currentUser.role?.toLowerCase().includes('admin') || 
      currentUser.role?.toLowerCase().includes('ketua') || 
      currentUser.name === thread.authorName
    );
  };

  const hasJoined = (thread: ForumThread) => {
    if (!thread.joinedMembers) return true;
    return thread.joinedMembers.includes(currentUser.name);
  };

  const handleJoinGroup = () => {
    if (!activeThread) return;
    
    const systemComment: ForumComment = {
      id: `c_sys_${Date.now()}`,
      authorName: 'Sistem',
      authorAvatar: '',
      timeAgo: 'Baru saja',
      content: `🎉 Ibu ${currentUser.name} telah bergabung ke dalam grup.`,
      likes: 0,
      userLiked: false
    };

    const updatedThread: ForumThread = {
      ...activeThread,
      joinedMembers: [...(activeThread.joinedMembers || []), currentUser.name],
      comments: [...activeThread.comments, systemComment]
    };

    onUpdateThread(updatedThread);
  };

  const handleOpenEditModal = () => {
    if (!activeThread) return;
    setEditTitle(activeThread.title);
    setEditDescription(activeThread.content);
    setEditCategory(activeThread.category);
    setEditGroupAvatar(activeThread.groupAvatar || null);
    setEditAllowMemberMessages(activeThread.allowMemberMessages !== false);
    setEditErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match('image/(jpeg|jpg|png)')) {
        setEditErrorMsg('Foto profil grup harus berupa gambar JPG, JPEG, atau PNG.');
        return;
      }
      setEditErrorMsg('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditGroupAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveEditAvatar = () => {
    setEditGroupAvatar(null);
    if (editAvatarInputRef.current) {
      editAvatarInputRef.current.value = '';
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDescription.trim()) {
      setEditErrorMsg('Nama grup dan deskripsi tidak boleh kosong.');
      return;
    }

    const updatedThread: ForumThread = {
      ...activeThread,
      title: editTitle.trim(),
      content: editDescription.trim(),
      summary: editDescription.trim().slice(0, 100) + '...',
      category: editCategory as any,
      groupAvatar: editGroupAvatar || undefined,
      allowMemberMessages: editAllowMemberMessages
    };

    onUpdateThread(updatedThread);
    setIsEditModalOpen(false);
  };

  return (
    <div className="w-full h-[calc(100vh-100px)] min-h-[580px] flex flex-col font-sans">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border border-[#E6E1D5] rounded-2xl bg-white shadow-xs flex-1 overflow-hidden">

        {/* ========================================================================= */}
        {/* LEFT SIDEBAR: Group Chats / Topics Navigation                             */}
        {/* ========================================================================= */}
        <div className="md:col-span-5 lg:col-span-4 border-r border-[#E6E1D5] flex flex-col bg-[#FAF8F3] h-full overflow-hidden">
          
          {/* Header Bar */}
          <div className="p-3.5 sm:p-4 bg-white border-b border-[#E6E1D5] space-y-3 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#2C4219] text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-[#A8B774]" />
                </div>
                <div>
                  <h1 className="font-title font-bold text-sm text-[#2C4219] leading-none">
                    Diskusi Komunitas
                  </h1>
                  <span className="text-[10px] text-[#433A30]/60 font-medium">KWT Melati Sorgum</span>
                </div>
              </div>
            </div>

            {/* Search Input, Big Button, & Category Selector */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#433A30]/40" />
                <input
                  type="text"
                  placeholder="Cari topik diskusi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs text-[#433A30] placeholder-[#433A30]/40 focus:outline-none focus:border-[#2C4219]"
                />
              </div>

              {/* Big, Very Visible Group Creation Button */}
              <button
                onClick={onOpenCreateModal}
                className="w-full py-3 px-4 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
              >
                <Plus className="w-4.5 h-4.5 text-[#A8B774] stroke-[3.5]" />
                <span>BUAT GRUP BARU</span>
              </button>

              {/* Category Dropdown Selector */}
              <div className="relative pt-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-[#A8B774] bg-[#FAF6EE] text-[#2C4219] font-black text-xs sm:text-sm focus:outline-none focus:border-[#2C4219] transition-all cursor-pointer shadow-xs appearance-none pr-10"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat.name} value={cat.name} className="font-bold text-[#433A30] bg-[#FAF8F3]">
                      {cat.label}
                    </option>
                  ))}
                </select>
                {/* Custom indicator arrow for select */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pt-1 text-[#2C4219]">
                  <Filter className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Group Chat List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E6E1D5]/50 custom-scrollbar">
            {filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => {
                const isActive = activeThread?.id === thread.id;
                const lastComment = thread.comments[thread.comments.length - 1];
                const lastMessageText = lastComment ? lastComment.content : thread.summary;
                const lastTime = lastComment ? lastComment.timeAgo : thread.timeAgo;
                const emoji = getCategoryEmoji(thread.category);

                return (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      setQuotedComment(null);
                    }}
                    className={`p-3 sm:p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-[#E3EAD3] border-l-4 border-[#2C4219] shadow-xs' 
                        : 'hover:bg-white/60'
                    }`}
                  >
                    {thread.groupAvatar ? (
                      <img
                        src={thread.groupAvatar}
                        alt={thread.title}
                        className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-2xs border border-[#E6E1D5]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] flex items-center justify-center text-base shrink-0 shadow-2xs">
                        {emoji}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h3 className={`font-title text-xs font-bold truncate ${isActive ? 'text-[#2C4219]' : 'text-[#433A30]'}`}>
                          {thread.title}
                        </h3>
                        <span className="text-[10px] text-[#433A30]/50 font-medium shrink-0">
                          {lastTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#433A30]/70 line-clamp-1 font-normal mb-1">
                        {lastComment ? `${lastComment.authorName}: ${lastMessageText}` : lastMessageText}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold text-[#2C4219] bg-[#A8B774]/20 px-1.5 py-0.5 rounded">
                          {thread.category}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#2C4219]/10 text-[#2C4219]">
                          {thread.comments.length + 1} pesan
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-1.5">
                <MessageSquare className="w-7 h-7 text-[#A8B774] mx-auto opacity-70" />
                <p className="font-title font-bold text-xs text-[#2C4219]">Tidak ada topik ditemukan</p>
                <p className="text-[11px] text-[#433A30]/60">Coba ubah kata kunci atau buat grup baru.</p>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="px-3 py-2 bg-white border-t border-[#E6E1D5] flex items-center justify-between text-[10px] text-[#433A30]/60 font-semibold shrink-0">
            <span>{threads.length} Grup Diskusi</span>
            <span className="text-[#2C4219] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#2C4219]" /> Validasi KWT
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT STREAM AREA: Active Group Chat                                      */}
        {/* ========================================================================= */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col bg-[#FAF6EE]/50 h-full overflow-hidden">
          
          {activeThread ? (
            <>
              {/* Group Chat Top Header */}
              <div className="px-4 py-3 bg-white border-b border-[#E6E1D5] flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {activeThread.groupAvatar ? (
                    <img
                      src={activeThread.groupAvatar}
                      alt={activeThread.title}
                      className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-2xs border border-[#2C4219]/20"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-[#2C4219] text-white flex items-center justify-center text-base font-bold shrink-0 shadow-2xs">
                      {getCategoryEmoji(activeThread.category)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-title font-bold text-xs sm:text-sm text-[#2C4219] truncate">
                        {activeThread.title}
                      </h2>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#A8B774]/20 text-[#2C4219] shrink-0 hidden sm:inline">
                        {activeThread.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#433A30]/60 font-medium truncate flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#2C4219] shrink-0" />
                      <span>
                        {activeThread.joinedMembers 
                          ? activeThread.joinedMembers.length 
                          : (activeThread.comments.length + 3)
                        } Anggota KWT • Aktif
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleLikeThread(activeThread.id)}
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeThread.userLiked 
                        ? 'bg-[#572E4A]/10 text-[#572E4A] border-[#572E4A]/30' 
                        : 'bg-[#FAF6EE] text-[#433A30] border-[#E6E1D5] hover:bg-[#E6E1D5]/50'
                    }`}
                    title="Sukai Topik"
                  >
                    <Heart className={`w-3.5 h-3.5 ${activeThread.userLiked ? 'fill-[#572E4A] text-[#572E4A]' : ''}`} />
                    <span>{activeThread.likes}</span>
                  </button>

                  {canDeleteThread(activeThread) && (
                    <>
                      <button
                        onClick={handleOpenEditModal}
                        className="p-1.5 rounded-xl bg-[#2C4219]/10 text-[#2C4219] hover:bg-[#2C4219]/20 border border-[#2C4219]/20 transition-all flex items-center justify-center"
                        title="Pengaturan Grup"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setThreadToDelete(activeThread)}
                        className="p-1.5 rounded-xl bg-[#C53030]/10 text-[#C53030] hover:bg-[#C53030]/20 border border-[#C53030]/20 transition-all flex items-center justify-center"
                        title="Hapus Grup Chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {!hasJoined(activeThread) ? (
                /* LARGE PREVIEW JOIN SCREEN */
                <div className="flex-1 flex flex-col items-center justify-center bg-[#FAF6EE]/40 p-8 sm:p-12 text-center space-y-6 animate-in fade-in duration-300">
                  <div className="w-24 h-24 rounded-3xl bg-[#2C4219]/10 text-[#2C4219] flex items-center justify-center shadow-md border border-[#2C4219]/15 shrink-0">
                    {activeThread.groupAvatar ? (
                      <img 
                        src={activeThread.groupAvatar} 
                        alt={activeThread.title} 
                        className="w-full h-full object-cover rounded-3xl shadow-xs"
                      />
                    ) : (
                      <span className="text-5xl">{getCategoryEmoji(activeThread.category)}</span>
                    )}
                  </div>

                  <div className="space-y-3 max-w-md">
                    <h3 className="font-title font-extrabold text-xl sm:text-2xl text-[#2C4219] leading-tight">
                      Gabung ke Komunitas "{activeThread.title}"
                    </h3>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-xs font-bold text-[#2C4219] bg-[#A8B774]/30 px-3 py-1 rounded-full">
                        {activeThread.category}
                      </span>
                      <span className="text-xs font-bold text-[#433A30]/60 bg-[#E6E1D5]/50 px-3 py-1 rounded-full">
                        👥 {activeThread.joinedMembers ? activeThread.joinedMembers.length : 3} Anggota
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#433A30]/70 leading-relaxed font-semibold max-h-24 overflow-y-auto px-2">
                      {activeThread.content}
                    </p>
                  </div>

                  <button
                    onClick={handleJoinGroup}
                    className="px-10 py-4.5 rounded-full bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-black text-sm sm:text-base flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-lg border border-[#A8B774]/20 cursor-pointer"
                  >
                    <Plus className="w-5 h-5 text-[#A8B774] stroke-[3]" />
                    <span>GABUNG KOMUNITAS SEKARANG</span>
                  </button>
                </div>
              ) : (
                /* CHAT HISTORY & INPUT FOOTER */
                <>
                  {/* Chat Message Stream */}
                  <div 
                    ref={chatStreamRef}
                    className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar bg-[#FAF6EE]/10"
                  >
                    {/* Date / Security Notice */}
                    <div className="text-center my-1">
                      <span className="px-2.5 py-1 rounded-full bg-white/80 border border-[#E6E1D5] text-[10px] text-[#433A30]/70 font-medium shadow-2xs inline-block">
                        Pesan terenkripsi internal KWT Melati Sorgum
                      </span>
                    </div>

                    {/* 1. Starter Post / Broadcast Announcement */}
                    <div className="flex flex-col items-start space-y-1 max-w-[88%] sm:max-w-[78%]">
                      <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border border-[#E6E1D5] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between gap-3 border-b border-[#E6E1D5]/50 pb-1.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={activeThread.authorAvatar}
                              alt={activeThread.authorName}
                              className="w-6 h-6 rounded-full object-cover border border-[#2C4219]/20"
                            />
                            <div>
                              <p className="font-title font-bold text-xs text-[#2C4219]">{activeThread.authorName}</p>
                              {activeThread.authorRole && (
                                <span className="text-[9px] text-[#2C4219] font-semibold">
                                  {activeThread.authorRole}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-[#433A30]/50 font-medium">{activeThread.timeAgo}</span>
                        </div>

                        <p className="text-xs sm:text-sm text-[#433A30] leading-relaxed whitespace-pre-line">
                          {activeThread.content}
                        </p>

                        {activeThread.images && activeThread.images.length > 0 && (
                          <div className={`grid ${activeThread.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2 pt-1`}>
                            {activeThread.images.map((img, idx) => (
                              <img 
                                key={idx} 
                                src={img} 
                                alt="Lampiran" 
                                className={`rounded-xl object-cover border border-[#E6E1D5] ${
                                  activeThread.images!.length === 1 
                                    ? 'max-h-64 w-auto max-w-full' 
                                    : 'h-28 w-full'
                                }`} 
                              />
                            ))}
                          </div>
                        )}

                        <div className="pt-1.5 flex items-center justify-between text-[10px] border-t border-[#E6E1D5]/50">
                          {hasJoined(activeThread) ? (
                            <button
                              onClick={() => setQuotedComment({ id: activeThread.id, authorName: activeThread.authorName, text: activeThread.content })}
                              className="font-bold text-[#2C4219] hover:underline flex items-center gap-1"
                            >
                              <CornerDownRight className="w-3 h-3" />
                              <span>Balas pesan ini</span>
                            </button>
                          ) : (
                            <span className="text-[#433A30]/40 font-medium flex items-center gap-1">
                              <Lock className="w-3 h-3 text-[#433A30]/40" /> Gabung untuk membalas
                            </span>
                          )}
                          <span className="text-[#433A30]/40 font-medium">Pengumuman Utama</span>
                        </div>
                      </div>
                    </div>

                    {!hasJoined(activeThread) ? (
                      /* SIMULATED BLURRED FEED & LOCK PROMPT */
                      <div className="space-y-4 pt-2">
                        {/* Simulated Blurred Comments */}
                        <div className="space-y-3 opacity-20 select-none pointer-events-none blur-xs">
                          {/* Blurred Comment 1 */}
                          <div className="flex flex-col items-start space-y-1 max-w-[70%]">
                            <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border border-[#E6E1D5] w-full space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-gray-300" />
                                <div className="w-16 h-3 bg-gray-300 rounded" />
                              </div>
                              <div className="w-full h-3 bg-gray-200 rounded" />
                              <div className="w-4/5 h-3 bg-gray-200 rounded" />
                            </div>
                          </div>
                          {/* Blurred Comment 2 */}
                          <div className="flex flex-col items-end space-y-1 w-full">
                            <div className="bg-[#E3EAD3] p-3.5 rounded-2xl rounded-tr-xs border border-[#2C4219]/10 max-w-[70%] w-full space-y-2">
                              <div className="flex items-center gap-2 justify-end">
                                <div className="w-16 h-3 bg-[#2C4219]/20 rounded" />
                                <div className="w-5 h-5 rounded-full bg-[#2C4219]/20" />
                              </div>
                              <div className="w-full h-3 bg-[#2C4219]/15 rounded" />
                              <div className="w-5/6 h-3 bg-[#2C4219]/15 rounded" />
                            </div>
                          </div>
                        </div>

                        {/* Centered Join Prompt Card */}
                        <div className="bg-white/95 border-2 border-[#A8B774] rounded-2xl p-6 text-center shadow-md max-w-sm mx-auto space-y-4 animate-in zoom-in-95 duration-300 relative z-10 -mt-20">
                          <div className="w-12 h-12 rounded-full bg-[#2C4219]/10 text-[#2C4219] flex items-center justify-center mx-auto">
                            <Lock className="w-5 h-5 text-[#2C4219]" />
                          </div>
                          <div className="space-y-1.5">
                            <h4 className="font-title font-bold text-sm text-[#2C4219]">Diskusi Komunitas Terkunci</h4>
                            <p className="text-[11px] text-[#433A30]/80 leading-relaxed font-semibold">
                              Ada {activeThread.comments.length} komentar dari ibu-ibu anggota tani di topik ini. Gabung sekarang untuk membaca percakapan lengkap dan ikut berdiskusi.
                            </p>
                          </div>
                          <button
                            onClick={handleJoinGroup}
                            className="w-full py-2.5 rounded-full bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
                          >
                            <Plus className="w-4 h-4 text-[#A8B774] stroke-[3]" />
                            <span>GABUNG KOMUNITAS SEKARANG</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* 2. Chat Comments Stream */}
                        {activeThread.comments.map((comment) => {
                          const isSystem = comment.authorName === 'Sistem';
                          if (isSystem) {
                            return (
                              <div key={comment.id} className="w-full flex justify-center my-1.5 animate-in fade-in zoom-in-95 duration-300">
                                <span className="px-3.5 py-1.5 rounded-full bg-[#E3EAD3]/40 border border-[#A8B774]/30 text-[10px] sm:text-xs text-[#2C4219] font-bold shadow-3xs inline-block">
                                  {comment.content}
                                </span>
                              </div>
                            );
                          }

                          const isMe = comment.authorName === currentUser.name || comment.authorName.includes('Anda');

                          return (
                            <div
                              key={comment.id}
                              className={`flex flex-col space-y-1 ${isMe ? 'items-end' : 'items-start'}`}
                            >
                              <div 
                                className={`p-3 rounded-2xl shadow-2xs space-y-1 max-w-[85%] sm:max-w-[75%] border transition-all ${
                                  isMe 
                                    ? 'bg-[#E3EAD3] border-[#2C4219]/15 text-[#1E2E11] rounded-tr-xs' 
                                    : 'bg-white border-[#E6E1D5] text-[#433A30] rounded-tl-xs'
                                }`}
                              >
                                {/* Member Name */}
                                <div className="flex items-center justify-between gap-3 text-[10px] mb-0.5">
                                  <div className="flex items-center gap-1.5">
                                    {!isMe && (
                                      <img
                                        src={comment.authorAvatar}
                                        alt={comment.authorName}
                                        className="w-4 h-4 rounded-full object-cover border border-[#2C4219]/20"
                                      />
                                    )}
                                    <span className="font-title font-bold text-xs text-[#2C4219]">
                                      {isMe ? 'Anda' : comment.authorName}
                                    </span>
                                    {comment.authorRole && (
                                      <span className="text-[9px] text-[#2C4219]/80 font-semibold">
                                        ({comment.authorRole})
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-[#433A30]/50 font-medium">{comment.timeAgo}</span>
                                </div>

                                {/* Message Body */}
                                <p className="text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-line">
                                  {comment.content}
                                </p>

                                {/* Footer / Reply link */}
                                <div className="flex items-center justify-between pt-1 text-[10px] border-t border-black/5">
                                  <button
                                    onClick={() => setQuotedComment({ id: comment.id, authorName: comment.authorName, text: comment.content })}
                                    className="text-[#2C4219] font-bold hover:underline flex items-center gap-1"
                                  >
                                    <CornerDownRight className="w-3 h-3" />
                                    <span>Balas</span>
                                  </button>
                                </div>
                              </div>

                              {/* Render replies */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="pl-6 sm:pl-8 space-y-2 mt-1.5 w-full flex flex-col items-start">
                                  {comment.replies.map((reply) => {
                                    const isReplyMe = reply.authorName === currentUser.name || reply.authorName.includes('Anda');
                                    return (
                                      <div 
                                        key={reply.id} 
                                        className={`flex flex-col space-y-1 w-full ${isReplyMe ? 'items-end' : 'items-start'} animate-in fade-in duration-200`}
                                      >
                                        <div 
                                          className={`p-2.5 rounded-xl shadow-3xs space-y-1 max-w-[85%] border text-xs ${
                                            isReplyMe 
                                              ? 'bg-[#E3EAD3] border-[#2C4219]/15 text-[#1E2E11] rounded-tr-xs' 
                                              : 'bg-white border-[#E6E1D5] text-[#433A30] rounded-tl-xs'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between gap-3 text-[9px] mb-0.5">
                                            <div className="flex items-center gap-1">
                                              <span className="font-title font-bold text-[#2C4219]">
                                                {isReplyMe ? 'Anda' : reply.authorName}
                                              </span>
                                              {reply.authorRole && (
                                                <span className="text-[8px] text-[#2C4219]/70 font-semibold">
                                                  ({reply.authorRole})
                                                </span>
                                              )}
                                            </div>
                                            <span className="text-[#433A30]/50 font-medium">{reply.timeAgo}</span>
                                          </div>
                                          <p className="whitespace-pre-line leading-relaxed text-[11px] sm:text-xs font-normal">
                                            {reply.content}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {/* Message Input Footer Bar */}
                  {hasJoined(activeThread) && (
                    <>
                      {/* Quoted Message Preview Bar */}
                      {quotedComment && (
                        <div className="p-2 px-4 bg-[#E3EAD3] border-t border-[#E6E1D5] flex items-center justify-between gap-2 shrink-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <CornerDownRight className="w-3.5 h-3.5 text-[#2C4219] shrink-0" />
                            <div className="min-w-0 text-xs">
                              <span className="font-bold text-[#2C4219]">Membalas {quotedComment.authorName}:</span>
                              <p className="text-[11px] text-[#433A30]/70 truncate">{quotedComment.text}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setQuotedComment(null)}
                            className="p-1 rounded-lg hover:bg-white text-[#433A30]/70 transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Emoji Quick Picker Overlay */}
                      {showEmojiPicker && (
                        <div className="p-2 bg-white border border-[#E6E1D5] rounded-xl shadow-lg flex items-center gap-1.5 overflow-x-auto mx-4 my-1 shrink-0 z-10">
                          {sampleEmojis.map((e, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAddEmoji(e)}
                              className="p-1.5 text-base hover:bg-[#FAF6EE] rounded-lg transition-transform active:scale-125"
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}

                      {canSendMessage(activeThread) ? (
                        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#E6E1D5] flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 rounded-xl bg-[#FAF6EE] text-[#433A30] hover:bg-[#E6E1D5] transition-colors"
                            title="Pilih Emoji"
                          >
                            <Smile className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => alert('Fitur unggah foto/lampiran dokumen kelompok tani.')}
                            className="p-2 rounded-xl bg-[#FAF6EE] text-[#433A30] hover:bg-[#E6E1D5] transition-colors"
                            title="Lampirkan File/Foto"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>

                          <input
                            type="text"
                            placeholder="Ketik pesan..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            className="flex-1 py-2 px-3.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs sm:text-sm text-[#433A30] placeholder-[#433A30]/40 focus:outline-none focus:border-[#2C4219] font-medium"
                          />

                          <button
                            type="submit"
                            disabled={!inputMessage.trim()}
                            className="w-9 h-9 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-2xs shrink-0 active:scale-95"
                            title="Kirim Pesan"
                          >
                            <Send className="w-4 h-4 text-[#A8B774]" />
                          </button>
                        </form>
                      ) : (
                        <div className="p-4 bg-amber-50 border-t border-[#E6E1D5] text-center flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-amber-800 shrink-0">
                          <span>🔒 Hanya pembuat grup / admin yang dapat mengirim pesan di grup pengumuman ini.</span>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-2 bg-[#FAF6EE]/50">
              <MessageSquare className="w-10 h-10 text-[#A8B774] opacity-70" />
              <h2 className="font-title font-bold text-sm text-[#2C4219]">Pilih Grup Chat Diskusi</h2>
              <p className="text-xs text-[#433A30]/60 max-w-xs">
                Pilih topik dari daftar di sebelah kiri untuk mulai berdiskusi.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Moderation Confirmation Modal for Deleting Thread */}
      {threadToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#C53030]/10 border border-[#C53030]/20 flex items-center justify-center text-[#C53030] shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-title font-bold text-sm text-[#2C4219]">
                    Hapus Grup Chat / Topik
                  </h3>
                  <p className="text-[11px] text-[#433A30]/60">
                    Tindakan moderasi bersifat permanen
                  </p>
                </div>
              </div>
              <button
                onClick={() => setThreadToDelete(null)}
                className="p-1 rounded-lg hover:bg-[#FAF6EE] text-[#433A30]/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAF6EE] p-3 rounded-xl border border-[#E6E1D5] space-y-1">
              <p className="text-[10px] font-bold text-[#433A30]/60 uppercase tracking-wider">Topik Diskusi</p>
              <p className="font-bold text-xs text-[#2C4219] line-clamp-2">
                "{threadToDelete.title}"
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E1D5]">
              <button
                onClick={() => setThreadToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E6E1D5] hover:bg-[#FAF6EE] text-[#433A30] font-bold text-xs"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteThread(threadToDelete.id);
                  setThreadToDelete(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#C53030] hover:bg-[#A32525] text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Grup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Settings Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E6E1D5] shadow-xl max-w-xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E6E1D5]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#2C4219] text-white">
                  <Settings className="w-4 h-4 text-[#A8B774]" />
                </div>
                <div>
                  <h3 className="font-title font-bold text-sm text-[#2C4219]">
                    Pengaturan Grup Diskusi
                  </h3>
                  <p className="text-[11px] text-[#433A30]/60">
                    Ubah informasi atau perizinan grup chat
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#FAF6EE] text-[#433A30]/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editErrorMsg && (
              <div className="p-3 rounded-xl bg-[#C53030]/10 text-[#C53030] border border-[#C53030]/30 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* 1. Category selector */}
              <div>
                <label className="block font-bold text-[#2C4219] mb-1">
                  Kategori Topik Diskusi
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-[#A8B774] bg-[#FAF6EE] text-[#433A30] font-bold focus:outline-none focus:border-[#2C4219] cursor-pointer"
                >
                  <option value="Produksi & Pengolahan">🥣 Produksi & Pengolahan</option>
                  <option value="Budidaya Lahan">🌾 Budidaya Lahan</option>
                  <option value="Pemasaran & UMKM">🛍️ Pemasaran & UMKM</option>
                  <option value="Informasi Umum">📢 Informasi Umum</option>
                </select>
              </div>

              {/* 2. Group Profile Photo & Name Field */}
              <div className="flex gap-4 items-start">
                {/* Group Avatar Upload */}
                <div className="flex flex-col items-center shrink-0">
                  <label className="block font-bold text-[#2C4219] mb-1 text-center whitespace-nowrap">
                    Foto Profil
                  </label>
                  <div 
                    onClick={() => editAvatarInputRef.current?.click()}
                    className="relative group w-14 h-14 rounded-full border-2 border-dashed border-[#A8B774] hover:border-[#2C4219] bg-[#FAF6EE] flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200"
                    title="Ubah foto profil grup"
                  >
                    {editGroupAvatar ? (
                      <>
                        <img 
                          src={editGroupAvatar} 
                          alt="Grup Avatar" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Upload className="w-4 h-4 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-[#2C4219]/60 group-hover:text-[#2C4219] transition-colors">
                        <Upload className="w-4 h-4 mb-0.5" />
                        <span className="text-[8px] font-bold">Pilih</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={editAvatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleEditAvatarChange}
                    className="hidden"
                  />
                  {editGroupAvatar && (
                    <button
                      type="button"
                      onClick={handleRemoveEditAvatar}
                      className="text-[9px] text-[#C53030] font-bold mt-1 hover:underline hover:text-[#A32525]"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {/* Group Name Input */}
                <div className="flex-1 min-w-0">
                  <label className="block font-bold text-[#2C4219] mb-1">
                    Nama Grup / Topik Diskusi <span className="text-[#C53030]">*</span>
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E6E1D5] bg-white text-[#433A30] focus:outline-none focus:border-[#2C4219] font-medium"
                  />
                </div>
              </div>

              {/* 3. Description Textarea */}
              <div>
                <label className="block font-bold text-[#2C4219] mb-1">
                  Deskripsi Singkat Topik <span className="text-[#C53030]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E6E1D5] bg-white text-[#433A30] focus:outline-none focus:border-[#2C4219] font-medium resize-none"
                />
              </div>

              {/* 4. Permission Toggle */}
              <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#2C4219] shrink-0" />
                  <label htmlFor="editPermissionCheck" className="text-xs font-semibold text-[#433A30] cursor-pointer">
                    Izinkan semua ibu-ibu anggota mengirim pesan
                  </label>
                </div>
                <input
                  id="editPermissionCheck"
                  type="checkbox"
                  checked={editAllowMemberMessages}
                  onChange={(e) => setEditAllowMemberMessages(e.target.checked)}
                  className="w-4 h-4 accent-[#2C4219] rounded cursor-pointer shrink-0"
                />
              </div>

              {/* 5. Form Footer */}
              <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E6E1D5] font-bold text-[#433A30] hover:bg-[#FAF6EE] transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 text-[#A8B774]" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
