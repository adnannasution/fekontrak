import { useState, useEffect } from 'react';

export const useAuthState = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // OPTIONAL: decode JWT atau hit API /me
      console.log("Token ditemukan");

      setSession({ token });

      // sementara dummy dulu (biar gak null)
      setUser({ email: "logged@user.com" });
    }

    setLoading(false);
  }, []);

  return { user, session, loading, setUser, setSession };
};