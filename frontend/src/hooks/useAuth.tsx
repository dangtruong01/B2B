import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constants';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      router.push("/auth/login");
      setLoading(false);
      return;
    }

    const getUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        localStorage.removeItem("access_token");
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  return { user, loading };
};