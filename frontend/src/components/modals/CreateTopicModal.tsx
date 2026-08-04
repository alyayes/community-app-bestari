import React, { useState, useRef } from 'react';
import { ForumThread, UserProfile } from '../../types';
import { MessageSquare, AlertCircle, X, ShieldCheck, Users, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSubmit: (newThread: ForumThread) => void;
}

export const CreateTopicModal: React.FC<CreateTopicModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
}) => {
  const [category, setCategory] = useState<string>('Produksi & Pengolahan');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [groupAvatarPreview, setGroupAvatarPreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [allowMemberMessages, setAllowMemberMessages] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match('image/(jpeg|jpg|png)')) {
        setErrorMsg('Foto profil grup harus berupa gambar JPG, JPEG, atau PNG.');
        return;
      }
      setErrorMsg('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setGroupAvatarPreview(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList: File[] = Array.from(files);
      const invalid = fileList.some((f: File) => !f.type.match('image/(jpeg|jpg|png)'));
      if (invalid) {
        setErrorMsg('Semua file harus berupa gambar format JPG, JPEG, atau PNG.');
        return;
      }
      setErrorMsg('');

      const newPreviews: string[] = [];
      let processed = 0;

      fileList.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            newPreviews.push(reader.result as string);
          }
          processed++;
          if (processed === fileList.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setErrorMsg('Pilih Kategori Topik Diskusi terlebih dahulu!');
      return;
    }
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Nama Grup / Topik dan Deskripsi tidak boleh kosong.');
      return;
    }

    const categoryMapping: Record<string, 'Produksi & Pengolahan' | 'Budidaya Lahan' | 'Pemasaran & UMKM' | 'Informasi Umum'> = {
      'Produksi & Pengolahan': 'Produksi & Pengolahan',
      'Budidaya & Lahan': 'Budidaya Lahan',
      'Pemasaran & UMKM': 'Pemasaran & UMKM',
      'Obrolan Umum': 'Informasi Umum'
    };

    const badgeColors: Record<string, string> = {
      'Produksi & Pengolahan': '#2C4219',
      'Budidaya & Lahan': '#A8B774',
      'Pemasaran & UMKM': '#572E4A',
      'Obrolan Umum': '#433A30'
    };

    const selectedKey = Object.keys(categoryMapping).find(k => category.includes(k)) || 'Obrolan Umum';

    const thread: ForumThread = {
      id: `th_${Date.now()}`,
      title: title.trim(),
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      isTopicStarter: true,
      timeAgo: 'Baru saja',
      category: categoryMapping[selectedKey],
      categoryBadgeColor: badgeColors[selectedKey] || '#2C4219',
      summary: description.trim().slice(0, 100) + '...',
      content: description.trim(),
      images: imagePreviews.length > 0 ? imagePreviews : undefined,
      groupAvatar: groupAvatarPreview || undefined,
      allowMemberMessages: allowMemberMessages,
      joinedMembers: [currentUser.name],
      likes: 1,
      userLiked: true,
      repliesCount: 0,
      comments: []
    };

    onSubmit(thread);
    onClose();
    setCategory('Produksi & Pengolahan');
    setTitle('');
    setDescription('');
    setGroupAvatarPreview(null);
    setImagePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (avatarInputRef.current) avatarInputRef.current.value = '';
    setAllowMemberMessages(true);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl p-6 shadow-xl border border-[#E6E1D5] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E6E1D5]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#2C4219] text-white">
              <MessageSquare className="w-5 h-5 text-[#A8B774]" />
            </div>
            <div>
              <h3 className="font-title font-bold text-base text-[#2C4219]">Buat Topik / Grup Chat Baru</h3>
              <p className="text-[11px] text-[#433A30]/70">Tambahkan grup diskusi komunitas KWT Sorgum</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#433A30]/70 hover:bg-[#FAF6EE] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#C53030]/10 text-[#C53030] border border-[#C53030]/30 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. MANDATORY CATEGORY DROPDOWN SELECTOR */}
          <div>
            <label className="block font-bold text-[#2C4219] mb-1">
              Pilih Kategori Topik Diskusi <span className="text-[#C53030]">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setErrorMsg('');
              }}
              className="w-full p-3 rounded-xl border-2 border-[#A8B774] bg-[#FAF6EE] text-[#433A30] font-bold focus:outline-none focus:border-[#2C4219] transition-colors cursor-pointer"
            >
              <option value="Produksi & Pengolahan">🥣 Produksi & Pengolahan (Resep / Tepung Sorgum)</option>
              <option value="Budidaya & Lahan">🌾 Budidaya & Lahan (Hama / Panen / Pupuk)</option>
              <option value="Pemasaran & UMKM">🛍️ Pemasaran & UMKM (Penjualan / Produk)</option>
              <option value="Obrolan Umum">📢 Obrolan Umum & Tanya Jawab</option>
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
                onClick={() => avatarInputRef.current?.click()}
                className="relative group w-14 h-14 rounded-full border-2 border-dashed border-[#A8B774] hover:border-[#2C4219] bg-[#FAF6EE] flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-200"
                title="Pilih foto profil grup"
              >
                {groupAvatarPreview ? (
                  <>
                    <img 
                      src={groupAvatarPreview} 
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
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleAvatarChange}
                className="hidden"
              />
              {groupAvatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
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
                placeholder="Contoh: Pelatihan Olahan Kue Kering Sorgum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-white text-[#433A30] placeholder-[#433A30]/40 focus:outline-none focus:border-[#2C4219] font-medium"
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
              placeholder="Jelaskan ringkasan atau batasan topik yang akan didiskusikan di grup ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-white text-[#433A30] placeholder-[#433A30]/40 focus:outline-none focus:border-[#2C4219] font-medium resize-none"
            />
          </div>

          {/* 4. Optional Photo / Image Field */}
          <div>
            <label className="block font-bold text-[#2C4219] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#2C4219]" /> Lampiran Foto / Gambar (JPG/PNG)
              </span>
              <span className="text-[10px] text-[#433A30]/50 font-normal">(Bisa upload beberapa foto)</span>
            </label>

            {imagePreviews.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  {imagePreviews.map((img, index) => (
                    <div key={index} className="relative group rounded-xl border border-[#E6E1D5] bg-[#FAF6EE] overflow-hidden aspect-square">
                      <img
                        src={img}
                        alt={`Lampiran ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-[#C53030] text-white rounded-lg shadow-2xs hover:bg-[#A32525] transition-colors"
                        title="Hapus foto ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E6E1D5] hover:border-[#2C4219] bg-[#FAF6EE]/60 hover:bg-[#FAF6EE] text-[#2C4219] aspect-square transition-colors p-2 text-center"
                  >
                    <Upload className="w-4 h-4 mb-1 text-[#2C4219]/70" />
                    <span className="text-[10px] font-bold leading-tight">+ Tambah Foto</span>
                  </button>
                </div>

                <p className="text-[10px] text-[#2C4219] font-medium">
                  {imagePreviews.length} foto terpilih
                </p>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3.5 rounded-xl border-2 border-dashed border-[#E6E1D5] hover:border-[#2C4219] bg-[#FAF6EE]/60 hover:bg-[#FAF6EE] text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 group"
              >
                <Upload className="w-5 h-5 text-[#2C4219]/60 group-hover:text-[#2C4219] transition-colors" />
                <p className="text-xs font-bold text-[#2C4219]">Klik untuk pilih satu atau beberapa foto (JPG, PNG)</p>
                <p className="text-[10px] text-[#433A30]/50">Dapat memilih lebih dari 1 file gambar</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* 5. Permission Toggle */}
          <div className="p-3.5 rounded-xl bg-[#FAF6EE] border border-[#E6E1D5] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#2C4219] shrink-0" />
              <label htmlFor="permissionCheck" className="text-xs font-semibold text-[#433A30] cursor-pointer">
                Izinkan semua ibu-ibu anggota mengirim pesan
              </label>
            </div>
            <input
              id="permissionCheck"
              type="checkbox"
              checked={allowMemberMessages}
              onChange={(e) => setAllowMemberMessages(e.target.checked)}
              className="w-4 h-4 accent-[#2C4219] rounded cursor-pointer shrink-0"
            />
          </div>

          {/* 5. Form Footer */}
          <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E6E1D5] font-bold text-[#433A30] hover:bg-[#FAF6EE] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold flex items-center gap-2 shadow-xs transition-all active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-[#A8B774]" />
              <span>Buat Grup Chat</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

