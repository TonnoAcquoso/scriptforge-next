import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

export function useIdleLogout(timeoutMinutes = 10) {
  const router = useRouter();

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/signup?reason=timeout');
      }, timeoutMinutes * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timeout);
    };
  }, [router, timeoutMinutes]);
}