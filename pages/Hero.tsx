// components/Hero.tsx
import styles from '../styles/Hero.module.css';
import { FilePenLine, Wand2, BarChart4 } from 'lucide-react';
import { useRouter } from 'next/router';

export default function Hero() {
  const router = useRouter();

  return (
    <section className={styles.hero}>
      <h1 className={styles.title}>ScriptForge AI</h1>
      <p className={styles.subtitle}>
        La piattaforma ideale per creare, analizzare e raffinare i tuoi script in modo semplice, veloce ed efficace.
      </p>

      <div className={styles.features}>
        <div className={styles.feature}>
          <FilePenLine size={32} />
          <h3>Genera da zero</h3>
          <p>Crea script narrativi emozionanti in pochi secondi, pronti per la registrazione o la pubblicazione.</p>
        </div>
        <div className={styles.feature}>
          <BarChart4 size={32} />
          <h3>Analizza contenuti</h3>
          <p>Scopri punti di forza, tematiche ricorrenti e ottimizza la qualità dei tuoi script con un click.</p>
        </div>
        <div className={styles.feature}>
          <Wand2 size={32} />
          <h3>Raffina testi</h3>
          <p>Migliora grammatica, fluidità e impatto narrativo dei tuoi testi già scritti.</p>
        </div>
      </div>

      {/* 🔗 Pulsante per andare alla pagina "Raffina" */}
      <div style={{ marginTop: '2.5rem' }}>
        <button
          className="glassButton"
          onClick={() => router.push('/raffina')}
        >
          ✨ Prova Ora
        </button>
      </div>
    </section>
  );
}