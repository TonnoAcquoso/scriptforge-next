import Head from 'next/head';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Informativa sulla Privacy – ScriptForge AI</title>
      </Head>
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Informativa sulla Privacy</h1>
        <p>Ultimo aggiornamento: 30 maggio 2025</p>

        <p>
          La presente informativa descrive le modalità di trattamento dei dati personali degli utenti che accedono e utilizzano il sito web ScriptForge AI, in conformità al Regolamento UE 2016/679 (GDPR) e alla Costituzione Italiana, art. 13 e 14.
        </p>

        <h2>1. Titolare del trattamento</h2>
        <p>Il titolare del trattamento è William Casotto, contattabile tramite email ufficiale associata all’applicazione ScriptForge AI.</p>

        <h2>2. Tipi di dati raccolti</h2>
        <ul>
          <li>Informazioni di registrazione (es. email, password)</li>
          <li>Dati di utilizzo dell’app</li>
          <li>Eventuali preferenze salvate</li>
        </ul>

        <h2>3. Finalità del trattamento</h2>
        <p>
          I dati sono raccolti per: autenticazione, personalizzazione dell’esperienza, sicurezza dell’accesso, miglioramento del servizio.
        </p>

        <h2>4. Conservazione e sicurezza</h2>
        <p>
          I dati sono conservati su infrastrutture sicure gestite da Supabase e non vengono mai venduti o ceduti a terze parti.
        </p>

        <h2>5. Diritti dell’utente</h2>
        <p>
          Ai sensi dell'art. 7 della Costituzione Italiana e degli articoli 15–22 del GDPR, hai diritto di accedere, rettificare, cancellare o limitare i tuoi dati in qualsiasi momento.
        </p>
      </main>
    </>
  );
}