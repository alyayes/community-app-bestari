import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { 
  Camera, 
  Check, 
  Edit3, 
  Save, 
  X,
  Lock
} from 'lucide-react';

interface ProfilViewProps {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200', // Professional/Leader
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200', // Active member
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', // Friendly farmer
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200', // Senior farmer
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200', // Young advisor
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=200'  // Officer
];

export const ProfilView: React.FC<ProfilViewProps> = ({ currentUser, setCurrentUser }) => {
  // Editing states for sections
  const [isEditPersonal, setIsEditPersonal] = useState(false);
  const [isEditAddress, setIsEditAddress] = useState(false);

  // Success toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Avatar selector state
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Section 1: Personal Info Form States
  const [firstName, setFirstName] = useState(currentUser.firstName || 'Hj. Kartini');
  const [lastName, setLastName] = useState(currentUser.lastName || 'Suharto');
  const [dob, setDob] = useState(currentUser.dob || '15-05-1978');
  const [email, setEmail] = useState(currentUser.email || 'kartini@kwt-melatisorgum.id');
  const [phone, setPhone] = useState(currentUser.phone || '0812-7890-4321');
  const [avatar, setAvatar] = useState(currentUser.avatar);

  // Section 2: Address & Lahan Form States
  const [country, setCountry] = useState(currentUser.country || 'Indonesia');
  const [city, setCity] = useState(currentUser.city || 'Sleman, Yogyakarta');
  const [postalCode, setPostalCode] = useState(currentUser.postalCode || '55581');
  const [lahanLocation, setLahanLocation] = useState(currentUser.lahanLocation || 'Blok B - Lahan Utara');
  const [sorghumType, setSorghumType] = useState(currentUser.sorghumType || 'Sorgum Bioguma Agritan');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...currentUser,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      dob,
      email,
      phone,
      avatar
    };
    setCurrentUser(updatedUser);
    setIsEditPersonal(false);
    triggerToast('Informasi Pribadi berhasil diperbarui!');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...currentUser,
      country,
      city,
      postalCode,
      lahanLocation,
      sorghumType
    };
    setCurrentUser(updatedUser);
    setIsEditAddress(false);
    triggerToast('Alamat & Lahan berhasil diperbarui!');
  };

  const handleSelectAvatar = (url: string) => {
    setAvatar(url);
    const updatedUser: UserProfile = {
      ...currentUser,
      avatar: url
    };
    setCurrentUser(updatedUser);
    setShowAvatarSelector(false);
    triggerToast('Foto profil berhasil diubah!');
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-6xl mx-auto font-sans text-[#433A30]">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#2C4219] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-[#A8B774] animate-in fade-in slide-in-from-top-4 duration-300">
          <Check className="w-4 h-4 text-[#A8B774] stroke-[3]" />
          <span className="text-xs sm:text-sm font-extrabold">{toastMessage}</span>
        </div>
      )}



      {/* Card 1: Header Profile Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6E1D5] shadow-2xs flex items-center gap-6 relative">
        {/* Avatar Area */}
        <div className="relative group cursor-pointer shrink-0">
          <img
            src={avatar}
            alt={currentUser.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-[#2C4219]/20 shadow-xs"
          />
          <button
            type="button"
            onClick={() => setShowAvatarSelector(!showAvatarSelector)}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#2C4219] text-white border border-white hover:bg-[#1E2E11] transition-all shadow-xs"
            title="Ubah Foto Profil"
          >
            <Camera className="w-3.5 h-3.5 text-[#A8B774]" />
          </button>
        </div>

        {/* User Quick Info */}
        <div className="space-y-1">
          <h3 className="font-title font-black text-xl sm:text-2xl text-[#2C4219] leading-tight">
            {currentUser.name}
          </h3>
          <p className="text-xs sm:text-sm font-bold text-[#7A7062]/80 leading-none">
            {currentUser.role}
          </p>
          <p className="text-xs text-[#7A7062]/60 font-semibold pt-0.5">
            {city}, {country}
          </p>
        </div>
      </div>

      {/* Preset Avatar Grid Drawer */}
      {showAvatarSelector && (
        <div className="bg-white p-5 rounded-2xl border-2 border-[#A8B774] shadow-xs space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="font-title font-bold text-xs sm:text-sm text-[#2C4219]">Pilih Foto Profil Anggota KWT</h4>
            <button
              onClick={() => setShowAvatarSelector(false)}
              className="text-xs text-[#433A30]/60 hover:text-[#C53030] font-bold"
            >
              Batal
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {PRESET_AVATARS.map((url, idx) => {
              const isSelected = avatar === url;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectAvatar(url)}
                  className={`relative cursor-pointer rounded-full overflow-hidden aspect-square border-4 transition-all hover:scale-105 ${
                    isSelected ? 'border-[#2C4219] scale-105 shadow-xs' : 'border-[#FAF6EE] hover:border-[#E6E1D5]'
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#2C4219]/40 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Card 2: Personal Information */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6E1D5] shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#FAF6EE] pb-4 mb-6">
          <h3 className="font-title font-black text-sm sm:text-base text-[#2C4219] tracking-tight">
            Informasi Pribadi
          </h3>
          {!isEditPersonal ? (
            <button
              onClick={() => setIsEditPersonal(true)}
              className="px-4 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-white" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditPersonal(false)}
                className="px-3 py-1.5 border border-[#E6E1D5] hover:bg-[#FAF6EE] text-[#433A30] rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSavePersonal}
                className="px-4 py-1.5 bg-[#2C4219] hover:bg-[#1E2E11] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#A8B774]" />
                <span>Simpan</span>
              </button>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <form onSubmit={handleSavePersonal} className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-12">
          {/* First Name */}
          <div className="space-y-1.5">
            <span className="block text-[10px] sm:text-xs font-extrabold text-[#7A7062] uppercase tracking-wider">
              Nama Depan
            </span>
            {isEditPersonal ? (
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#2C4219] font-semibold"
                required
              />
            ) : (
              <span className="block text-xs sm:text-sm font-black text-[#2C4219]">{firstName}</span>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <span className="block text-[10px] sm:text-xs font-extrabold text-[#7A7062] uppercase tracking-wider">
              Nama Belakang
            </span>
            {isEditPersonal ? (
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#2C4219] font-semibold"
                required
              />
            ) : (
              <span className="block text-xs sm:text-sm font-black text-[#2C4219]">{lastName}</span>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <span className="block text-[10px] sm:text-xs font-extrabold text-[#7A7062] uppercase tracking-wider">
              Tanggal Lahir
            </span>
            {isEditPersonal ? (
              <input
                type="text"
                value={dob}
                placeholder="DD-MM-YYYY"
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#2C4219] font-semibold"
              />
            ) : (
              <span className="block text-xs sm:text-sm font-black text-[#2C4219]">
                {dob || '-'}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <span className="block text-[10px] sm:text-xs font-extrabold text-[#7A7062] uppercase tracking-wider">
              Alamat Email
            </span>
            {isEditPersonal ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#2C4219] font-semibold"
              />
            ) : (
              <span className="block text-xs sm:text-sm font-black text-[#2C4219] break-all">
                {email || '-'}
              </span>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <span className="block text-[10px] sm:text-xs font-extrabold text-[#7A7062] uppercase tracking-wider">
              Nomor WhatsApp
            </span>
            {isEditPersonal ? (
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#2C4219] font-semibold"
              />
            ) : (
              <span className="block text-xs sm:text-sm font-black text-[#2C4219]">
                {phone || '-'}
              </span>
            )}
          </div>

          {/* User Role */}
          <div className="space-y-1.5">
            <span className="block text-[10px] sm:text-xs font-extrabold text-[#7A7062] uppercase tracking-wider">
              Peran Pengguna
            </span>
            <span className="text-xs sm:text-sm font-black text-[#2C4219] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#7A7062]" />
              {currentUser.role}
            </span>
          </div>
        </form>
      </div>

      {/* Card 3: Informasi Lahan & Tani */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E6E1D5] shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#FAF6EE] pb-4 mb-6">
          <h3 className="font-title font-black text-sm sm:text-base text-[#2C4219] tracking-tight">
            Informasi Lahan & Tani
          </h3>
          {!isEditAddress ? (
            <button
              onClick={() => setIsEditAddress(true)}
              className="px-4 py-1.5 border border-[#E6E1D5] hover:bg-[#FAF6EE] text-[#433A30] rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#7A7062]" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditAddress(false)}
                className="px-3 py-1.5 border border-[#E6E1D5] hover:bg-[#FAF6EE] text-[#433A30] rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAddress}
                className="px-4 py-1.5 bg-[#2C4219] hover:bg-[#1E2E11] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#A8B774]" />
                <span>Simpan</span>
              </button>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-12">
          {/* Lahan Location */}
          <div className="space-y-1.5">
            <span className="block text-[10px] sm:text-xs font-extrabold text-[#7A7062] uppercase tracking-wider">
              Lokasi Lahan Kerja KWT
            </span>
            {isEditAddress ? (
              <select
                value={lahanLocation}
                onChange={(e) => setLahanLocation(e.target.value)}
                className="w-full bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#2C4219] font-semibold cursor-pointer"
              >
                <option value="">-- Pilih Lahan Kerja --</option>
                <option value="Lahan Blok A (Lahan Utama)">Lahan Blok A (Lahan Utama)</option>
                <option value="Lahan Blok B (Sektor Barat)">Lahan Blok B (Sektor Barat)</option>
                <option value="Lahan Blok C (Sektor Timur)">Lahan Blok C (Sektor Timur)</option>
                <option value="Lahan Blok D (Bukit Utara)">Lahan Blok D (Bukit Utara)</option>
              </select>
            ) : (
              <span className="block text-xs sm:text-sm font-black text-[#2C4219]">
                {lahanLocation || '-'}
              </span>
            )}
          </div>

          {/* Sorghum Type */}
          <div className="space-y-1.5">
            <span className="block text-[10px] sm:text-xs font-extrabold text-[#7A7062] uppercase tracking-wider">
              Varietas Sorgum Utama
            </span>
            {isEditAddress ? (
              <select
                value={sorghumType}
                onChange={(e) => setSorghumType(e.target.value)}
                className="w-full bg-[#FAF6EE] border border-[#E6E1D5] rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#2C4219] font-semibold cursor-pointer"
              >
                <option value="">-- Pilih Varietas Sorgum --</option>
                <option value="Bioguma Agritan 1">Bioguma Agritan 1</option>
                <option value="Varietas Numbu">Varietas Numbu</option>
                <option value="Bioguma Agritan 2">Bioguma Agritan 2</option>
                <option value="Varietas Super 1">Varietas Super 1</option>
              </select>
            ) : (
              <span className="block text-xs sm:text-sm font-black text-[#2C4219]">
                {sorghumType || '-'}
              </span>
            )}
          </div>

          {/* Member Since */}
          <div className="space-y-1.5">
            <span className="block text-[10px] sm:text-xs font-extrabold text-[#7A7062] uppercase tracking-wider">
              Tanggal Bergabung KWT
            </span>
            <span className="block text-xs sm:text-sm font-black text-[#2C4219]">
              {currentUser.memberSince || 'Maret 2024'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
