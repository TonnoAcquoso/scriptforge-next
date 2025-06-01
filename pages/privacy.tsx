import Head from 'next/head';
import styles from '../styles/Disclaimer.module.css';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Informativa sulla Privacy – ScriptForge AI</title>
      </Head>
      <main className={styles.disclaimerPage}>
        <h1 className={styles.title}>Informativa sulla Privacy</h1>
        <p className={styles.paragraph}>Ultimo aggiornamento: 30 maggio 2025</p>

        <p className={styles.paragraph}>
          La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che accedono e utilizzano il sito web ScriptForge AI, in conformità al Regolamento UE 2016/679 (GDPR) e alla Costituzione Italiana, art. 13 e 14.
        </p>

        <h2 className={styles.subtitle}>1. Titolare del trattamento</h2>
        <p className={styles.paragraph}>
          Il titolare del trattamento è William Casotto, contattabile tramite email ufficiale associata all’applicazione ScriptForge AI.
        </p>

        <h2 className={styles.subtitle}>2. Tipi di dati raccolti</h2>
        <ul className={styles.list}>
          <li>Informazioni di registrazione (es. email, password)</li>
          <li>Dati di utilizzo dell’app</li>
          <li>Eventuali preferenze salvate</li>
        </ul>

        <h2 className={styles.subtitle}>3. Finalità del trattamento</h2>
        <p className={styles.paragraph}>
          I dati sono raccolti per: autenticazione, personalizzazione dell’esperienza, sicurezza dell’accesso, miglioramento del servizio.
        </p>

        <h2 className={styles.subtitle}>4. Conservazione e sicurezza</h2>
        <p className={styles.paragraph}>
          I dati sono conservati su infrastrutture sicure gestite da Supabase e non vengono mai venduti o ceduti a terze parti.
        </p>

        <h2 className={styles.subtitle}>5. Diritti dell’utente</h2>
        <p className={styles.paragraph}>
          Ai sensi dell'art. 7 della Costituzione Italiana e degli articoli 15–22 del GDPR, hai diritto di accedere, rettificare, cancellare o limitare i tuoi dati in qualsiasi momento.
        </p>

        <p className={styles.footerNote}>ScriptForge AI – Tutti i diritti riservati</p>
      </main>
    </>
  );
}