
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EmailConfirmation from '@/components/EmailConfirmation';
import AuthHeader from '@/components/auth/AuthHeader';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle email confirmation from URL parameters
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const next = searchParams.get('next') ?? '/dashboard';

      if (token_hash && type) {
        console.log('[DEBUG] Processing email confirmation with token_hash:', token_hash);
        
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            console.error('[DEBUG] Email confirmation error:', error);
            toast({
              title: "Error Konfirmasi",
              description: "Link konfirmasi tidak valid atau sudah kedaluwarsa. Silakan coba daftar ulang.",
              variant: "destructive",
            });
            // Clear URL parameters
            navigate('/auth', { replace: true });
            return;
          }

          if (data?.session) {
            console.log('[DEBUG] Email confirmed successfully, user:', data.user?.email);
            toast({
              title: "Email Terkonfirmasi",
              description: "Email Anda berhasil dikonfirmasi. Silakan tunggu admin mengaktifkan akun Anda.",
            });
            
            // Clear URL parameters and redirect
            navigate(next, { replace: true });
          }
        } catch (error) {
          console.error('[DEBUG] Email confirmation exception:', error);
          toast({
            title: "Error",
            description: "Terjadi kesalahan saat konfirmasi email.",
            variant: "destructive",
          });
          navigate('/auth', { replace: true });
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, toast]);

  useEffect(() => {
    if (!authLoading && user) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [authLoading, user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error, needsConfirmation } = await signUp(email, password, fullName);

    if (!error && needsConfirmation) {
      setRegisteredEmail(email);
      setShowConfirmation(true);
    }
    setLoading(false);
  };

  const handleBackToAuth = () => {
    setShowConfirmation(false);
    setRegisteredEmail('');
    setEmail('');
    setPassword('');
    setFullName('');
  };

  if (showConfirmation) {
    return <EmailConfirmation email={registeredEmail} onBack={handleBackToAuth} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'animate-fade-in-scale' : 'opacity-0 translate-y-10'}`}>
        <AuthHeader mounted={mounted} />

        <Card className={`shadow-2xl card-hover transition-all duration-500 ${mounted ? 'animate-slide-in-up' : 'opacity-0 translate-y-10'} bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-white/20`} style={{ animationDelay: '600ms' }}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Autentikasi
            </CardTitle>
            <CardDescription className="animate-fade-in" style={{ animationDelay: '800ms' }}>
              Masuk atau daftar untuk mengakses sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="signin" className="transition-all duration-200 hover:bg-background/80">
                  Masuk
                </TabsTrigger>
                <TabsTrigger value="signup" className="transition-all duration-200 hover:bg-background/80">
                  Daftar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="animate-fade-in">
                <SignInForm 
                  email={email}
                  password={password}
                  loading={loading}
                  onEmailChange={setEmail}
                  onPasswordChange={setPassword}
                  onSubmit={handleSignIn}
                />
              </TabsContent>

              <TabsContent value="signup" className="animate-fade-in">
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

            <div className={`mt-6 p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg transition-all duration-500 ${mounted ? 'animate-slide-in-up' : 'opacity-0 translate-y-5'}`} style={{ animationDelay: '1000ms' }}>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Info Pendaftaran:
              </p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p className="animate-fade-in stagger-1">• Akun baru akan dibuat dengan role 'user'</p>
                <p className="animate-fade-in stagger-2">• Status awal akun adalah 'tidak aktif'</p>
                <p className="animate-fade-in stagger-3">• Admin akan mengaktifkan akun Anda</p>
                <p className="animate-fade-in stagger-4">• Klik link konfirmasi di email untuk memverifikasi akun</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={`text-center mt-8 text-sm text-muted-foreground transition-all duration-500 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '1200ms' }}>
          <p className="animate-slide-in-up stagger-1">© 2024 Pertamina. All rights reserved.</p>
          <p className="animate-slide-in-up stagger-2">Sistem Monitoring Kontrak ME 2</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
