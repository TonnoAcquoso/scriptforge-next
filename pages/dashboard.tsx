// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient'; // ✅ Assicurati che il path sia corretto
import Head from 'next/head';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔐 Verifica se l'utente è autenticato
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login'); // 🔄 Reindirizza al login se non autenticato
      } else {
        setUser(data.user);
      }
      setLoading(false);
    };

    getUser();
  }, [router]);

  if (loading) return <p>Caricamento...</p>;

  return (
    <>
      <Head>
        <title>Dashboard Utente</title>
      </Head>
      <main style={{ padding: '2rem' }}>
        <h1>👋 Benvenuto, {user?.email}</h1>

        <section>
          <h2>⚙️ Impostazioni Account</h2>
          <ul>
            <li>📧 Modifica email</li>
            <li>🔒 Modifica password</li>
            <li>🖼️ Carica foto profilo</li>
          </ul>
        </section>

        <section>
          <h2>🧾 Storico Lavori</h2>
          <p>(Qui verranno mostrati gli script generati, salvati ecc.)</p>
        </section>

        <section>
          <h2>🚀 Accesso rapido</h2>
          <ul>
            <li><a href="/generatore">🧠 Genera nuovo script</a></li>
            <li><a href="/analisiscript">📊 Analisi script</a></li>
            <li><a href="/raffina">🛠️ Raffina uno script</a></li>
          </ul>
        </section>
      </main>
    </>
  );
}