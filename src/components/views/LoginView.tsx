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
  User,
  KeyRound,
  Loader2,
  X
} from 'lucide-react';
import { UserProfile, CmsData } from '../../types';
import { ADMIN_USER } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';
import { SERVER_BASE, BASE_URL } from '../../api/client';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { showToast } = useToast();

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const loginImages = cmsData?.loginImages?.length
    ? cmsData.loginImages.map(i => i.url)
    : (cmsData?.loginImage ? [cmsData.loginImage] : ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200"]);

  const imgUrl = (u: string) => u.startsWith('/uploads/') ? `${SERVER_BASE}${u}` : u;

  useEffect(() => {
    if (loginImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % loginImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [loginImages.length]);

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

      const isAdminInput = email.toLowerCase().includes('admin') ||
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

  const handleForgotPasswordStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim()) {
      setForgotError('Masukkan alamat email yang terdaftar.');
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'OTP berhasil dikirim!', 'success');
        setForgotStep(2);
      } else {
        setForgotError(data.message || 'Gagal mengirim OTP');
      }
    } catch (err) {
      setForgotError('Terjadi kesalahan koneksi jaringan.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleForgotPasswordStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotOtp.trim() || !forgotNewPass.trim()) {
      setForgotError('Masukkan kode OTP dan kata sandi baru.');
      return;
    }
    setIsForgotLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim(), otp: forgotOtp.trim(), newPassword: forgotNewPass })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Kata sandi berhasil diubah!', 'success');
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setForgotNewPass('');
      } else {
        setForgotError(data.message || 'Gagal mengubah kata sandi');
      }
    } catch (err) {
      setForgotError('Terjadi kesalahan koneksi jaringan.');
    } finally {
      setIsForgotLoading(false);
    }
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
            {cmsData?.webLogo ? (
              <img src={imgUrl(cmsData.webLogo)} alt="Logo" className="w-11 h-11 rounded-full object-contain bg-white shadow-lg group-hover:scale-105 transition-transform shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#A8B774] text-[#2C4219] flex items-center justify-center font-bold shadow-lg group-hover:scale-105 transition-transform shrink-0">
                <Sprout className="w-6 h-6" />
              </div>
            )}
            <div className="text-left">
              <span className="font-title font-bold text-lg tracking-tight block leading-tight text-white">
                {cmsData?.webName || 'Community App'}
              </span>
              <span className="text-[11px] text-[#A8B774] font-bold tracking-widest uppercase block mt-0.5">
                {cmsData?.webSubtitle || 'KWT MELATI SORGUM'}
              </span>
            </div>
          </div>
        </div>

        {/* Left Hero Text */}
        <div className="relative z-10 my-auto py-8 space-y-4 max-w-lg mx-auto md:mx-0 w-full">
          <h2 className="font-title font-bold text-xl sm:text-2xl lg:text-3xl text-white leading-tight drop-shadow-md">
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
        <div className="max-w-sm w-full space-y-7 sm:space-y-8 my-auto">

          {/* Form Header */}
          <div>
            <h1 className="font-title font-bold text-lg sm:text-xl lg:text-2xl text-[#2C4219]">
              Masuk Akun
            </h1>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-[#C53030]/10 border border-[#C53030]/30 text-[#C53030] text-sm font-semibold flex items-center gap-2.5 shadow-sm">
              <AlertCircle className="w-5 h-5 text-[#C53030] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SIMPLIFIED LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">

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
                  className="w-full p-3 pl-10 rounded-xl border-2 border-[#E6E1D5] bg-white text-[#2C4219] font-semibold text-xs focus:outline-none focus:border-[#2C4219] transition-all shadow-xs placeholder:text-[#433A30]/50 placeholder:font-normal"
                />
                <Mail className="w-4 h-4 text-[#433A30]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] text-[#2C4219] hover:underline font-bold"
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
                  className="w-full p-3 pl-10 pr-10 rounded-xl border-2 border-[#E6E1D5] bg-white text-[#2C4219] font-semibold text-xs focus:outline-none focus:border-[#2C4219] transition-all shadow-xs placeholder:text-[#433A30]/50 placeholder:font-normal"
                />
                <Lock className="w-4 h-4 text-[#433A30]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#433A30]/70 hover:text-[#2C4219]"
                  title="Lihat kata sandi"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#2C4219] hover:bg-[#1E2E11] text-white font-title font-bold text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 mt-2 border-2 border-[#A8B774]"
            >
              {isLoading ? (
                <span>Memverifikasi Akun...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5 text-[#A8B774]" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Redirect Option */}
          <div className="text-center text-xs sm:text-sm text-[#433A30] font-medium pt-2 border-t border-[#E6E1D5]">
            Belum memiliki akun KWT Sorgum?{' '}
            <button
              type="button"
              onClick={onGoToRegister}
              className="font-bold text-[#2C4219] hover:text-[#1E2E11] ml-1"
            >
              Daftar Akun Baru
            </button>
          </div>

        </div>
      </div>

      {/* LUPA PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] w-full max-w-md rounded-[2rem] p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 border border-[#E6E1D5]">
            <button 
              onClick={() => {
                setShowForgotModal(false);
                setForgotStep(1);
                setForgotError('');
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white text-[#433A30] hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-[#2C4219]/10 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="w-8 h-8 text-[#2C4219]" />
              </div>
              <h3 className="font-title font-bold text-[#2C4219] text-xl">Lupa Kata Sandi?</h3>
              <p className="text-sm text-[#5C5246] mt-2">
                {forgotStep === 1 
                  ? 'Masukkan email yang terdaftar, kami akan mengirimkan kode OTP untuk mengatur ulang kata sandi Anda.' 
                  : 'Masukkan kode OTP yang telah dikirim ke email Anda beserta kata sandi baru.'}
              </p>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs text-center font-medium">
                {forgotError}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotPasswordStep1} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Masukkan alamat email..."
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full p-3 pl-10 rounded-xl border border-[#E6E1D5] bg-white focus:outline-none focus:border-[#2C4219] text-sm"
                  />
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full py-3.5 bg-[#2C4219] hover:bg-[#1E2E11] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
                >
                  {isForgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirim Kode OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotPasswordStep2} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Kode OTP 6 Digit"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E6E1D5] bg-white focus:outline-none focus:border-[#2C4219] text-center tracking-[0.5em] text-lg font-bold text-[#2C4219]"
                    maxLength={6}
                  />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Kata Sandi Baru"
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    autoComplete="new-password"
                    className="w-full p-3 pl-10 rounded-xl border border-[#E6E1D5] bg-white focus:outline-none focus:border-[#2C4219] text-sm"
                  />
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full py-3.5 bg-[#2C4219] hover:bg-[#1E2E11] text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
                >
                  {isForgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Kata Sandi Baru'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
