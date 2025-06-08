import { useEffect, useState } from 'react';

interface DataPoint {
  date: string;
  count: number;
}

export const useWeeklyScriptStats = (userEmail: string | undefined) => {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    if (!userEmail) return;

    const fetchData = async () => {
      try {
        const response = await fetch('/api/posthog-user-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
        });

        const json = await response.json();
        setData(json.data || []);
      } catch (error) {
        console.error('Errore nel recupero dati PostHog:', error);
        setData([]);
      }
    };

    fetchData();
  }, [userEmail]);

  return data;
};
