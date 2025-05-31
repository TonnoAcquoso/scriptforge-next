// utils/withAuth.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from './supabaseClient';

export default function withAuth(Component: React.ComponentType) {
  return function ProtectedPage(props: any) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.replace('/signup');
        } else {
          setAuthenticated(true);
        }

        setLoading(false);
      };

      checkSession();
    }, []);

    if (loading) return <div className="loading">Caricamento...</div>;
    if (!authenticated) return null;

    return <Component {...props} />;
  };
}