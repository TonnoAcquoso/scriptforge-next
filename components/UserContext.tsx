// components/UserContext.tsx
import {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { supabase } from '../utils/supabaseClient';
import posthog from 'posthog-js';

type User = any; // 🔧 Puoi sostituirlo con il tipo corretto di Supabase user se desideri

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
      if (data?.user?.email) {
  posthog.identify(data.user.email, {
    email: data.user.email,
    name: data.user.user_metadata?.full_name || '',
    created_at: data.user.created_at || '',
  });
}
      setLoading(false);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user?.email) {
  posthog.identify(session.user.email, {
    email: session.user.email,
    name: session.user.user_metadata?.full_name || '',
    created_at: session.user.created_at || '',
  });
}
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);