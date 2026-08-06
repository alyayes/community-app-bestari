import React, { useState, useEffect } from 'react';
import {
  Sprout,
  ArrowLeft,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  Phone,
  User,
  Lock,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, CmsData } from '../../types';
import { SERVER_BASE } from '../../api/client';

interface RegisterViewProps {
  cmsData?: CmsData | null;
  onGoToLanding: () => void;
  onGoToLogin: () => void;
  onRegisterSuccess: (user: UserProfile) => void;
  onApiRegister?: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<UserProfile>;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  cmsData,
  onGoToLanding,
  onGoToLogin,
  onRegisterSuccess,
  onApiRegister
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const registerImages = cmsData?.registerImages?.length
    ? cmsData.registerImages.map(i => i.url)
    : (cmsData?.registerImage ? [cmsData.registerImage] : ["https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1200"]);

  const imgUrl = (u: string) => u.startsWith('/uploads/') ? `${SERVER_BASE}${u}` : u;

  useEffect(() => {
    if (registerImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % registerImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [registerImages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Mohon isi Nama Lengkap Anda.');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setErrorMsg('Mohon isi Email atau Nomor WhatsApp Anda.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Mohon isi Kata Sandi.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi Kata Sandi tidak cocok.');
      return;
    }


    setIsLoading(true);

    // ── Register via backend jika tersedia ──
    if (onApiRegister) {
      onApiRegister({
        name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      })
        .then(user => {
          setIsLoading(false);
          onRegisterSuccess(user);
        })
        .catch(err => {
          setIsLoading(false);
          setErrorMsg(err?.message || 'Gagal mendaftar. Coba lagi.');
        });
      return;
    }

    // ── Fallback mock (jika tidak terhubung backend) ──
    setTimeout(() => {
      setIsLoading(false);
      const newUser: UserProfile = {
        id: `user_new_${Date.now()}`,
        name: fullName,
        role: 'Anggota KWT Melati Sorgum',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
        phone: phone || '0812-3456-7890',
        lahanLocation: 'Blok B - Lahan Utara',
        sorghumType: 'Sorgum Bioguma Agritan',
        memberSince: 'Hari ini'
      };
      onRegisterSuccess(newUser);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FAF6EE] font-sans text-[#2C4219]">

      {/* LEFT PANEL: Visual Banner & Branding (50% split) */}
      <div className="w-full md:w-1/2 bg-[#2C4219] p-6 sm:p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden min-h-[280px] md:min-h-screen shrink-0">
        <div className="absolute inset-0 w-full h-full">
          {registerImages.map((url, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === activeImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
            >
              <img
                src={imgUrl(url)}
                alt={`Register Background ${idx + 1}`}
                className="w-full h-full object-cover opacity-85"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C4219]/95 via-[#2C4219]/70 to-[#2C4219]/35 pointer-events-none" />

        {/* Header Logo */}
        <div className="relative z-10 flex items-center justify-between gap-3 w-full">
          <div
            onClick={onGoToLanding}
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            {cmsData?.webLogo ? (
              <img src={cmsData.webLogo.startsWith('/uploads/') ? `${SERVER_BASE}${cmsData.webLogo}` : cmsData.webLogo} alt="Logo" className="w-11 h-11 rounded-full object-contain bg-white shadow-lg group-hover:scale-105 transition-transform border border-[#A8B774]/30 shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#A8B774] text-[#2C4219] flex items-center justify-center font-bold shadow-lg group-hover:scale-105 transition-transform border border-[#A8B774]/30 shrink-0">
                <Sprout className="w-6 h-6" />
              </div>
            )}
            <div className="text-left">
              <span className="font-title font-extrabold text-lg tracking-tight block leading-tight text-white line-clamp-1">
                Community App
              </span>
              <span className="text-[11px] text-[#A8B774] font-extrabold tracking-widest uppercase block mt-0.5 line-clamp-1">
                {cmsData?.webName || 'KWT MELATI SORGUM'}
              </span>
            </div>
          </div>
        </div>

        {/* Left Content Header */}
        <div className="relative z-10 my-auto py-8 space-y-4 max-w-lg mx-auto md:mx-0 w-full">
          <h2 className="font-title font-extrabold text-xl sm:text-2xl lg:text-3xl text-white leading-tight drop-shadow-md">
            {cmsData?.registerTitle ? (
              <span dangerouslySetInnerHTML={{ __html: cmsData.registerTitle.replace('\\n', '<br />') }} />
            ) : (
              <>
                Komunitas Sorgum, <br />
                <span className="text-[#A8B774] underline decoration-[#A8B774]/50 decoration-wavy underline-offset-6">
                  Tumbuh & Maju Bersama
                </span>
              </>
            )}
          </h2>
          <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed">
            {cmsData?.registerDesc || 'Daftar sebagai anggota komunitas untuk terhubung dalam aplikasi KWT, ikuti diskusi kelompok, panduan budidaya, agenda kegiatan gotong royong, dan info pasar olahan.'}
          </p>
        </div>

        {/* Footer Credit */}
        <div className="relative z-10 pt-4 border-t border-white/20 text-xs text-gray-300 font-medium">
          © KWT Melati Sorgum
        </div>
      </div>

      {/* RIGHT PANEL: Complete Registration Form (50% split, centered) */}
      <div className="w-full md:w-1/2 bg-[#FAF6EE] p-6 sm:p-10 lg:p-14 xl:p-16 flex flex-col justify-center items-center min-h-screen">
        <div className="max-w-sm w-full space-y-6 sm:space-y-8 my-auto">

          {/* Header */}
          <div>
            <h1 className="font-title font-extrabold text-lg sm:text-xl lg:text-2xl text-[#2C4219]">
              Buat Akun Baru
            </h1>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-[#C53030]/10 border border-[#C53030]/30 text-[#C53030] text-sm font-semibold flex items-center gap-2.5 shadow-sm">
              <AlertCircle className="w-5 h-5 text-[#C53030] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* FORM REGISTRASI */}
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">

            {/* 1. NAMA LENGKAP */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#2C4219] text-[11px] sm:text-xs">
                Nama Lengkap
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Sesuai KTP (misal: Ibu Suryani)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 pl-9 rounded-xl border-2 border-[#E6E1D5] bg-white text-[#2C4219] font-semibold text-xs focus:outline-none focus:border-[#2C4219] transition-all placeholder:text-[#433A30]/50 placeholder:font-normal"
                />
                <User className="w-4 h-4 text-[#433A30]/70 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 3. EMAIL & NO WHATSAPP (2 KOLOM TERPISAH) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kolom Email */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#2C4219] text-[11px] sm:text-xs">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 pl-9 rounded-xl border-2 border-[#E6E1D5] bg-white text-[#2C4219] font-semibold text-xs focus:outline-none focus:border-[#2C4219] transition-all placeholder:text-[#433A30]/50 placeholder:font-normal"
                  />
                  <Mail className="w-4 h-4 text-[#433A30]/70 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Kolom WhatsApp */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#2C4219] text-[11px] sm:text-xs">
                  No. Handphone (WhatsApp)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 pl-9 rounded-xl border-2 border-[#E6E1D5] bg-white text-[#2C4219] font-semibold text-xs focus:outline-none focus:border-[#2C4219] transition-all placeholder:text-[#433A30]/50 placeholder:font-normal"
                  />
                  <Phone className="w-4 h-4 text-[#433A30]/70 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* 4. KATA SANDI & KONFIRMASI KATA SANDI (2 KOLOM TERPISAH) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kata Sandi */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#2C4219] text-[11px] sm:text-xs">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 pl-9 pr-9 rounded-xl border-2 border-[#E6E1D5] bg-white text-[#2C4219] font-semibold text-xs focus:outline-none focus:border-[#2C4219] transition-all placeholder:text-[#433A30]/50 placeholder:font-normal"
                  />
                  <Lock className="w-4 h-4 text-[#433A30]/70 absolute left-3 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#433A30]/70 hover:text-[#2C4219]"
                    title="Lihat kata sandi"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#2C4219] text-[11px] sm:text-xs">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi kata sandi"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 pl-9 pr-9 rounded-xl border-2 border-[#E6E1D5] bg-white text-[#2C4219] font-semibold text-xs focus:outline-none focus:border-[#2C4219] transition-all placeholder:text-[#433A30]/50 placeholder:font-normal"
                  />
                  <Lock className="w-4 h-4 text-[#433A30]/70 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>



            {/* 6. TOMBOL DAFTAR */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] active:scale-95 transition-all duration-300 disabled:opacity-70 border-2 border-[#A8B774] mt-2"
            >
              {isLoading ? (
                <span>Mendaftarkan Akun...</span>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 text-[#A8B774]" />
                  <span>Daftar Sekarang</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Redirect Option */}
          <div className="text-center text-xs sm:text-sm text-[#433A30] font-medium pt-2 border-t border-[#E6E1D5]">
            Sudah memiliki akun KWT Sorgum?{' '}
            <button
              type="button"
              onClick={onGoToLogin}
              className="font-extrabold text-[#2C4219] hover:text-[#1E2E11] ml-1"
            >
              Masuk di sini
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
