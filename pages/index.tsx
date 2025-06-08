import * as React from 'react';
import styles from '../styles/Home.module.css';
import {
  FilePenLine,
  Wand2,
  BarChart4,
  Rocket,
  BrainCircuit,
  Settings,
  Lightbulb,
  Code2,
  Users,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroGlow} />

      <h1 className={styles.title}>
        <span className={styles.gradient}>ScriptForge AI</span>
      </h1>
      <p className={styles.subtitle}>
        Un alleato intelligente per <strong>creare</strong>, <strong>analizzare</strong> e <strong>perfezionare</strong> i tuoi script narrativi. Sfrutta il potere dell'IA per rivoluzionare il tuo processo creativo.
      </p>

      {/* 🔹 Sezione Feature principali */}
      <div className={styles.features}>
        <div className={styles.feature}>
          <FilePenLine size={32} className={styles.featureIcon} />
          <h3>Genera da Zero</h3>
          <p>Trasforma idee in script completi pronti per video, podcast o articoli.</p>
        </div>
        <div className={styles.feature}>
          <BarChart4 size={32} className={styles.featureIcon} />
          <h3>Analisi Avanzata</h3>
          <p>Comprendi emozioni, struttura e punti chiave con una precisione da IA narrativa.</p>
        </div>
        <div className={styles.feature}>
          <Wand2 size={32} className={styles.featureIcon} />
          <h3>Raffinazione Testuale</h3>
          <p>Rendi i tuoi testi più incisivi, fluidi e professionali senza sforzi.</p>
        </div>
        <div className={styles.feature}>
          <Rocket size={32} className={styles.featureIcon} />
          <h3>Efficienza Creativa</h3>
          <p>Risparmia ore di scrittura. Ottieni risultati premium in pochi secondi.</p>
        </div>
        <div className={styles.feature}>
          <BrainCircuit size={32} className={styles.featureIcon} />
          <h3>Motore Cognitivo</h3>
          <p>L'IA si adatta al tuo stile e ai tuoi obiettivi: ogni script è unico, come te.</p>
        </div>
      </div>

      {/* 🧩 Sezione strumenti */}
      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>Cosa puoi fare con ScriptForge</h2>
        <div className={styles.toolsGrid}>
          <div className={styles.toolCard}>
            <Settings size={26} />
            <h4>Controllo Totale</h4>
            <p>Adatta ogni script al tuo tono, obiettivo e piattaforma.</p>
          </div>
          <div className={styles.toolCard}>
            <Lightbulb size={26} />
            <h4>Brainstorm Assistito</h4>
            <p>Genera idee, incipit e strutture su misura per ogni progetto.</p>
          </div>
          <div className={styles.toolCard}>
            <Code2 size={26} />
            <h4>Struttura Logica</h4>
            <p>Script ordinati, coerenti, ottimizzati per la fruizione e il montaggio.</p>
          </div>
          <div className={styles.toolCard}>
            <Sparkles size={26} />
            <h4>Stili Narrativi Unici</h4>
            <p>Epico, lirico, provocatorio: scegli il mood perfetto.</p>
          </div>
        </div>
      </section>

      {/* 🧠 Come funziona */}
      <section className={styles.stepsSection}>
        <h2 className={styles.sectionTitle}>Come funziona?</h2>
        <div className={styles.stepsGrid}>
          <div className={styles.stepBox}>
            <span className={styles.stepNumber}>1</span>
            <h4>Scrivi o Incolla un Testo</h4>
            <p>Oppure parti da zero usando l’editor assistito.</p>
          </div>
          <div className={styles.stepBox}>
            <span className={styles.stepNumber}>2</span>
            <h4>Scegli cosa vuoi ottenere</h4>
            <p>Analisi, miglioramento, sintesi o nuova versione.</p>
          </div>
          <div className={styles.stepBox}>
            <span className={styles.stepNumber}>3</span>
            <h4>Lascia fare all’IA</h4>
            <p>In pochi secondi il tuo script sarà pronto.</p>
          </div>
        </div>
      </section>

      {/* 👥 Per chi è pensato */}
      <section className={styles.usersSection}>
        <h2 className={styles.sectionTitle}>Chi può usarlo?</h2>
        <ul className={styles.userList}>
          <li><Users size={20} /> Creatori di contenuti</li>
          <li><Users size={20} /> Podcaster e narratori</li>
          <li><Users size={20} /> Scrittori e sceneggiatori</li>
          <li><Users size={20} /> Marketer e copywriter</li>
          <li><Users size={20} /> Appassionati di storytelling</li>
        </ul>
        <p className={styles.userNote}>ScriptForge è per chiunque voglia trasformare le proprie idee in narrazioni potenti.</p>
      </section>

      {/* 🔸 Sezione CTA */}
      <div className={styles.ctaContainer}>
        <button
          className="glassButton"
          onClick={() => {
            if (user) {
              router.push('/Hero'); // ✅ Utente autenticato → vai alla Hero
            } else {
              router.push('/signup'); // ✅ Utente non loggato → vai a registrazione
            }
          }}
        >
          ✨ Inizia a Creare
        </button>
        <p className={styles.ctaNote}>Nessun limite. Solo creatività pura.</p>
      </div>
    </section>
  );
}