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
} from 'lucide-react';

export default function Dashboard() {

const [showEditOptions, setShowEditOptions] = useState(false);
const [pendingEdit, setPendingEdit] = useState<null | 'email' | 'password'>(null);
const [newEmail, setNewEmail] = useState('');
const [newPassword, setNewPassword] = useState('');

const handleEditConfirm = (type: 'email' | 'password') => {
  if (type === 'email') {
    const updated = prompt('Inserisci la nuova email:');
    if (updated) {
      supabase.auth.updateUser({ email: updated }).then(({ error }) => {
        if (error) alert('Errore durante aggiornamento email');
        else alert('Email aggiornata!');
      });
    }
  } else if (type === 'password') {
    const updated = prompt('Inserisci la nuova password:');
    if (updated) {
      supabase.auth.updateUser({ password: updated }).then(({ error }) => {
        if (error) alert('Errore durante cambio password');
        else alert('Password aggiornata!');
      });
    }
  }

  setPendingEdit(null); // Chiudi popup
};

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

  if (loading) return <p>Caricamento in corso...</p>;

  return (
    <>
      <Head>
        <title>Dashboard Utente</title>
      </Head>

      <div className={styles.dashboardContainer}>
        {/* 👋 Benvenuto */}
        <h1 className={styles.dashboardHeader}>
          Benvenuto, {user?.email?.split('@')[0]} 👋
        </h1>

        {/* 📧 Info Utente */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Informazioni Utente</h2>
          <div className={styles.cardList}>
            <div><ShieldCheck size={16} /> Email: {user?.email}</div>
            <div><ShieldCheck size={16} /> Autenticazione MFA attiva</div>
          </div>
        </div>

{/* 🧩 Sezione Modifica Profilo interattiva */}
<div className={styles.card}>
  <h2 className={styles.cardTitle}>Modifica Profilo</h2>
  <p
    className={styles.toggleQuestion}
    onClick={() => setShowEditOptions(!showEditOptions)}
  >
    Vuoi modificare i tuoi dati?
  </p>

  {showEditOptions && (
    <div className={styles.editList}>
      <div className={styles.editItem}>
        <span>Email: {user?.email}</span>
        <button onClick={() => setPendingEdit('email')} className={styles.editButton}>Modifica</button>
      </div>

      <div className={styles.editItem}>
        <span>Password: ********</span>
        <button onClick={() => setPendingEdit('password')} className={styles.editButton}>Modifica</button>
      </div>
    </div>
  )}
</div>

{/* 🔐 Popup di conferma */}
{pendingEdit && (
  <div className={styles.popupOverlay}>
    <div className={styles.popup}>
      <p>Sei sicuro di voler modificare la {pendingEdit === 'email' ? 'email' : 'password'}?</p>
      <div className={styles.popupActions}>
        <button
          onClick={() => handleEditConfirm(pendingEdit)}
          className={styles.confirmButton}
        >
          Sì
        </button>
        <button
          onClick={() => setPendingEdit(null)}
          className={styles.cancelButton}
        >
          No
        </button>
      </div>
    </div>
  </div>
)}

        {/* 🚀 Accesso Rapido */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Accesso Rapido</h2>
          <button className={styles.actionButton} onClick={() => router.push('/generatore')}>
            <Plus size={16} /> Nuovo Script
          </button>
          <button className={styles.actionButton} onClick={() => router.push('/raffina')}>
            <Gavel size={16} /> Raffina
          </button>
          <button className={styles.actionButton} onClick={() => router.push('/analisiscript')}>
            <Search size={16} /> Analizza
          </button>
        </div>

        {/* 🧾 Script salvati */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Script Salvati</h2>
          <div className={styles.cardList}>
            <div><FileText size={16} /> Script Elaborazione Dati</div>
            <div><FileText size={16} /> SM Data Scraper</div>
            <div><FileText size={16} /> Convertitore Video</div>
          </div>
          <button className={styles.actionButton}>Vedi Tutti</button>
        </div>

        {/* 📊 Statistiche */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Statistiche d'Uso</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statBlock}>
              <div className={styles.statNumber}>35</div>
              <span>Script Totali</span>
            </div>
            <div className={styles.statBlock}>
              <div className={styles.statNumber}>15</div>
              <span>Raffinati</span>
            </div>
            <div className={styles.statBlock}>
              <div className={styles.statNumber}>12</div>
              <span>Ultimi 7 giorni</span>
            </div>
          </div>
        </div>

        {/* 🧠 GPT Personalizzati */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>GPT Personalizzati</h2>
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