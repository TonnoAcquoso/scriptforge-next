import { useUser } from '@supabase/auth-helpers-react'

import { WeeklySparkline } from '../components/WeeklySparkline'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../utils/supabaseClient';
import styles from '../styles/Dashboard.module.css';
import {
  LayoutDashboard,
  UserCog,
  Files,
  BarChart3,
  Bot,
  Settings,
  ShieldCheck,
  Mail,
  KeyRound,
  FileText,
  FolderOpenDot,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useUserStatsFromPosthog } from '../hooks/useUserStatsFromPosthog';


export default function Dashboard() {
  const router = useRouter();
  const supaUser = useUser();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showEditOptions, setShowEditOptions] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<null | 'email' | 'password'>(null);
  const [inputValue, setInputValue] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStep, setPasswordStep] = useState<'verify' | 'change'>('verify');
  const [isLoading, setIsLoading] = useState(false);
  const { base, refined, weeklyData } = useUserStatsFromPosthog(user?.email);

const userStats = {
  base,
  refined,
  total: base + refined,
  last7Days: weeklyData.reduce((acc, cur) => acc + cur.count, 0),
};
  


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

  const navItems = [
    { id: 'overview', label: 'Panoramica', icon: <LayoutDashboard size={20} /> },
    { id: 'userinfo', label: 'Profilo', icon: <UserCog size={20} /> },
    { id: 'scripts', label: 'Script', icon: <Files size={20} /> },
    { id: 'analytics', label: 'Statistiche', icon: <BarChart3 size={20} /> },
    { id: 'gpt', label: 'GPT', icon: <Bot size={20} /> },
    { id: 'settings', label: 'Modifica', icon: <Settings size={20} /> },
  ];

  const renderContent = () => {
  switch (activeSection) {
    case 'userinfo':
      return (
        <section className={styles.sectionBlock}>
          <h2 className={styles.sectionTitle}><ShieldCheck size={20} /> Informazioni Utente</h2>
          <ul className={styles.infoList}>
            <li><Mail size={18} /> <span>Email: {user?.email}</span></li>
            <li><ShieldCheck size={18} /> <span>Autenticazione MFA attiva</span></li>
          </ul>
        </section>
      );

    case 'settings':
      return (
        <section className={styles.sectionSettings}>
          <h2 className={styles.sectionTitle}><KeyRound size={20} /> Modifica Profilo</h2>
          <p className={styles.toggleQuestion} onClick={() => setShowEditOptions(!showEditOptions)}>
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
        </section>
      );

    case 'scripts':
      return (
        <section className={styles.sectionScripts}>
          <h2 className={styles.sectionTitle}><FolderOpenDot className={styles.FolderOpenDot} size={20} /> Script Salvati</h2>
          <ul className={styles.infoList}>
           <FileText className={styles.FileText} size={18} /> <li> <span>Script Elaborazione Dati</span></li>
           <FileText className={styles.FileText} size={18} /> <li> <span>SM Data Scraper</span></li>
           <FileText className={styles.FileText} size={18} /> <li> <span>Convertitore Video</span></li>
          </ul>
          <button className={styles.editButton}>Vedi Tutti</button>
        </section>
      );

   case 'analytics':
  return (
    <section className={styles.sectionAnalytics}>
      <h2 className={styles.sectionTitleAnalytics}>
        <BarChart3 className={styles.iconaGrafico} /> Statistiche d'Uso
      </h2>
      <p className={styles.subtitleAnalytics}>
        Monitoraggio delle performance settimanali dei tuoi script GPT
      </p>

      <div className={styles.statsGridAnalytics}>
        <div className={styles.statBlockAnalytics}>
          <div className={styles.statNumberAnalytics}>{userStats.base}</div>
          <span>Script Base</span>
        </div>

        <div className={styles.statBlockAnalytics}>
          <div className={styles.statNumberAnalytics}>{userStats.refined}</div>
          <span>Script Raffinati</span>
        </div>

        <div className={styles.statBlockAnalytics}>
          <div className={styles.statNumberAnalytics}>{userStats.total}</div>
          <span>Script Totali</span>
        </div>

        <div className={styles.statBlockAnalytics}>
          <div className={styles.statNumberAnalytics}>{userStats.last7Days}</div>
          <span>Ultimi 7 Giorni</span>
        </div>
      </div>

      <div className={styles.statBlockAnalytics}>
        <div className={styles.statNumberAnalytics}>📈</div>
        <span>Andamento settimanale</span>
        <div style={{ width: '100%', height: 100, marginTop: '1rem' }}>
          {weeklyData?.length > 0 ? (
            <WeeklySparkline data={weeklyData} />
          ) : (
            <p
              style={{
                fontSize: '0.85rem',
                color: '#94a3b8',
                textAlign: 'center',
              }}
            >
              Nessun dato negli ultimi 7 giorni
            </p>
          )}
        </div>
        <pre style={{ fontSize: '0.7rem', color: '#64748b' }}>
          {JSON.stringify(weeklyData, null, 2)}
        </pre>
      </div>
    </section>
  );


    case 'gpt':
      return (
        <section className={styles.sectionGpt}>
          <h2 className={styles.sectionTitleGpt}><Bot className={styles.iconaBotGpt}/> GPT Personalizzati</h2>
          <ul className={styles.infoListGpt}>
            <li><Bot size={18} /> <span>AnimeTube</span></li>
            <li><Bot size={18} /> <span>HookMind</span></li>
            <li><Bot size={18} /> <span>ScriptForge Core</span></li>
          </ul>
        </section>
      );

    default:
      return <div className={styles.emptyState}>Dashboard</div>;
  }
};

  return (
    <>
      <Head>
        <title>Dashboard Utente</title>
      </Head>

      <div className={styles.fullDashboard}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {navItems.map((item) => (
            <div key={item.id} className={styles.sidebarItem}>
              <button
                onClick={() => setActiveSection(item.id)}
                className={`${styles.sidebarIcon} ${activeSection === item.id ? styles.active : ''}`}
              >
                {item.icon}
              </button>
              <span className={styles.sidebarLabel}>{item.label}</span>
            </div>
          ))}
        </aside>

        {/* Contenuto */}
        <main className={styles.mainContent}>
          <div className={styles.sectionContent}>
            <Sparkles className={styles.StellaTitolo}/>
            <h1 className={styles.dashboardHeader}>
               Benvenuto, {user?.email?.split('@')[0]}
            </h1>
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Popup */}
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
                  <button onClick={resetPasswordFlow} className={styles.cancelButton}>Annulla</button>
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
                      <button onClick={resetPasswordFlow} className={styles.cancelButton}>Annulla</button>
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
                      <button onClick={resetPasswordFlow} className={styles.cancelButton}>Annulla</button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}