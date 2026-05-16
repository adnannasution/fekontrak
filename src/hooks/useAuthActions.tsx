import { useToast } from '@/hooks/use-toast';

const API_URL = "http://localhost:5152/api"; // sesuaikan

export const useAuthActions = (setUser: any, setSession: any, setUserProfile: any) => {
  const { toast } = useToast();

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[DEBUG] Login ke API:', email);
      setUserProfile(null);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      console.log('[DEBUG] API RESPONSE:', result);

      if (!res.ok) {
        toast({
          title: "Error",
          description: result.message || "Login gagal",
          variant: "destructive",
        });
        return { error: result.message };
      }

      // ✅ simpan JWT
      localStorage.setItem("token", result.token);

      // ✅ set state biar UI tetap jalan
      setUser(result.user);
      setSession({ token: result.token });

      toast({
        title: "Berhasil",
        description: "Login berhasil!",
      });

      return { data: { user: result.user }, error: null };

    } catch (error: any) {
      console.error('[DEBUG] Login error:', error);
      return { error: error.message };
    }
  };

  // ❗ sementara bisa disable dulu signup (kalau belum ada API)
  const signUp = async (email: string, password: string, fullName?: string) => {
    toast({
      title: "Info",
      description: "Register belum tersedia",
    });
    return {};
  };

  const signOut = async () => {
    try {
      console.log('[DEBUG] Logout');

      localStorage.removeItem("token");

      setUser(null);
      setSession(null);
      setUserProfile(null);

      toast({
        title: "Berhasil",
        description: "Logout berhasil!",
      });

    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return { signIn, signUp, signOut };
};