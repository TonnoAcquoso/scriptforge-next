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
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showEditOptions, setShowEditOptions] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<null | 'email' | 'password'>(null);
  const [inputValue, setInputValue] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStep, setPasswordStep] = useState<'verify' | 'change'>('verify');
  const [isLoading, setIsLoading] = useState(false);

  const [showQuickActions, setShowQuickActions] = useState(false);

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

  const resetPasswordFlow = () => {
    setPendingEdit(null);
    setCurrentPassword('');
    setNewPassword('');
    setPasswordStep('verify');
    setIsLoading(false);
  };

  const handleEmailUpdate = async () => {
    if (!inputValue) return alert('Inserisci una nuova email valida.');
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ email: inputValue });
    setIsLoading(false);
    setPendingEdit(null);
    setInputValue('');
    alert(error ? 'Errore durante aggiornamento email.' : 'Email aggiornata!');
  };

  const handlePasswordVerify = async () => {
    if (!currentPassword) return alert('Inserisci la password attuale.');
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: user?.email,
      password: currentPassword,
    });
    setIsLoading(false);
    if (error) {
      alert('Password errata.');
    } else {
      setPasswordStep('change');
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) return alert('Inserisci una nuova password valida.');
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsLoading(false);
    resetPasswordFlow();
    alert(error ? 'Errore durante aggiornamento password.' : 'Password aggiornata con successo!');
  };

  if (loading) return <p>Caricamento in corso...</p>;

  return (
    <>
      <Head>
        <title>Dashboard Utente</title>
      </Head>

      <div className={styles.dashboardContainer}>
        <h1 className={styles.dashboardHeader}>
          Benvenuto, {user?.email?.split('@')[0]} 👋
        </h1>

        {/* 🧠 Informazioni utente */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Informazioni Utente</h2>
          <div className={styles.cardList}>
            <div><ShieldCheck size={16} /> Email: {user?.email}</div>
            <div><ShieldCheck size={16} /> Autenticazione MFA attiva</div>
          </div>
        </div>

        {/* 🧩 Modifica Profilo */}
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

        {/* 🔐 Popup Email/Password */}
        {pendingEdit && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              {pendingEdit === 'email' ? (
                <>
                  <h3 className={styles.popupTitle}>Modifica Email</h3>
                  <input
                    type="email"
                    placeholder="Inserisci nuova email"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={styles.inputField}
                  />
                  <div className={styles.popupActions}>
                    <button onClick={handleEmailUpdate} className={styles.confirmButton} disabled={isLoading}>
                      {isLoading ? 'Aggiornamento...' : 'Conferma'}
                    </button>
                    <button onClick={() => { setPendingEdit(null); setInputValue(''); }} className={styles.cancelButton}>
                      Annulla
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className={styles.popupTitle}>
                    {passwordStep === 'verify' ? 'Verifica Password Attuale' : 'Nuova Password'}
                  </h3>

                  {passwordStep === 'verify' ? (
                    <>
                      <input
                        type="password"
                        placeholder="Password attuale"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={styles.inputField}
                      />
                      <div className={styles.popupActions}>
                        <button onClick={handlePasswordVerify} className={styles.confirmButton} disabled={isLoading}>
                          Verifica
                        </button>
                        <button onClick={resetPasswordFlow} className={styles.cancelButton}>
                          Annulla
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        type="password"
                        placeholder="Nuova password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={styles.inputField}
                      />
                      <div className={styles.popupActions}>
                        <button onClick={handlePasswordChange} className={styles.confirmButton} disabled={isLoading}>
                          Conferma
                        </button>
                        <button onClick={resetPasswordFlow} className={styles.cancelButton}>
                          Annulla
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
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

        {/* ⚡ Quick Actions Panel */}
        <div className={styles.quickActionsWrapper}>
          <button
            className={styles.floatingButton}
            onClick={() => setShowQuickActions(prev => !prev)}
          >
            ⚡
          </button>

          {showQuickActions && (
            <div className={styles.quickActionsPanel}>
              <button onClick={() => router.push('/generatore')}>✨ Nuovo Script</button>
              <button onClick={() => router.push('/analisiscript')}>📊 Analizza Script</button>
              <button onClick={() => router.push('/raffina')}>🛠 Raffina</button>
              <button onClick={() => router.push('/script-salvati')}>📁 Script Salvati</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}