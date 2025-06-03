// pages/dashboard.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import Head from 'next/head';
import styles from '../styles/Dashboard.module.css';
import {
  ShieldCheck,
  FileText,
  Plus,
  Gavel,
  Search,
  Settings,
  LogOut,
  User,
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login');
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

      <div className={styles.dashboardContainer}>
        {/* 👋 Header */}
        <h1 className={styles.dashboardHeader}>Welcome, {user?.email?.split('@')[0]} 👋</h1>

        {/* 📧 Info Utente */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>User Info</h2>
          <div className={styles.cardList}>
            <div><ShieldCheck size={16} /> Email: {user?.email}</div>
            <div><ShieldCheck size={16} /> MFA Enabled</div>
          </div>
        </div>

        {/* 🚀 Accesso rapido */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Quick Access</h2>
          <button className={styles.actionButton} onClick={() => router.push('/generatore')}>
            <Plus size={16} /> New Script
          </button>
          <button className={styles.actionButton} onClick={() => router.push('/raffina')}>
            <Gavel size={16} /> Enhance
          </button>
          <button className={styles.actionButton} onClick={() => router.push('/analisiscript')}>
            <Search size={16} /> Analyze
          </button>
        </div>

        {/* 🧾 Script salvati */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Saved Scripts</h2>
          <div className={styles.cardList}>
            <div><FileText size={16} /> Esempio 1</div>
            <div><FileText size={16} /> Esempio 2</div>
            <div><FileText size={16} /> Esempio 3</div>
          </div>
          <button className={styles.actionButton}>View All</button>
        </div>

        {/* 📊 Statistiche */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Usage Analytics</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statBlock}>
              <div className={styles.statNumber}>35</div>
              <span>Total Scripts</span>
            </div>
            <div className={styles.statBlock}>
              <div className={styles.statNumber}>15</div>
              <span>Enhanced</span>
            </div>
            <div className={styles.statBlock}>
              <div className={styles.statNumber}>12</div>
              <span>Last 7 Days</span>
            </div>
          </div>
        </div>

        {/* 🧠 GPT personalizzati */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Custom GPTs</h2>
          <div className={styles.cardList}>
            <div>💬 AnimeTube</div>
            <div>💬 HookMind</div>
            <div>💬 ScriptForge Core</div>
          </div>
        </div>
      </div>
    </>
  );
}