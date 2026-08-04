import React, { useState, useEffect } from 'react';
import {
  Sprout,
  ArrowLeft,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Mail,
  Lock,
  ShieldCheck,
  User
} from 'lucide-react';
import { UserProfile, CmsData } from '../../types';
import { ADMIN_USER } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';
interface LoginViewProps {
  cmsData?: CmsData | null;
  onGoToLanding: () => void;
  onGoToRegister: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onApiLogin?: (email: string, password: string) => Promise<UserProfile>;
}
export const LoginView: React.FC<LoginViewProps> = ({
  cmsData,
  onGoToLanding,
  onGoToRegister,
  onLoginSuccess,
  onApiLogin
}) => {
  const [accountType, setAccountType] = useState<'member' | 'admin'>('member');
  const [email, setEmail] = useState('anggota@kwtsorgum.id');
  const [password, setPassword] = useState('sorgum123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { showToast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const loginImages = cmsData?.loginImages?.length
    ? cmsData.loginImages.map(i => i.url)
    : (cmsData?.loginImage ? [cmsData.loginImage] : ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200"]);

  const imgUrl = (u: string) => u.startsWith('/uploads/') ? `http://localhost:8000${u}` : u;

  useEffect(() => {
    if (loginImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % loginImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [loginImages.length]);

  const handleSelectType = (type: 'member' | 'admin') => {
    setAccountType(type);
    if (type === 'admin') {
      setEmail('admin@kwtsorgum.id');
      setPassword('admin123');
    } else {
      setEmail('anggota@kwtsorgum.id');
      setPassword('sorgum123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Mohon isi alamat email dan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    // ── Login via backend jika tersedia ──
    if (onApiLogin) {
      onApiLogin(email.trim(), password)
        .then(user => {
          setIsLoading(false);
          onLoginSuccess(user);
        })
        .catch(err => {
          setIsLoading(false);
          setErrorMsg(err?.message || 'Email atau password salah.');
        });
      return;
    }

    // ── Fallback mock (jika tidak terhubung backend) ──
    setTimeout(() => {
      setIsLoading(false);

      const isAdminInput = accountType === 'admin' ||
        email.toLowerCase().includes('admin') ||
        password.toLowerCase().includes('admin');

      if (isAdminInput) {
        onLoginSuccess(ADMIN_USER);
      } else {
        const loggedUser: UserProfile = {
          id: 'user_active_1',
          name: 'Ibu Hj. Kartini',
          role: 'Anggota KWT Melati Sorgum',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
          isAdmin: false,
          phone: '0812-7890-4321',
          lahanLocation: '',
          sorghumType: '',
          memberSince: 'Maret 2024',
          firstName: 'Hj. Kartini',
          lastName: 'Suharto',
          dob: '',
          email: email.trim() || 'kartini@kwt-melatisorgum.id',
          country: '',
          city: '',
          postalCode: ''
        };
        onLoginSuccess(loggedUser);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#FAF6EE] font-sans">

      {/* LEFT PANEL: Branding & Photo Background (50% split) */}
      <div className="w-full md:w-1/2 bg-[#2C4219] p-6 sm:p-10 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden min-h-[280px] md:min-h-screen shrink-0">
        <div className="absolute inset-0 w-full h-full">
          {loginImages.map((url, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === activeImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
            >
              <img
                src={imgUrl(url)}
                alt={`Login Background ${idx + 1}`}
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
            <div className="w-11 h-11 rounded-full bg-[#A8B774] text-[#2C4219] flex items-center justify-center font-bold shadow-lg group-hover:scale-105 transition-transform shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="font-title font-extrabold text-lg tracking-tight block leading-tight text-white">
                Community App
              </span>
              <span className="text-[11px] text-[#A8B774] font-extrabold tracking-widest uppercase block mt-0.5">
                KWT MELATI SORGUM
              </span>
            </div>
          </div>
        </div>

        {/* Left Hero Text */}
        <div className="relative z-10 my-auto py-8 space-y-4 max-w-lg mx-auto md:mx-0 w-full">
          <h2 className="font-title font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight drop-shadow-md">
            {cmsData?.loginTitle ? (
              <span dangerouslySetInnerHTML={{ __html: cmsData.loginTitle.replace('\\n', '<br />') }} />
            ) : (
              <>
                Selamat Datang <br />
                <span className="text-[#A8B774] underline decoration-[#A8B774]/60 decoration-wavy">Kembali Ibu!</span>
              </>
            )}
          </h2>
          <p className="text-sm sm:text-base text-gray-200 font-medium leading-relaxed max-w-md">
            {cmsData?.loginDesc || 'Masuk ke akun Anda untuk melihat catatan panen, informasi agenda gotong royong, serta kabar diskusi komunitas KWT Melati Sorgum.'}
          </p>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 pt-4 border-t border-white/20 text-xs text-gray-300 font-medium">
          © KWT Melati Sorgum
        </div>
      </div>

      {/* RIGHT PANEL: Login Form (50% split, centered) */}
      <div className="w-full md:w-1/2 bg-[#FAF6EE] p-6 sm:p-10 lg:p-16 flex flex-col justify-center items-center min-h-screen">
        <div className="max-w-xl w-full space-y-7 sm:space-y-8 my-auto">

          {/* Form Header */}
          <div className="space-y-3 pb-2 border-b border-[#E6E1D5]">
            <h1 className="font-title font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#2C4219]">
              Masuk Akun
            </h1>
            <p className="text-sm sm:text-base text-[#433A30] font-medium">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={onGoToRegister}
                className="font-extrabold text-[#2C4219] underline hover:text-[#1E2E11]"
              >
                Daftar di sini
              </button>
            </p>

            {/* Role Type Selector Tabs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleSelectType('member')}
                className={`py-3.5 px-4 rounded-2xl border-2 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all ${accountType === 'member'
                    ? 'border-[#2C4219] bg-[#2C4219] text-white shadow-md'
                    : 'border-[#E6E1D5] bg-white text-[#433A30] hover:bg-[#FAF6EE]'
                  }`}
              >
                <User className={`w-5 h-5 ${accountType === 'member' ? 'text-[#A8B774]' : 'text-[#433A30]/70'}`} />
                <span>Anggota KWT</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectType('admin')}
                className={`py-3.5 px-4 rounded-2xl border-2 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all ${accountType === 'admin'
                    ? 'border-[#2C4219] bg-[#2C4219] text-white shadow-md'
                    : 'border-[#E6E1D5] bg-white text-[#433A30] hover:bg-[#FAF6EE]'
                  }`}
              >
                <ShieldCheck className={`w-5 h-5 ${accountType === 'admin' ? 'text-[#A8B774]' : 'text-[#433A30]/70'}`} />
                <span>Admin Portal</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-[#C53030]/10 border border-[#C53030]/30 text-[#C53030] text-sm font-semibold flex items-center gap-2.5 shadow-sm">
              <AlertCircle className="w-5 h-5 text-[#C53030] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SIMPLIFIED LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-5 text-sm">

            {/* Field 1: Email */}
            <div className="space-y-1.5">
              <label className="block font-bold text-[#2C4219]">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Contoh: anggota@kwtsorgum.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 pl-12 rounded-2xl border-2 border-[#E6E1D5] bg-white text-[#2C4219] font-semibold text-base focus:outline-none focus:border-[#2C4219] transition-all shadow-xs placeholder:text-[#433A30]/50 placeholder:font-normal"
                />
                <Mail className="w-5 h-5 text-[#433A30]/70 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Field 2: Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-[#2C4219]">
                  Kata Sandi (Password)
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Silakan hubungi sekretariat KWT atau ketua kelompok di Balai Desa untuk mereset kata sandi Anda.', 'info')}
                  className="text-xs text-[#2C4219] hover:underline font-extrabold"
                >
                  Lupa kata sandi?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi Anda..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pl-12 pr-12 rounded-2xl border-2 border-[#E6E1D5] bg-white text-[#2C4219] font-semibold text-base focus:outline-none focus:border-[#2C4219] transition-all shadow-xs placeholder:text-[#433A30]/50 placeholder:font-normal"
                />
                <Lock className="w-5 h-5 text-[#433A30]/70 absolute left-4 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#433A30]/70 hover:text-[#2C4219]"
                  title="Lihat kata sandi"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-full bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-extrabold text-lg flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 mt-2 border-2 border-[#A8B774]"
            >
              {isLoading ? (
                <span>Memverifikasi Akun...</span>
              ) : (
                <>
                  <LogIn className="w-6 h-6 text-[#A8B774]" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Redirect Option */}
          <div className="text-center text-sm sm:text-base text-[#433A30] font-medium pt-2 border-t border-[#E6E1D5]">
            Belum memiliki akun KWT Sorgum?{' '}
            <button
              type="button"
              onClick={onGoToRegister}
              className="font-extrabold text-[#2C4219] underline hover:text-[#1E2E11] ml-1"
            >
              Daftar Akun Baru
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
