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
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
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
<<<<<<< HEAD
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
        <section className={styles.sectionBlock}>
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
        <section className={styles.sectionBlock}>
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
        <section className={styles.sectionBlock}>
          <h2 className={styles.sectionTitle}><BarChart3 size={20} /> Statistiche d'Uso</h2>
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
        </section>
      );

    case 'gpt':
      return (
        <section className={styles.sectionBlock}>
          <h2 className={styles.sectionTitle}><Bot size={20} /> GPT Personalizzati</h2>
          <ul className={styles.infoList}>
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
=======
    switch (activeSection) {
      case 'userinfo':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><ShieldCheck size={18} /> Informazioni Utente</h2>
            <div className={styles.cardList}>
              <div><Mail size={16} /> Email: {user?.email}</div>
              <div><ShieldCheck size={16} /> Autenticazione MFA attiva</div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><KeyRound size={18} /> Modifica Profilo</h2>
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
          </div>
        );

      case 'scripts':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><FolderOpenDot size={18} /> Script Salvati</h2>
            <div className={styles.cardList}>
              <div><FileText size={16} /> Script Elaborazione Dati</div>
              <div><FileText size={16} /> SM Data Scraper</div>
              <div><FileText size={16} /> Convertitore Video</div>
            </div>
            <button className={styles.editButton}>Vedi Tutti</button>
          </div>
        );

      case 'analytics':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><BarChart3 size={18} /> Statistiche d'Uso</h2>
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
        );

      case 'gpt':
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><Bot size={18} /> GPT Personalizzati</h2>
            <div className={styles.cardList}>
              <div><Bot size={16} /> AnimeTube</div>
              <div><Bot size={16} /> HookMind</div>
              <div><Bot size={16} /> ScriptForge Core</div>
            </div>
          </div>
        );

      default:
        return <div className={styles.emptyState}>Dashboard</div>;
    }
  };
>>>>>>> 9d022658c1b5f81e434f3dc2f914a5120599e0d7

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
<<<<<<< HEAD
            <Sparkles className={styles.StellaTitolo}/>
            <h1 className={styles.dashboardHeader}>
               Benvenuto, {user?.email?.split('@')[0]}
=======
            <h1 className={styles.dashboardHeader}>
              <Sparkles size={22} /> Benvenuto, {user?.email?.split('@')[0]}
>>>>>>> 9d022658c1b5f81e434f3dc2f914a5120599e0d7
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