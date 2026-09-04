import React, { useState, useRef, useEffect } from 'react';
import { ForumThread, UserProfile, ForumComment } from '../../types';
import { MessageSquare, ArrowLeft, Send, PlusCircle, Paperclip, Image as ImageIcon, X, Search, Filter, Lock, Trash2, Heart, CornerDownRight, CheckCheck, Edit3, LogOut, Settings, Upload, AlertCircle, ShieldCheck, Users, ChevronDown } from 'lucide-react';
import { SERVER_BASE, api } from '../../api/client';

const CommentBubble = ({
  comment,
  currentUser,
  selectedThreadId,
  onToggleLikeComment,
  setQuotedComment,
  setEditingCommentId,
  setReplyText,
  onDeleteComment,
  onEditComment,
  setAttachmentPreviews,
  setDocumentAttachments,
  onImageClick
}: any) => {
  const [imgError, setImgError] = useState(false);

  const isMe = Boolean(comment.authorName && currentUser.name && comment.authorName.trim().toLowerCase() === currentUser.name.trim().toLowerCase());

  const getInitials = (name: string) => {
    const parts = name?.split(' ').filter(Boolean) || ['A'];
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className={`flex gap-2 w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && (
        <div className="shrink-0 mt-1">
          {comment.authorAvatar && !imgError && comment.authorAvatar.trim() !== '' ? (
            <img
              src={comment.authorAvatar}
              alt={comment.authorName}
              className="w-8 h-8 rounded-full object-cover shadow-sm border border-[#E6E1D5]"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#607829] flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {getInitials(comment.authorName)}
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="font-bold text-xs text-[#2C4219]">{comment.authorName}</span>
            <span className="text-[10px] text-[#433A30]/60">{comment.timeAgo}</span>
          </div>
        )}
        {isMe && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-[10px] text-[#433A30]/60">{comment.timeAgo}</span>
            <span className="font-bold text-xs text-[#2C4219]">Anda</span>
          </div>
        )}

        <div className={`group flex items-end gap-2 w-full ${isMe ? 'flex-row-reverse' : ''}`}>
          <div className={`relative p-3 shadow-xs border border-[#E6E1D5]/50 w-fit max-w-[100%] ${isMe ? 'bg-[#DCF8C6] rounded-2xl rounded-tr-sm' : 'bg-white rounded-2xl rounded-tl-sm'}`}>
            {comment.quotedCommentText && (
              <div className={`p-2 rounded-lg border-l-4 mb-2 shadow-sm bg-black/5 ${isMe ? 'border-[#607829]' : 'border-[#A8B774]'}`}>
                <p className={`text-xs font-bold mb-1 ${isMe ? 'text-[#2C4219]' : 'text-[#607829]'}`}>{comment.quotedCommentAuthor}</p>
                <p className="text-sm text-[#433A30]/80 line-clamp-2 leading-tight">{comment.quotedCommentText}</p>
              </div>
            )}
            <p className="text-sm text-[#433A30] leading-relaxed whitespace-pre-wrap">{comment.content}</p>

            {comment.imageAttachments && comment.imageAttachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {comment.imageAttachments.map((img: string, i: number) => (
                  <img key={i} src={img} alt="Lampiran" onClick={() => onImageClick && onImageClick(img)} className="h-32 rounded-xl object-cover border border-black/5 cursor-pointer" />
                ))}
              </div>
            )}
            {comment.documentAttachments && comment.documentAttachments.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                {comment.documentAttachments.map((doc: any, i: number) => (
                  <a key={i} href={doc.url} download className="flex items-center gap-2 p-2 rounded-xl bg-white/60 border border-black/5 w-fit max-w-full">
                    <Paperclip className="w-4 h-4 text-[#607829] shrink-0" />
                    <span className="text-[#2C4219] font-bold text-xs truncate">{doc.name}</span>
                  </a>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-1 mt-1">
              {comment.isEdited && <span className="text-[10px] italic text-[#433A30]/50 mr-1">(diedit)</span>}
              {isMe && <CheckCheck className="w-4 h-4 text-[#607829]" />}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 mb-1">
            {(!isMe || comment.likes > 0) && (
              <div className="flex items-center">
                <button
                  onClick={() => !isMe && onToggleLikeComment && onToggleLikeComment(selectedThreadId, comment.id)}
                  className={`p-2 rounded-full ${!isMe ? 'active:bg-black/5 cursor-pointer hover:bg-black/5' : 'cursor-default opacity-80'} ${comment.userLiked ? 'text-red-500' : 'text-[#433A30]/50'}`}
                  disabled={isMe}
                >
                  <Heart className={`w-5 h-5 ${comment.userLiked ? 'fill-red-500' : ''}`} />
                </button>
                {comment.likes > 0 && <span className="text-xs font-bold text-[#433A30]/70 -ml-1 mr-2">{comment.likes}</span>}
              </div>
            )}
            {setQuotedComment && (
              <button onClick={() => setQuotedComment({ id: comment.id, authorName: comment.authorName, text: comment.content })} className="px-3 py-1.5 rounded-full active:bg-black/5 text-[#2C4219] font-bold text-xs bg-[#FAF6EE] border border-[#E6E1D5]">
                Balas
              </button>
            )}
            {isMe && onEditComment && (!comment.createdAt || Date.now() - new Date(comment.createdAt).getTime() < 15 * 60 * 1000) && (
              <button onClick={() => {
                setEditingCommentId(comment.id);
                setReplyText(comment.content);
                setAttachmentPreviews(comment.imageAttachments || []);
                setDocumentAttachments(comment.documentAttachments || []);
              }} className="px-3 py-1.5 rounded-full active:bg-black/5 text-[#D97706] font-bold text-xs bg-amber-50 border border-amber-200">
                Ubah
              </button>
            )}
            {isMe && onDeleteComment && (
              <button onClick={() => {
                if (confirm('Hapus komentar ini?')) {
                  onDeleteComment(selectedThreadId, comment.id);
                }
              }} className="px-3 py-1.5 rounded-full active:bg-red-50 text-red-600 font-bold text-xs bg-red-50 border border-red-200">
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MainTopicBubble = ({ thread, currentUser, onToggleLikeThread, setQuotedComment, onEditThread, onDeleteThread, onImageClick }: any) => {
  const [imgError, setImgError] = useState(false);

  const isMe = Boolean(thread.authorName && currentUser.name && thread.authorName.trim().toLowerCase() === currentUser.name.trim().toLowerCase());

  const getInitials = (name: string) => {
    const parts = name?.split(' ').filter(Boolean) || ['A'];
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className={`flex gap-3 w-full ${isMe ? 'flex-row-reverse' : 'flex-row'} p-4 rounded-2xl border shadow-xs ${isMe ? 'bg-[#DCF8C6] border-[#2C4219]/20' : 'bg-white border-[#E6E1D5]'}`}>
      <div className="shrink-0">
        {!isMe ? (
          thread.authorAvatar && !imgError && thread.authorAvatar.trim() !== '' ? (
            <img
              src={thread.authorAvatar}
              alt={thread.authorName}
              className="w-10 h-10 rounded-full object-cover shadow-sm border border-[#E6E1D5]"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#607829] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {getInitials(thread.authorName)}
            </div>
          )
        ) : null}
      </div>
      <div className={`flex-1 min-w-0 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        <div className={`font-bold text-sm text-[#2C4219] mb-1.5 flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <span>{isMe ? 'Anda' : thread.authorName}</span>
          <span className="text-xs font-normal text-[#433A30]/60">{thread.timeAgo}</span>
        </div>
        <p className={`text-[15px] text-[#433A30] leading-relaxed whitespace-pre-wrap ${isMe ? 'text-right' : 'text-left'}`}>
          {thread.content}
        </p>

        {thread.images && thread.images.length > 0 && (
          <div className={`mt-3 flex flex-wrap gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {thread.images.map((img: string, i: number) => (
              <img key={i} src={img} alt="Lampiran" onClick={() => onImageClick && onImageClick(img)} className="h-32 rounded-xl object-cover border border-[#E6E1D5] cursor-pointer" />
            ))}
          </div>
        )}
        {thread.documentAttachments && thread.documentAttachments.length > 0 && (
          <div className={`mt-3 flex flex-col gap-2 ${isMe ? 'items-end' : 'items-start'}`}>
            {thread.documentAttachments.map((doc: any, i: number) => (
              <a key={i} href={doc.url} download className="flex items-center gap-2 p-3 rounded-xl bg-white/60 border border-[#E6E1D5] w-fit max-w-full">
                <Paperclip className="w-5 h-5 text-[#607829] shrink-0" />
                <span className="text-[#2C4219] font-bold text-sm truncate">{doc.name}</span>
              </a>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E6E1D5]/50 w-full flex-wrap">
          {(!isMe || thread.likes > 0) && (
            <div className="flex items-center">
              <button
                onClick={() => !isMe && onToggleLikeThread && onToggleLikeThread(thread.id)}
                className={`p-2 rounded-full ${!isMe ? 'active:bg-black/5 cursor-pointer hover:bg-black/5' : 'cursor-default opacity-80'} ${thread.userLiked ? 'text-red-500' : 'text-[#433A30]/50'}`}
                disabled={isMe}
              >
                <Heart className={`w-5 h-5 ${thread.userLiked ? 'fill-red-500' : ''}`} />
              </button>
              {thread.likes > 0 && <span className="text-sm font-bold text-[#433A30]/70 -ml-1 mr-2">{thread.likes}</span>}
            </div>
          )}
          {setQuotedComment && (
            <button onClick={() => setQuotedComment({ id: thread.id, authorName: thread.authorName, text: thread.content })} className="px-4 py-2 rounded-full active:bg-black/5 text-[#2C4219] font-bold text-sm bg-[#FAF6EE] border border-[#E6E1D5]">
              Tanggapi
            </button>
          )}
          {isMe && onDeleteThread && (
            <button onClick={() => {
              if (confirm('Hapus topik ini?')) {
                onDeleteThread(thread.id);
              }
            }} className="px-4 py-2 rounded-full active:bg-red-50 text-red-600 font-bold text-sm bg-red-50 border border-red-200">
              Hapus Topik
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface DiskusiViewLiteProps {
  threads: ForumThread[];
  currentUser: UserProfile;
  onOpenCreateModal: () => void;
  onAddComment: (threadId: string, content: string, imageAttachments?: string[], quotedText?: string, quotedAuthor?: string, documentAttachments?: { url: string; name: string }[]) => void;
  onToggleLikeThread?: (threadId: string) => void;
  onToggleLikeComment?: (threadId: string, commentId: string) => void;
  onEditComment?: (threadId: string, commentId: string, content: string, imageAttachments?: string[], documentAttachments?: { url: string; name: string }[]) => void;
  onDeleteComment?: (threadId: string, commentId: string) => void;
  onDeleteThread?: (threadId: string) => void;
  onUpdateThread?: (thread: ForumThread, triggerPut?: boolean) => void;
}

export const DiskusiViewLite: React.FC<DiskusiViewLiteProps> = ({
  threads,
  currentUser,
  onOpenCreateModal,
  onAddComment,
  onToggleLikeThread,
  onToggleLikeComment,
  onEditComment,
  onDeleteComment,
  onDeleteThread,
  onUpdateThread
}) => {
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Sync selectedThread with threads prop (e.g., when a comment is deleted or edited in App.tsx)
  useEffect(() => {
    if (selectedThread) {
      const updated = threads.find(t => t.id === selectedThread.id);
      if (updated) {
        setSelectedThread(updated);
      }
    }
  }, [threads]);

  const [replyText, setReplyText] = useState('');
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [documentAttachments, setDocumentAttachments] = useState<{ url: string, name: string }[]>([]);
  const [quotedComment, setQuotedComment] = useState<{ id: string; authorName: string; text: string } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua Topik');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Edit group settings states
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editGroupAvatar, setEditGroupAvatar] = useState<string | null>(null);
  const [editAllowMemberMessages, setEditAllowMemberMessages] = useState<boolean>(true);
  const [editErrorMsg, setEditErrorMsg] = useState<string>('');
  const editAvatarInputRef = useRef<HTMLInputElement | null>(null);

  const categoryOptions = [
    { name: 'Semua Topik', label: '💬 Semua Topik' },
    { name: 'Produksi & Pengolahan', label: '🥣 Produksi & Pengolahan' },
    { name: 'Budidaya Lahan', label: '🌾 Budidaya Lahan' },
    { name: 'Pemasaran & UMKM', label: '🛍️ Pemasaran & UMKM' },
    { name: 'Informasi Umum', label: '📢 Informasi Umum' }
  ];

  const filteredThreads = threads.filter(thread => {
    const matchesCategory =
      selectedCategory === 'Semua Topik' ||
      thread.category === selectedCategory ||
      (selectedCategory === 'Produksi & Pengolahan' && thread.category.includes('Produksi')) ||
      (selectedCategory === 'Budidaya Lahan' && thread.category.includes('Budidaya')) ||
      (selectedCategory === 'Pemasaran & UMKM' && thread.category.includes('Pemasaran')) ||
      (selectedCategory === 'Informasi Umum' && (thread.category.includes('Umum') || thread.category.includes('Informasi')));

    const matchesSearch =
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.authorName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const hasJoined = (thread: ForumThread) => {
    return thread.joinedMembers?.includes(currentUser.name) ?? true;
  };

  const handleJoinGroup = async () => {
    if (!selectedThread || !onUpdateThread) return;
    try {
      const res = await api<any>(`/thread/${selectedThread.id}/join`, { method: 'POST' });
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
        ...selectedThread,
        joinedMembers: res.joinedMembers || [...(selectedThread.joinedMembers || []), currentUser.name],
        comments: [...selectedThread.comments, systemComment]
      };
      onUpdateThread(updatedThread, false);
      setSelectedThread(updatedThread);
    } catch (e) {
      console.error('Failed to join group', e);
      alert('Gagal bergabung dengan komunitas.');
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedThread || !onUpdateThread) return;
    if (confirm(`Anda yakin ingin keluar dari komunitas "${selectedThread.title}"?`)) {
      try {
        await api(`/thread/${selectedThread.id}/leave`, { method: 'POST' });
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
          ...selectedThread,
          joinedMembers: (selectedThread.joinedMembers || []).filter(m => m !== currentUser.name),
          comments: [...selectedThread.comments, systemComment]
        };
        onUpdateThread(updatedThread, false);
        setSelectedThread(null);
      } catch (e) {
        console.error('Failed to leave group', e);
        alert('Gagal keluar dari komunitas.');
      }
    }
  };

  const handleEditGroup = () => {
    if (!selectedThread) return;
    setEditTitle(selectedThread.title);
    setEditDescription(selectedThread.content);
    setEditCategory(selectedThread.category);
    setEditGroupAvatar(selectedThread.groupAvatar || null);
    setEditAllowMemberMessages(selectedThread.allowMemberMessages !== false);
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
    if (editAvatarInputRef.current) {
      editAvatarInputRef.current.value = '';
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
    if (editTitle.trim().length < 3) {
      setEditErrorMsg('Nama Grup / Topik minimal harus terdiri dari 3 karakter.');
      return;
    }
    if (editDescription.trim().length < 3) {
      setEditDescription('Deskripsi Singkat Topik minimal harus terdiri dari 3 karakter.');
      return;
    }

    if (!selectedThread || !onUpdateThread) return;

    const updatedThread: ForumThread = {
      ...selectedThread,
      title: editTitle.trim(),
      content: editDescription.trim(),
      summary: editDescription.trim().slice(0, 100) + '...',
      category: editCategory as any,
      groupAvatar: editGroupAvatar || undefined,
      allowMemberMessages: editAllowMemberMessages
    };

    onUpdateThread(updatedThread);
    setSelectedThread(updatedThread);
    setIsEditModalOpen(false);
  };

  const canManageThread = (thread: ForumThread) => {
    return currentUser.name === thread.authorName;
  };

  const handleSendReply = () => {
    if ((!replyText.trim() && attachmentPreviews.length === 0 && documentAttachments.length === 0) || !selectedThread) return;

    if (editingCommentId && onEditComment) {
      onEditComment(selectedThread.id, editingCommentId, replyText, attachmentPreviews, documentAttachments);
      setEditingCommentId(null);
    } else {
      onAddComment(selectedThread.id, replyText, attachmentPreviews, quotedComment?.text, quotedComment?.authorName, documentAttachments);
    }
    setQuotedComment(null);
    setReplyText('');
    setAttachmentPreviews([]);
    setDocumentAttachments([]);

    // Optimistic UI update for the selected thread view
    const newComment = {
      id: `c_${Date.now()}`,
      authorName: currentUser.name || 'Saya',
      authorAvatar: currentUser.avatar || '',
      authorRole: currentUser.role || 'petani',
      content: replyText,
      timeAgo: 'Baru saja',
      likes: 0,
      imageAttachments: attachmentPreviews,
      documentAttachments: documentAttachments
    };
    setSelectedThread({
      ...selectedThread,
      comments: [...selectedThread.comments, newComment],
      repliesCount: selectedThread.repliesCount + 1
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentAttachments(prev => [...prev, { url: reader.result as string, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
    if (docInputRef.current) docInputRef.current.value = '';
  };

  if (selectedThread) {
    return (
      <>
        <div className="flex flex-col h-[calc(100vh-80px)] md:h-[100dvh] w-full bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 relative border-x border-[#E6E1D5]">
          {/* Header Diskusi */}
          <div className="bg-[#FAF6EE] p-4 border-b border-[#E6E1D5] flex items-center gap-4 shrink-0">
            <button
              onClick={() => setSelectedThread(null)}
              className="p-2 bg-white rounded-full border border-[#E6E1D5] active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-6 h-6 text-[#2C4219]" />
            </button>
            {selectedThread.groupAvatar ? (
              <img
                src={selectedThread.groupAvatar}
                alt={selectedThread.title}
                className="w-9 h-9 rounded-full object-cover border border-[#2C4219]/20 shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#2C4219] flex items-center justify-center text-white font-bold text-base shadow-sm">
                {selectedThread.title.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-lg text-[#2C4219] truncate leading-tight">{selectedThread.title}</h2>
              <p className="text-sm text-[#433A30] truncate">Dimulai oleh: {selectedThread.authorName}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {hasJoined(selectedThread) && !canManageThread(selectedThread) && (
                <button
                  onClick={handleLeaveGroup}
                  className="p-2 text-red-500 rounded-full active:bg-red-50"
                  title="Keluar Komunitas"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
              {canManageThread(selectedThread) && (
                <>
                  <button
                    onClick={handleEditGroup}
                    className="p-2 text-[#2C4219] rounded-full active:bg-black/5"
                    title="Pengaturan Komunitas"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Hapus Komunitas ini secara permanen?')) {
                        if (onDeleteThread) onDeleteThread(selectedThread.id);
                        setSelectedThread(null);
                      }
                    }}
                    className="p-2 text-red-500 rounded-full active:bg-red-50"
                    title="Hapus Komunitas"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
          {/* Isi Diskusi & Komentar */}
          {!hasJoined(selectedThread) ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 p-8 text-center space-y-6">
              <div className="w-24 h-24 rounded-3xl bg-[#2C4219]/10 text-[#2C4219] flex items-center justify-center shadow-md">
                <Lock className="w-12 h-12 opacity-80" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-[#2C4219] mb-2">Komunitas Tertutup</h3>
                <p className="text-[#433A30] text-lg max-w-sm mx-auto">
                  Anda harus bergabung dengan komunitas ini untuk melihat percakapan dan mengirim pesan.
                </p>
              </div>
              <button
                onClick={handleJoinGroup}
                className="bg-[#2C4219] hover:bg-[#1E2E11] text-white font-bold py-4 px-8 rounded-2xl shadow-sm text-lg"
              >
                Gabung Komunitas
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {/* Topik Utama */}
                <MainTopicBubble
                  thread={selectedThread}
                  currentUser={currentUser}
                  onToggleLikeThread={onToggleLikeThread}
                  setQuotedComment={setQuotedComment}
                  onDeleteThread={(id: string) => {
                    if (onDeleteThread) onDeleteThread(id);
                    setSelectedThread(null);
                  }}
                  onImageClick={setZoomedImage}
                />

                <hr className="border-[#E6E1D5]" />


                {/* Daftar Balasan */}
                {selectedThread.comments.map((comment) => {
                  return (
                    <CommentBubble
                      key={comment.id}
                      comment={comment}
                      currentUser={currentUser}
                      selectedThreadId={selectedThread.id}
                      onToggleLikeComment={onToggleLikeComment}
                      setQuotedComment={setQuotedComment}
                      setEditingCommentId={setEditingCommentId}
                      setReplyText={setReplyText}
                      onDeleteComment={onDeleteComment}
                      onEditComment={onEditComment}
                      setAttachmentPreviews={setAttachmentPreviews}
                      setDocumentAttachments={setDocumentAttachments}
                      onImageClick={setZoomedImage}
                    />
                  );
                })}

                {selectedThread.comments.length === 0 && (
                  <p className="text-center text-[#433A30]/60 py-4">Belum ada balasan. Jadilah yang pertama membalas!</p>
                )}
              </div>

              {/* Input Balasan */}
              <div className="p-4 bg-white border-t border-[#E6E1D5] shrink-0 space-y-3">

                {/* Quoted Message Preview Bar */}
                {quotedComment && !editingCommentId && (
                  <div className="p-3 bg-[#E3EAD3] border border-[#E6E1D5] rounded-xl flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <CornerDownRight className="w-5 h-5 text-[#2C4219] shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-[#2C4219]">Membalas {quotedComment.authorName}:</span>
                        <p className="text-sm text-[#433A30]/70 truncate">{quotedComment.text}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setQuotedComment(null)}
                      className="p-2 rounded-lg hover:bg-white text-[#433A30]/70 transition-colors shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Edit Message Preview Bar */}
                {editingCommentId && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="min-w-0">
                        <span className="font-bold text-sm text-amber-800">Mengedit pesan...</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setReplyText('');
                      }}
                      className="p-2 rounded-lg hover:bg-white text-amber-800/70 transition-colors shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {attachmentPreviews.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {attachmentPreviews.map((preview, idx) => (
                      <div key={idx} className="relative shrink-0">
                        <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-[#E6E1D5]" />
                        <button
                          onClick={() => setAttachmentPreviews(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {documentAttachments.length > 0 && (
                  <div className="flex flex-col gap-2 pb-2">
                    {documentAttachments.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5]">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Paperclip className="w-5 h-5 text-[#607829] shrink-0" />
                          <span className="text-[#2C4219] font-bold text-sm truncate">{doc.name}</span>
                        </div>
                        <button
                          onClick={() => setDocumentAttachments(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 bg-red-100 text-red-600 rounded-lg shrink-0 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  <button
                    onClick={() => docInputRef.current?.click()}
                    className="p-3 bg-[#FAF6EE] text-[#2C4219] rounded-xl active:scale-95 shrink-0 hover:bg-[#E6E1D5] transition-colors border border-[#E6E1D5]"
                    title="Lampirkan Dokumen"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={docInputRef}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    multiple
                    className="hidden"
                    onChange={handleDocChange}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-[#FAF6EE] text-[#2C4219] rounded-xl active:scale-95 shrink-0 hover:bg-[#E6E1D5] transition-colors border border-[#E6E1D5]"
                    title="Lampirkan Foto"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tulis pesan..."
                    className="flex-1 min-h-[46px] max-h-32 rounded-2xl border-2 border-[#E6E1D5] px-4 py-3 text-base focus:outline-none focus:border-[#2C4219] resize-none shadow-sm"
                    rows={1}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() && attachmentPreviews.length === 0 && documentAttachments.length === 0}
                    className="p-3 bg-[#607829] text-white rounded-2xl disabled:opacity-50 active:scale-95 shrink-0 hover:bg-[#2C4219] shadow-sm transition-colors"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Edit Group Settings Modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E6E1D5]">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#2C4219] text-white">
                      <Settings className="w-5 h-5 text-[#A8B774]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#2C4219]">Pengaturan Komunitas</h3>
                    </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-2 rounded-xl hover:bg-[#FAF6EE] text-[#433A30]/70">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {editErrorMsg && (
                  <div className="p-3 rounded-xl bg-[#C53030]/10 text-[#C53030] font-bold text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{editErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
                  <div>
                    <label className="block font-bold text-[#2C4219] mb-1">Kategori</label>
                    <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full p-3 rounded-xl border-2 border-[#A8B774] bg-[#FAF6EE] text-[#433A30] font-bold">
                      <option value="Produksi & Pengolahan">🥣 Produksi & Pengolahan</option>
                      <option value="Budidaya Lahan">🌾 Budidaya Lahan</option>
                      <option value="Pemasaran & UMKM">🛍️ Pemasaran & UMKM</option>
                      <option value="Informasi Umum">📢 Informasi Umum</option>
                    </select>
                  </div>

                  <div className="flex flex-col items-center shrink-0">
                    <label className="block font-bold text-[#2C4219] mb-1 text-center">Foto Profil Komunitas</label>
                    <div onClick={() => editAvatarInputRef.current?.click()} className="relative group w-20 h-20 rounded-full border-4 border-[#A8B774] bg-[#FAF6EE] flex items-center justify-center cursor-pointer overflow-hidden shadow-sm">
                      {editGroupAvatar ? (
                        <img src={editGroupAvatar} alt="Grup Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-[#2C4219]">
                          <Upload className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <input ref={editAvatarInputRef} type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleEditAvatarChange} className="hidden" />
                    {editGroupAvatar && (
                      <button type="button" onClick={handleRemoveEditAvatar} className="text-sm text-[#C53030] font-bold mt-2 hover:underline">Hapus Foto</button>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-[#2C4219] mb-1">Nama Komunitas <span className="text-[#C53030]">*</span></label>
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-3 rounded-xl border-2 border-[#E6E1D5] bg-white font-bold" />
                  </div>

                  <div>
                    <label className="block font-bold text-[#2C4219] mb-1">Deskripsi Singkat <span className="text-[#C53030]">*</span></label>
                    <textarea rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full p-3 rounded-xl border-2 border-[#E6E1D5] bg-white font-bold resize-none" />
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#2C4219]" />
                      <label htmlFor="editPermLite" className="text-sm font-bold text-[#433A30]">Izinkan anggota mengirim pesan</label>
                    </div>
                    <input id="editPermLite" type="checkbox" checked={editAllowMemberMessages} onChange={(e) => setEditAllowMemberMessages(e.target.checked)} className="w-6 h-6 accent-[#2C4219]" />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E6E1D5]">
                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-3 rounded-xl border-2 border-[#E6E1D5] font-bold text-[#433A30]">Batal</button>
                    <button type="submit" className="px-5 py-3 rounded-xl bg-[#2C4219] text-white font-bold flex items-center gap-2 shadow-sm">
                      <ShieldCheck className="w-5 h-5" /> Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Image Overlay */}
        {zoomedImage && (
          <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setZoomedImage(null)}>
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full"
              onClick={() => setZoomedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        )}
      </>
    );
  }

  // Daftar Diskusi
  return (
    <div className="w-full h-full bg-[#FAF6EE] sm:bg-transparent px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="w-full space-y-4 pb-20 animate-in fade-in duration-300">
        <div className="bg-[#FAF6EE] p-4 lg:p-5 rounded-2xl border border-[#E6E1D5] flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-[#2C4219]">Ruang Diskusi</h2>
            <p className="text-xs lg:text-sm text-[#433A30] mt-1">Pilih topik untuk membaca atau ikut mengobrol.</p>
          </div>
          <button
            onClick={onOpenCreateModal}
            className="bg-[#2C4219] text-white px-3 py-1.5 rounded-xl active:scale-95 flex items-center gap-1.5 shrink-0 ml-4 shadow-sm transition-transform hover:bg-[#1E2E11]"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-xs font-bold">Buat Topik</span>
          </button>
        </div>

        {/* Search & Filter - Lite Style */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#433A30]/40" />
            <input
              type="text"
              placeholder="Cari topik obrolan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E6E1D5] rounded-xl text-sm font-bold text-[#433A30] placeholder-[#433A30]/40 focus:outline-none focus:border-[#2C4219] shadow-sm"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-white border border-[#E6E1D5] rounded-xl text-sm font-bold text-[#433A30] focus:outline-none focus:border-[#2C4219] shadow-sm appearance-none cursor-pointer"
            >
              {categoryOptions.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.label}
                </option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#433A30]/40">
              <Filter className="w-5 h-5" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#433A30]/40">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {filteredThreads.length > 0 ? filteredThreads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => setSelectedThread(thread)}
              className="bg-white rounded-2xl p-4 border border-[#E6E1D5] active:scale-95 transition-transform cursor-pointer shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-2.5">
                {thread.groupAvatar ? (
                  <img src={thread.groupAvatar} alt={thread.title} className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-[#FAF6EE]" />
                ) : (
                  <div className="w-10 h-10 bg-[#2C4219] rounded-full flex items-center justify-center text-white font-black text-lg shrink-0">
                    {thread.title.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-base text-[#2C4219] line-clamp-2 leading-tight group-hover:text-[#607829] transition-colors">
                    {thread.title}
                  </h3>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#433A30]/80 mt-1 line-clamp-2">
                  {thread.content}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-[#FAF6EE] flex flex-wrap items-center justify-between gap-2 text-[#433A30]/80">
                <span className="text-xs font-bold truncate flex-1 min-w-[100px]">Oleh: {thread.authorName}</span>
                <div className="flex items-center gap-2 shrink-0">
                  {!hasJoined(thread) && (
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-[10px] font-bold shrink-0 whitespace-nowrap">
                      <Lock className="w-3 h-3 text-gray-500" />
                      Terkunci
                    </span>
                  )}
                  <div className="flex items-center gap-1 bg-[#FAF6EE] px-2 py-1 rounded-lg shrink-0 whitespace-nowrap">
                    <MessageSquare className="w-3.5 h-3.5 text-[#607829]" />
                    <span className="text-[11px] font-bold">{thread.repliesCount} balasan</span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full p-12 text-center bg-white rounded-3xl border-2 border-[#E6E1D5]">
              <MessageSquare className="w-12 h-12 text-[#A8B774] mx-auto opacity-70 mb-4" />
              <p className="font-bold text-xl text-[#2C4219]">Tidak ada topik ditemukan</p>
              <p className="text-lg text-[#433A30]/60 mt-2">Coba ubah kata kunci atau kategori pencarian.</p>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Image Overlay */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setZoomedImage(null)}>
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full"
            onClick={() => setZoomedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
