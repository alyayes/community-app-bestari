import React, { useState, useRef, useEffect } from 'react';
import { ForumThread, ForumComment, UserProfile } from '../../types';
import { api } from '../../api/client';
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
  Lock,
  Edit2,
  Camera
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface DiskusiViewProps {
  threads: ForumThread[];
  currentUser: UserProfile;
  onOpenCreateModal: () => void;
  onToggleLikeThread: (threadId: string) => void;
  onToggleLikeComment: (threadId: string, commentId: string) => void;
  onAddComment: (threadId: string, content: string, imageAttachment?: string, quotedText?: string, quotedAuthor?: string, documentAttachment?: string, documentName?: string) => void;
  onEditComment: (threadId: string, commentId: string, newContent: string) => void;
  onDeleteComment: (threadId: string, commentId: string) => void;
  onDeleteThread: (threadId: string) => void;
  onUpdateThread: (updatedThread: ForumThread) => void;
}

export const DiskusiView: React.FC<DiskusiViewProps> = ({
  threads,
  currentUser,
  onOpenCreateModal,
  onToggleLikeThread,
  onToggleLikeComment,
  onAddComment,
  onEditComment,
  onDeleteComment,
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

  // File attachment state
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  // Edit comment state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  // Moderation modal state
  const [threadToDelete, setThreadToDelete] = useState<ForumThread | null>(null);

  // Detail Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Chat scroll container ref
  const chatStreamRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const [documentAttachment, setDocumentAttachment] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setShowAttachmentMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if ((!inputMessage.trim() && !attachmentPreview && !documentAttachment) || !activeThread) return;

    if (editingCommentId) {
      onEditComment(activeThread.id, editingCommentId, inputMessage.trim());
      setEditingCommentId(null);
    } else {
      onAddComment(
        activeThread.id,
        inputMessage.trim(),
        attachmentPreview || undefined,
        quotedComment ? quotedComment.text : undefined,
        quotedComment ? quotedComment.authorName : undefined,
        documentAttachment || undefined,
        documentName || undefined
      );
    }

    setInputMessage('');
    setQuotedComment(null);
    setShowEmojiPicker(false);
    setAttachmentPreview(null);
    setDocumentAttachment(null);
    setDocumentName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (docInputRef.current) docInputRef.current.value = '';
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

  const handleJoinGroup = async () => {
    if (!activeThread) return;

    try {
      const res = await api<any>(`/thread/${activeThread.id}/join`, { method: 'POST' });
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
        joinedMembers: res.joinedMembers || [...(activeThread.joinedMembers || []), currentUser.name],
        comments: [...activeThread.comments, systemComment]
      };

      onUpdateThread(updatedThread);
    } catch (e) {
      console.error('Failed to join', e);
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeThread) return;

    try {
      const res = await api<any>(`/thread/${activeThread.id}/leave`, { method: 'POST' });
      const systemComment: ForumComment = {
        id: `c_sys_${Date.now()}`,
        authorName: 'Sistem',
        authorAvatar: '',
        timeAgo: 'Baru saja',
        content: `👋 Ibu ${currentUser.name} telah keluar dari grup.`,
        likes: 0,
        userLiked: false
      };

      const updatedThread: ForumThread = {
        ...activeThread,
        joinedMembers: res.joinedMembers || (activeThread.joinedMembers || []).filter(m => m !== currentUser.name),
        comments: [...activeThread.comments, systemComment]
      };

      onUpdateThread(updatedThread);
      setIsDetailModalOpen(false);
    } catch (e) {
      console.error('Failed to leave', e);
    }
  };

  const handleKickMember = async (memberName: string) => {
    if (!activeThread) return;

    if (!window.confirm(`Yakin ingin mengeluarkan ${memberName} dari grup ini?`)) {
      return;
    }

    try {
      const res = await api<any>(`/thread/${activeThread.id}/kick`, {
        method: 'POST',
        body: { memberName }
      });
      const systemComment: ForumComment = {
        id: `c_sys_${Date.now()}`,
        authorName: 'Sistem',
        authorAvatar: '',
        timeAgo: 'Baru saja',
        content: `👢 ${memberName} telah dikeluarkan dari grup oleh Admin.`,
        likes: 0,
        userLiked: false
      };

      const updatedThread: ForumThread = {
        ...activeThread,
        joinedMembers: res.joinedMembers || (activeThread.joinedMembers || []).filter(m => m !== memberName),
        comments: [...activeThread.comments, systemComment]
      };

      onUpdateThread(updatedThread);
    } catch (e) {
      console.error('Failed to kick', e);
      alert('Gagal mengeluarkan anggota. Pastikan Anda adalah pembuat grup.');
    }
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
                    className={`p-3 sm:p-3.5 flex items-start gap-3 cursor-pointer transition-all ${isActive
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
                <div
                  className="flex items-center gap-3 min-w-0 cursor-pointer hover:bg-black/5 p-1 -m-1 rounded transition-colors"
                  onClick={() => setIsDetailModalOpen(true)}
                  title="Lihat Detail Komunitas"
                >
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
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-title font-bold text-xs sm:text-sm text-[#2C4219] truncate">
                        {activeThread.title}
                      </h2>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#A8B774]/20 text-[#2C4219] shrink-0 hidden sm:inline">
                        {activeThread.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#433A30]/60 font-medium truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      {activeThread.joinedMembers?.length || 0} Anggota
                    </p>
                  </div>
                </div>

                {canDeleteThread(activeThread) && currentUser.name === activeThread.authorName && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleOpenEditModal}
                      className="p-1.5 rounded-lg text-[#2C4219] hover:bg-[#FAF6EE] transition-colors"
                      title="Pengaturan Grup"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setThreadToDelete(activeThread)}
                      className="p-1.5 rounded-lg text-[#C53030]/80 hover:bg-[#FAF6EE] hover:text-[#C53030] transition-colors"
                      title="Hapus Topik"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
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
                            <div className="w-6 h-6 rounded-full bg-[#E3EAD3] overflow-hidden shrink-0 border border-[#2C4219]/20 flex items-center justify-center">
                              {activeThread.authorAvatar ? (
                                <img
                                  src={activeThread.authorAvatar}
                                  alt={activeThread.authorName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="font-bold text-[10px] text-[#2C4219]">{activeThread.authorName.charAt(0)}</span>
                              )}
                            </div>
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
                                className={`rounded-xl object-cover border border-[#E6E1D5] ${activeThread.images!.length === 1
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
                      /* Main Chat Flow (Flat List) */
                      <div className="space-y-4 pt-4 pb-4">
                        {activeThread.comments.map((comment, index, array) => {
                          const prevComment = index > 0 ? array[index - 1] : null;

                          let showDateSeparator = false;
                          let dateSeparatorText = '';

                          if (comment.createdAt) {
                            try {
                              const currentD = new Date(comment.createdAt);
                              const prevD = prevComment?.createdAt ? new Date(prevComment.createdAt) : null;
                              
                              const isDifferentDay = !prevD || 
                                currentD.getDate() !== prevD.getDate() || 
                                currentD.getMonth() !== prevD.getMonth() || 
                                currentD.getFullYear() !== prevD.getFullYear();

                              if (isDifferentDay) {
                                showDateSeparator = true;
                                const now = new Date();
                                
                                const isToday = currentD.getDate() === now.getDate() && currentD.getMonth() === now.getMonth() && currentD.getFullYear() === now.getFullYear();
                                
                                const yesterday = new Date(now);
                                yesterday.setDate(now.getDate() - 1);
                                const isYesterday = currentD.getDate() === yesterday.getDate() && currentD.getMonth() === yesterday.getMonth() && currentD.getFullYear() === yesterday.getFullYear();
                                
                                const isThisYear = currentD.getFullYear() === now.getFullYear();

                                if (isToday) {
                                  dateSeparatorText = 'Hari ini';
                                } else if (isYesterday) {
                                  dateSeparatorText = 'Kemarin';
                                } else if (isThisYear) {
                                  dateSeparatorText = currentD.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
                                } else {
                                  dateSeparatorText = currentD.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                                }
                              }
                            } catch (e) {
                              // ignore
                            }
                          }
                          if (comment.authorName === 'Sistem') {
                            return (
                              <React.Fragment key={comment.id}>
                                {showDateSeparator && (
                                  <div className="flex justify-center my-4">
                                    <div className="bg-[#E6E1D5]/60 px-4 py-1.5 rounded-lg text-[10px] font-bold text-[#433A30]/80 text-center shadow-xs">
                                      {dateSeparatorText}
                                    </div>
                                  </div>
                                )}
                                <div className="flex justify-center my-2">
                                  <div className="bg-[#E6E1D5]/50 px-3 py-1.5 rounded-full text-[10px] text-[#433A30]/70 font-semibold text-center max-w-[80%]">
                                    {comment.content}
                                  </div>
                                </div>
                              </React.Fragment>
                            );
                          }

                          const isMe = comment.authorName === currentUser.name;

                          // Format time
                          let timeString = comment.timeAgo;
                          if (comment.createdAt) {
                            try {
                              const d = new Date(comment.createdAt);
                              timeString = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                            } catch (e) {
                              // ignore
                            }
                          }

                          return (
                            <React.Fragment key={comment.id}>
                              {showDateSeparator && (
                                <div className="flex justify-center my-4">
                                  <div className="bg-[#E6E1D5]/60 px-4 py-1.5 rounded-lg text-[10px] font-bold text-[#433A30]/80 text-center shadow-xs">
                                    {dateSeparatorText}
                                  </div>
                                </div>
                              )}
                              <div className={`flex group ${isMe ? 'justify-end items-start' : 'justify-start items-start'} gap-2`}>

                              {/* Avatar on left for others */}
                              {!isMe && (
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E3EAD3] overflow-hidden shrink-0 border border-[#E6E1D5] mt-0.5">
                                  {comment.authorAvatar ? (
                                    <img src={comment.authorAvatar} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="w-full h-full flex items-center justify-center font-bold text-[12px] text-[#2C4219]">{comment.authorName.charAt(0)}</span>
                                  )}
                                </div>
                              )}

                              {/* Hover Actions (Outside Bubble) */}
                              {!isMe && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 mr-2 self-center order-last">
                                  <button onClick={() => onToggleLikeComment(activeThread.id, comment.id)} className={`p-1.5 rounded-full hover:bg-black/5 ${comment.userLiked ? 'text-red-500' : 'text-[#433A30]/50'}`} title="Suka">
                                    <Heart className={`w-4 h-4 ${comment.userLiked ? 'fill-red-500' : ''}`} />
                                  </button>
                                  <button onClick={() => setQuotedComment({ id: comment.id, authorName: comment.authorName, text: comment.content })} className="p-1.5 rounded-full hover:bg-black/5 text-[#433A30]/50" title="Balas">
                                    <CornerDownRight className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              {isMe && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 ml-2 self-center order-first">
                                  {(!comment.createdAt || Date.now() - new Date(comment.createdAt).getTime() < 15 * 60 * 1000) && (
                                    <button onClick={() => { setEditingCommentId(comment.id); setInputMessage(comment.content); }} className="p-1.5 rounded-full hover:bg-black/5 text-[#433A30]/50" title="Edit">
                                      <svg xmlns="http://www.w3.org/2010/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                    </button>
                                  )}
                                  <button onClick={() => onDeleteComment(activeThread.id, comment.id)} className="p-1.5 rounded-full hover:bg-red-50 text-red-500/70 hover:text-red-600" title="Hapus">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              {/* Bubble */}
                              <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-2 sm:p-2.5 shadow-2xs w-fit relative ${isMe ? 'bg-[#E3EAD3] text-[#433A30] rounded-tr-none border border-[#2C4219]/10' : 'bg-white text-[#433A30] rounded-tl-none border border-[#E6E1D5]'
                                }`}>

                                {/* Header (Only for others) */}
                                {!isMe && (
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="font-bold text-[11px] sm:text-xs text-[#2C4219]">{comment.authorName}</span>
                                    {comment.authorRole && (
                                      <span className="text-[9px] text-[#2C4219]/70 font-semibold">
                                        ({comment.authorRole})
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Quoted Message */}
                                {comment.quotedCommentText && (
                                  <div className={`p-1.5 sm:p-2 rounded border-l-4 mb-1.5 shadow-3xs bg-black/5 ${isMe ? 'border-[#2C4219]' : 'border-[#859752]'}`}>
                                    <p className={`text-[10px] font-bold mb-0.5 ${isMe ? 'text-[#2C4219]' : 'text-[#5B6D26]'}`}>{comment.quotedCommentAuthor}</p>
                                    <p className="text-[11px] text-[#433A30]/80 line-clamp-2 leading-tight">{comment.quotedCommentText}</p>
                                  </div>
                                )}

                                {/* Image Attachment */}
                                {comment.imageAttachment && (
                                  <div className="mb-1.5">
                                    <img src={comment.imageAttachment} alt="Attachment" className="rounded-lg max-h-48 w-auto object-contain border border-[#E6E1D5]" />
                                  </div>
                                )}

                                {/* Document Attachment */}
                                {comment.documentAttachment && (
                                  <div className="mb-1.5 p-2 bg-black/5 rounded-lg border border-black/10 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2010/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-500 shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    <a
                                      href={comment.documentAttachment}
                                      download={comment.documentName || "document"}
                                      className="text-xs font-bold text-indigo-600 hover:underline truncate"
                                    >
                                      {comment.documentName || "Unduh Dokumen"}
                                    </a>
                                  </div>
                                )}

                                {/* Message Body & Time */}
                                <div className="flex items-end justify-between gap-3 flex-wrap">
                                  <p className="text-xs sm:text-sm leading-relaxed font-normal whitespace-pre-line break-words max-w-full">
                                    {comment.content}
                                  </p>
                                  <span className="text-[9px] sm:text-[10px] text-[#433A30]/50 font-medium whitespace-nowrap ml-auto mt-1 flex items-center gap-1">
                                    {comment.isEdited && <span className="italic mr-0.5">(diedit)</span>}
                                    {timeString}
                                    {isMe && <CheckCheck className="w-3 h-3 text-[#537233]" />}
                                  </span>
                                </div>
                              </div>
                            </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Message Input Footer Bar */}
                  {hasJoined(activeThread) && (
                    <>
                      {/* Quoted Message Preview Bar */}
                      {quotedComment && !editingCommentId && (
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

                      {/* Edit Message Preview Bar */}
                      {editingCommentId && (
                        <div className="p-2 px-4 bg-amber-50 border-t border-[#E6E1D5] flex items-center justify-between gap-2 shrink-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="min-w-0 text-xs">
                              <span className="font-bold text-amber-800">Mengedit pesan...</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setEditingCommentId(null);
                              setInputMessage('');
                            }}
                            className="p-1 rounded-lg hover:bg-white text-amber-800/70 transition-colors shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Attachment Preview Box */}
                      {attachmentPreview && (
                        <div className="p-2 px-4 bg-white border-t border-[#E6E1D5] flex items-center justify-between gap-2 shrink-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={attachmentPreview} alt="Preview" className="w-12 h-12 object-cover rounded shadow-2xs border border-[#E6E1D5]" />
                            <div className="min-w-0 text-xs">
                              <span className="font-bold text-[#2C4219]">Gambar terlampir</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setAttachmentPreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-[#433A30]/70 transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Document Preview */}
                      {documentName && (
                        <div className="p-2 px-4 bg-white border-t border-[#E6E1D5] flex items-center justify-between gap-2 shrink-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                              <svg xmlns="http://www.w3.org/2010/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-[#2C4219] text-xs truncate max-w-[200px]">{documentName}</span>
                              <span className="text-[10px] text-[#433A30]/60">Dokumen terlampir</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setDocumentAttachment(null);
                              setDocumentName(null);
                              if (docInputRef.current) docInputRef.current.value = '';
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-[#433A30]/70 transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
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

                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                if (!file.type.match('image/(jpeg|jpg|png)')) {
                                  showToast('Hanya gambar (JPG/PNG) yang diperbolehkan', 'error');
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setAttachmentPreview(reader.result as string);
                                  showToast(`File "${file.name}" siap dilampirkan.`, 'success');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <input
                            type="file"
                            ref={docInputRef}
                            accept=".pdf,.doc,.docx,.txt"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setDocumentAttachment(reader.result as string);
                                  setDocumentName(file.name);
                                  showToast(`Dokumen "${file.name}" dilampirkan.`, 'success');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          
                          <div className="relative" ref={attachmentMenuRef}>
                            <button
                              type="button"
                              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                              className="p-2 rounded-xl bg-[#FAF6EE] text-[#433A30] hover:bg-[#E6E1D5] transition-colors"
                              title="Lampirkan"
                            >
                              <Paperclip className="w-4 h-4" />
                            </button>
                            
                            {/* Attachment Popup Menu */}
                            {showAttachmentMenu && (
                              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-[#E6E1D5] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                                <div className="py-2 flex flex-col">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowAttachmentMenu(false);
                                      docInputRef.current?.click();
                                    }}
                                    className="px-4 py-2.5 flex items-center gap-3 hover:bg-[#FAF6EE] transition-colors text-left"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                      <svg xmlns="http://www.w3.org/2010/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    </div>
                                    <span className="text-sm font-semibold text-[#433A30]">Dokumen</span>
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowAttachmentMenu(false);
                                      fileInputRef.current?.click();
                                    }}
                                    className="px-4 py-2.5 flex items-center gap-3 hover:bg-[#FAF6EE] transition-colors text-left"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                      <svg xmlns="http://www.w3.org/2010/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                    </div>
                                    <span className="text-sm font-semibold text-[#433A30]">Foto</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <input
                            type="text"
                            placeholder="Ketik pesan..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            className="flex-1 py-2 px-3.5 bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl text-xs sm:text-sm text-[#433A30] placeholder-[#433A30]/40 focus:outline-none focus:border-[#2C4219] font-medium"
                          />

                          <button
                            type="submit"
                            disabled={!inputMessage.trim() && !attachmentPreview}
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

      {/* Community Detail Modal (WhatsApp Group Info Style) */}
      {isDetailModalOpen && activeThread && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#433A30]/60 backdrop-blur-sm"
            onClick={() => setIsDetailModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-0 animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header / Banner Area */}
            <div className="bg-[#FAF6EE] pt-8 pb-6 px-6 flex flex-col items-center relative border-b border-[#E6E1D5]">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-black/5 text-[#433A30]/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative group mb-3">
                <div className="w-28 h-28 rounded-full bg-[#2C4219] text-white flex items-center justify-center shrink-0 overflow-hidden border-4 border-white shadow-md">
                  {activeThread.groupAvatar ? (
                    <img src={activeThread.groupAvatar} alt="Group Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-12 h-12 text-[#A8B774]" />
                  )}
                </div>
                {/* Editable Avatar Button for Admin */}
                {activeThread.authorName === currentUser.name && (
                  <button
                    onClick={() => { setIsDetailModalOpen(false); handleOpenEditModal(); }}
                    className="absolute bottom-0 right-1 w-9 h-9 bg-[#2C4219] rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-[#1E2E11] transition-colors shadow-sm"
                    title="Ubah foto grup"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="text-center w-full relative">
                <div className="relative inline-block max-w-full px-8">
                  <h3 className="font-title font-bold text-base text-[#2C4219] line-clamp-2 leading-tight">
                    {activeThread.title}
                  </h3>
                  {activeThread.authorName === currentUser.name && (
                    <button onClick={() => { setIsDetailModalOpen(false); handleOpenEditModal(); }} className="absolute top-1/2 -translate-y-1/2 -right-2 p-1 text-[#2C4219]/60 hover:text-[#2C4219]">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-[#433A30]/70 font-semibold mt-1">
                  Grup · <span className="text-[#2C4219]">{activeThread.joinedMembers?.length || 0} anggota</span>
                </p>
              </div>
            </div>

            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
              {/* Description Section */}
              <div className="px-6 py-4 border-b border-[#E6E1D5] relative">
                <h4 className="text-[10px] font-bold text-[#433A30]/50 uppercase tracking-wider mb-2">Deskripsi Topik</h4>
                <div className="relative pr-8">
                  <p className="text-sm text-[#433A30] font-medium leading-relaxed whitespace-pre-line">
                    {activeThread.content}
                  </p>
                  {activeThread.authorName === currentUser.name && (
                    <button onClick={() => { setIsDetailModalOpen(false); handleOpenEditModal(); }} className="absolute top-0 right-0 p-1 text-[#2C4219]/60 hover:text-[#2C4219]">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {activeThread.images && activeThread.images.length > 0 && (
                  <div className="mt-3">
                    <img src={activeThread.images[0]} alt="Grup Foto" className="w-full max-h-48 object-cover rounded-xl border border-[#E6E1D5]" />
                  </div>
                )}
              </div>

              {/* Members Section */}
              <div className="px-6 py-4">
                <h4 className="text-xs font-bold text-[#2C4219] mb-3">Daftar Anggota</h4>
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {activeThread.joinedMembers?.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E3EAD3] text-[#2C4219] flex items-center justify-center font-bold text-xs shrink-0">
                        {member.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#433A30] truncate flex items-center gap-2">
                          {member}
                          {member === currentUser.name && <span className="text-[10px] text-[#2C4219]/70 font-normal">(Anda)</span>}
                          {member === activeThread.authorName && <span className="text-[10px] bg-[#2C4219]/10 text-[#2C4219] px-2 py-0.5 rounded-full font-bold border border-[#2C4219]/20">Admin</span>}
                        </p>
                      </div>
                      {/* Kick Button for Admin */}
                      {activeThread.authorName === currentUser.name && member !== currentUser.name && (
                        <button
                          onClick={() => handleKickMember(member)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shrink-0"
                          title={`Keluarkan ${member} dari grup`}
                        >
                          Keluarkan
                        </button>
                      )}
                    </div>
                  ))}
                  {(!activeThread.joinedMembers || activeThread.joinedMembers.length === 0) && (
                    <p className="text-sm text-[#433A30]/60 italic">Belum ada anggota yang bergabung.</p>
                  )}
                </div>
              </div>

            </div>

            <div className="p-6 pt-2 bg-white">
              {hasJoined(activeThread) && (
                <button
                  onClick={() => {
                    if (window.confirm('Yakin ingin keluar dari komunitas ini?')) {
                      handleLeaveGroup();
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-600 font-bold hover:bg-red-50 transition-colors text-sm w-full flex justify-center"
                >
                  Keluar dari Komunitas
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
