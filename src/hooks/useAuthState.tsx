import { useState, useEffect } from 'react';

export const useAuthState = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        // Decode JWT payload untuk ambil data user
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.nameid,
          email: payload.email,
          role: payload.role
        });
      } catch {
        // Kalau decode gagal, hapus token invalid
        localStorage.removeItem("token");
      }
      setSession({ token });
    }

    setLoading(false);
  }, []);

  return { user, session, loading, setUser, setSession };
}; 