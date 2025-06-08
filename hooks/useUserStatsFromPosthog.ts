// /hooks/useUserStatsFromPosthog.ts
import { useEffect, useState } from 'react';

interface WeeklyDataPoint {
  date: string;
  count: number;
}

interface UserStats {
  base: number;
  refined: number;
  weeklyData: WeeklyDataPoint[];
}

export const useUserStatsFromPosthog = (email: string) => {
  const [data, setData] = useState<UserStats>({
    base: 0,
    refined: 0,
    weeklyData: [],
  });

  useEffect(() => {
    if (!email) return;

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/posthog-user-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) throw new Error('Errore nel recupero dati');

        const result = await response.json();
        setData({
          base: result.base || 0,
          refined: result.refined || 0,
          weeklyData: result.weeklyData || [],
        });
      } catch (error) {
        console.error('Errore nel recupero delle statistiche utente:', error);
      }
    };

    fetchStats();
  }, [email]);

  return data;
};
