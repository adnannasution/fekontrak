import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isVendorRole } from '@/hooks/useRolePermissionsConfig';
import SignUpForm from '@/components/auth/SignUpForm';

const getRedirectPath = (role?: string) =>
  isVendorRole(role) ? '/kontrak-lumpsum' : '/dashboard';

const PertaminaMark = ({ size = 56 }: { size?: number }) => (
  <svg
    width={size}
    height={Math.round(size * 0.72)}
    viewBox="0 0 110 79"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Red wing - top */}
    <polygon points="26,2 94,2 80,28 12,28" fill="#E31E24" />
    {/* Blue wing - bottom left */}
    <clipPath id="pn-clip">
      <rect x="0" y="0" width="110" height="79" />
    </clipPath>
    <polygon points="0,34 50,34 36,62 -14,62" fill="#1B4FA2" clipPath="url(#pn-clip)" />
    {/* Green wing - bottom right */}
    <polygon points="32,34 64,34 52,60 20,60" fill="#8CC63F" />
  </svg>
);

const features = [
  { icon: '📋', label: 'Manajemen Kontrak Terintegrasi' },
  { icon: '📊', label: 'Monitoring Progress Real-time' },
  { icon: '💰', label: 'Kontrol Anggaran & Pembayaran' },
  { icon: '🔧', label: 'Supervisory & Control Tools' },
];

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(getRedirectPath((user as any)?.role));
    }
  }, [authLoading, user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (!error) {
      const token = localStorage.getItem('token');
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
      navigate(getRedirectPath(payload?.role));
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (!error) {
      setRegisterSuccess(true);
      setEmail('');
      setPassword('');
      setFullName('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── LEFT BRAND PANEL ────────────────────────────────── */}
      <div
        className="relative lg:w-[55%] flex flex-col justify-between overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #001B4E 0%, #003375 35%, #0055A5 65%, #003D7A 100%)',
          minHeight: '300px',
        }}
      >
        {/* Subtle noise/glow layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 15% 50%, rgba(255,255,255,0.04) 0%, transparent 55%),' +
              'radial-gradient(ellipse at 85% 15%, rgba(227,30,36,0.12) 0%, transparent 45%),' +
              'radial-gradient(ellipse at 60% 85%, rgba(27,79,162,0.25) 0%, transparent 50%)',
          }}
        />

        {/* Diagonal grid lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04]"
          viewBox="0 0 600 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4, 5].map(i => (
            <line key={`h${i}`} x1="0" y1={150 * i} x2="600" y2={150 * i - 60} stroke="white" strokeWidth="1" />
          ))}
          {[100, 250, 400, 550].map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="900" stroke="white" strokeWidth="1" />
          ))}
        </svg>

        {/* Top red accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, #E31E24 0%, #FF5E40 50%, #E31E24 100%)' }}
        />

        {/* ── TOP: Logo ── */}
        <div className="relative z-10 p-8 lg:p-12">
          <div
            className={`flex items-center gap-4 transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <div className="bg-white rounded-2xl p-3 shadow-xl">
              <PertaminaMark size={46} />
            </div>
            <div className="leading-none">
              <div className="text-white font-black text-xl tracking-tight">PERTAMINA</div>
              <div className="text-red-400 font-bold text-sm tracking-[0.2em] mt-1">PATRA NIAGA</div>
            </div>
          </div>
        </div>

        {/* ── CENTER: App branding ── */}
        <div
          className={`relative z-10 px-8 lg:px-12 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <span className="text-red-300 text-[11px] font-semibold tracking-[0.18em] uppercase">
              Maintenance Management System
            </span>
          </div>

          {/* App title */}
          <h1 className="text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none mb-3">
            MAESTRO
          </h1>
          <div className="w-14 h-1 bg-red-500 rounded-full mb-5" />
          <p className="text-blue-200 text-base lg:text-lg leading-relaxed max-w-xs">
            Maintenance Contract<br />
            <span className="text-white font-semibold">Supervisory &amp; Control Tools</span>
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-3">
            {features.map((f, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: `${400 + i * 90}ms` }}
              >
                <div className="w-9 h-9 bg-white/10 border border-white/15 rounded-xl flex items-center justify-center text-base flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-blue-100 text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM: tagline & copyright ── */}
        <div className="relative z-10 px-8 lg:px-12 pb-8 lg:pb-10 mt-10 flex items-end justify-between">
          <p className="text-blue-300/60 text-xs italic">Energizing Indonesia</p>
          <p className="text-blue-300/40 text-xs">© 2024 Pertamina Patra Niaga</p>
        </div>

        {/* Decorative bottom wave */}
        <svg
          className="absolute bottom-0 left-0 w-full opacity-[0.07] pointer-events-none"
          viewBox="0 0 600 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0,40 C120,0 240,80 360,40 C480,0 540,60 600,40 L600,80 L0,80 Z" fill="white" />
        </svg>
      </div>

      {/* ── RIGHT FORM PANEL ────────────────────────────────── */}
      <div className="lg:w-[45%] flex items-center justify-center bg-white dark:bg-gray-950 px-6 py-12 lg:px-14">
        <div
          className={`w-full max-w-[400px] transition-all duration-700 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Header on form side */}
          <div className="text-center mb-8">
            {/* Compact logo */}
            <div className="inline-flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3">
              <PertaminaMark size={32} />
              <div className="text-left leading-none">
                <div className="text-gray-800 dark:text-gray-200 font-bold text-sm">PERTAMINA</div>
                <div className="text-red-600 font-semibold text-[11px] tracking-wider mt-0.5">PATRA NIAGA</div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Selamat Datang</h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Masuk ke sistem MAESTRO</p>
          </div>

          {/* ── Form / Success state ── */}
          {registerSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Registrasi Berhasil!</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Akun Anda telah dibuat. Silakan tunggu admin mengaktifkan akun sebelum dapat login.
              </p>
              <button
                onClick={() => setRegisterSuccess(false)}
                className="text-red-600 text-sm underline font-medium hover:text-red-700 transition-colors"
              >
                Kembali ke halaman login
              </button>
            </div>
          ) : (
            <>
              <Tabs defaultValue="signin" className="space-y-5">
                {/* Tab toggle */}
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl h-auto">
                  <TabsTrigger
                    value="signin"
                    className="rounded-lg py-2 text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 transition-all"
                  >
                    Masuk
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-lg py-2 text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 transition-all"
                  >
                    Daftar
                  </TabsTrigger>
                </TabsList>

                {/* Sign In */}
                <TabsContent value="signin" className="mt-0">
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="signin-email"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        Email
                      </Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="nama@pertamina.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="h-11 rounded-xl border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="signin-password"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <Lock className="h-3.5 w-3.5 text-gray-400" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Masukkan password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          className="h-11 rounded-xl border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 pr-11 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                      style={{ background: loading ? '#9ca3af' : '#E31E24' }}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Memproses...
                        </span>
                      ) : (
                        'Masuk'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Sign Up */}
                <TabsContent value="signup" className="mt-0">
                  <SignUpForm
                    email={email}
                    password={password}
                    fullName={fullName}
                    loading={loading}
                    onEmailChange={setEmail}
                    onPasswordChange={setPassword}
                    onFullNameChange={setFullName}
                    onSubmit={handleSignUp}
                  />
                </TabsContent>
              </Tabs>

              {/* Info box */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
                  <div>
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-0.5">Info Sistem</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                      Akun baru memerlukan aktivasi oleh administrator sebelum dapat digunakan.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <p className="text-center text-[11px] text-gray-300 dark:text-gray-600 mt-10">
            © 2024 Pertamina Patra Niaga · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
