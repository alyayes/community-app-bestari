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

import { apiUpdateProfile } from '../../api/client';

interface ProfilViewProps {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
}



export const ProfilView: React.FC<ProfilViewProps> = ({ currentUser, setCurrentUser }) => {
  // Editing states for sections
  const [isEditPersonal, setIsEditPersonal] = useState(false);
  const [isEditAddress, setIsEditAddress] = useState(false);

  // Success toast state
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { firstName, lastName, dob, email, phone };
      const updatedProfile = await apiUpdateProfile(payload);
      setCurrentUser(updatedProfile);
      setIsEditPersonal(false);
      triggerToast('Informasi Pribadi berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { country, city, postalCode, lahanLocation, sorghumType };
      const updatedProfile = await apiUpdateProfile(payload);
      setCurrentUser(updatedProfile);
      setIsEditAddress(false);
      triggerToast('Alamat & Lahan berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan alamat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setAvatar(base64);
      try {
        const updatedProfile = await apiUpdateProfile({ avatar: base64 });
        setCurrentUser(updatedProfile);
        triggerToast('Foto profil berhasil diunggah!');
      } catch (err: any) {
        alert(err.message || 'Gagal menyimpan foto profil');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung oleh browser ini.');
      return;
    }
    
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, {
            headers: {
              'User-Agent': 'BestariApp/1.0 (contact@kwt-melatisorgum.id)'
            }
          });
          const data = await res.json();
          if (data && data.address) {
            const fetchedCity = data.address.city || data.address.town || data.address.county || 'Sleman, Yogyakarta';
            const fetchedCountry = data.address.country || 'Indonesia';
            
            setCity(fetchedCity);
            setCountry(fetchedCountry);
            
            const updatedProfile = await apiUpdateProfile({ city: fetchedCity, country: fetchedCountry });
            setCurrentUser(updatedProfile);
            triggerToast('Lokasi berhasil disesuaikan dengan device!');
          }
        } catch (err) {
          alert('Gagal mengambil lokasi: layanan Nominatim sibuk atau ditolak.');
          setIsGettingLocation(false);
        }
      },
      async (error) => {
        // Fallback to IP-based location if GPS fails or is denied
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data && data.city && data.country_name) {
            setCity(data.city);
            setCountry(data.country_name);
            
            const updatedProfile = await apiUpdateProfile({ city: data.city, country: data.country_name });
            setCurrentUser(updatedProfile);
            triggerToast('Lokasi disesuaikan menggunakan IP karena GPS tidak tersedia.');
          } else {
            alert('Gagal melacak lokasi perangkat.');
          }
        } catch (fallbackErr) {
          alert('Izin lokasi ditolak dan pelacakan alternatif gagal.');
        } finally {
          setIsGettingLocation(false);
        }
      },
      {
        timeout: 10000,
        enableHighAccuracy: false
      }
    );
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
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAvatarUpload} 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#2C4219] text-white border border-white hover:bg-[#1E2E11] transition-all shadow-xs"
            title="Upload Foto Profil"
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
          <p className="text-xs text-[#7A7062]/60 font-semibold pt-0.5 flex items-center gap-1.5">
            {city}, {country}
            <button 
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              className="px-2 py-0.5 ml-2 bg-[#FAF6EE] border border-[#E6E1D5] hover:bg-[#E6E1D5] text-[10px] text-[#433A30] rounded-full font-bold transition-all disabled:opacity-50"
              title="Sesuaikan lokasi dengan device saat ini"
            >
              {isGettingLocation ? 'Mencari...' : 'Sesuaikan Lokasi'}
            </button>
          </p>
        </div>
      </div>



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
