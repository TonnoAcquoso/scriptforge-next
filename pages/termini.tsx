import Head from 'next/head';
import styles from '../styles/Disclaimer.module.css';

export default function Termini() {
  return (
    <>
      <Head>
        <title>Termini di Servizio – ScriptForge AI</title>
      </Head>
      <main className={styles.disclaimerPage}>
        <h1 className={styles.title}>Termini di Servizio</h1>
        <p className={styles.paragraph}>Ultimo aggiornamento: 30 maggio 2025</p>

        <h2 className={styles.subtitle}>1. Accettazione dei Termini</h2>
        <p className={styles.paragraph}>
          Accedendo o utilizzando ScriptForge AI, l'utente accetta i presenti Termini di Servizio. Se non accetti, non puoi utilizzare l'applicazione.
        </p>

        <h2 className={styles.subtitle}>2. Accesso all'applicazione</h2>
        <p className={styles.paragraph}>
          L'accesso è riservato agli utenti registrati. L'utente è responsabile della riservatezza delle proprie credenziali.
        </p>

        <h2 className={styles.subtitle}>3. Uso corretto</h2>
        <p className={styles.paragraph}>
          L’utente si impegna a non utilizzare ScriptForge AI per fini illeciti, dannosi, o contrari alla buona fede, come previsto anche dall’art. 2 della Costituzione Italiana.
        </p>

        <h2 className={styles.subtitle}>4. Limitazioni di responsabilità</h2>
        <p className={styles.paragraph}>
          Il servizio viene fornito “così com'è”, senza garanzia implicita o esplicita. ScriptForge AI non è responsabile per perdite, interruzioni o danni indiretti.
        </p>

        <h2 className={styles.subtitle}>5. Modifiche</h2>
        <p className={styles.paragraph}>
          I presenti termini possono essere modificati in qualsiasi momento. Le modifiche saranno comunicate con sufficiente preavviso.
        </p>

        <p className={styles.footerNote}>ScriptForge AI – Tutti i diritti riservati</p>
      </main>
    </>
  );
}