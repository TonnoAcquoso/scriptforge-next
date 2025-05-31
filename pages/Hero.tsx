import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Hero.module.css';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { ClipboardCopy, BarChart4, Search, BookOpenCheck, HeartPulse, PenLine, Compass,
         Sun, Moon, Info, X, Wand2, ChevronUp, ChevronDown} from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { supabase } from '../utils/supabaseClient';
import withAuth from '../utils/withAuth';


export function Hero() {
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('Anime');
  const [style, setStyle] = useState('Epico');
  const [intensity, setIntensity] = useState('Media');
  const [loading, setLoading] = useState(false);
  const [scriptResult, setScriptResult] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilename, setExportFilename] = useState('script');
  const [history, setHistory] = useState<{ timestamp: string; topic: string; content: string; note?: string }[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [noteFilter, setNoteFilter] = useState('');
  const [copied, setCopied] = useState(false);
  const [isOutputVisible, setIsOutputVisible] = useState(true);
  const MotionDiv = motion.div as React.FC<React.HTMLAttributes<HTMLDivElement> & any>;



  
// AGGIUNTA LINK
const router = useRouter();
const goToAnalysis = () => {
  router.push(`/analisiscript?script=${encodeURIComponent(scriptResult)}`);
};


// 1. Dichiarazioni degli stati per wordCount e readingTime:
const wordCount = scriptResult.trim().split(/\s+/).length;
const readingTime = Math.ceil(wordCount / 200);

const calculateReadingTime = (text: string) => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

  
// Visualizza il contenuto generato
<pre className={`outputText`}>{scriptResult}</pre>

/* 
|=====================================|
|         EFFETTI useEffect()         |
|=====================================|
*/

// Salva lo script nel localStorage appena viene generato
useEffect(() => {
  if (scriptResult) {
    const history = JSON.parse(localStorage.getItem('scriptHistory') || '[]');
    const newEntry = {
      timestamp: new Date().toISOString(),
      topic,
      content: scriptResult,
    };
    localStorage.setItem('scriptHistory', JSON.stringify([newEntry, ...history].slice(0, 5)));
  }
}, [scriptResult]);

// Carica lo storico degli script salvati
useEffect(() => {
  const stored = localStorage.getItem('scriptHistory');
  if (stored) {
    setHistory(JSON.parse(stored));
  }
}, []);

// Carica l’ultima bozza salvata all’avvio
useEffect(() => {
  const savedScript = localStorage.getItem('lastScript');
  if (savedScript) {
    setScriptResult(savedScript);
  }
}, []);

// Salva l’ultima bozza nel localStorage
useEffect(() => {
  if (scriptResult) {
    localStorage.setItem('lastScript', scriptResult);
  }
}, [scriptResult]);

const handleToggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  localStorage.setItem('theme', newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
};

/* 
|=====================================|
|          FUNZIONI UTILI             |
|=====================================|
*/

// Esporta in .txt (utilizza file-saver)
const downloadFile = (text: string, filename: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
};

// Esporta in .docx (utilizza docx)
const downloadDocx = async (text: string, filename: string) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: text.split('\n').map(line =>
          new Paragraph({ children: [new TextRun(line)] })
        ),
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};

// Prompt per nome file .txt da esportare
const handleTxtDownload = () => {
  const filename = prompt('Nome del file?', 'script');
  if (filename) {
    downloadFile(scriptResult, `${filename}.txt`);
  }
};

// Genera lo script chiamando l’API personalizzata
const handleGenerate = async () => {
  setLoading(true);
  setScriptResult('');
  try {
    const response = await fetch('/api/genera', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, niche, style, intensity }),
    });
    const data = await response.json();
    setScriptResult(data.script || 'Nessuna risposta generata');
  } catch (err) {
    alert('Errore durante la generazione dello script');
  } finally {
    setLoading(false);
  }
};

// Esporta il file in base al formato scelto
const handleExport = async (type: 'txt' | 'docx') => {
  if (!scriptResult) return;
  const name = exportFilename.trim() || 'script';

  if (type === 'txt') {
    downloadFile(scriptResult, `${name}.txt`);
  } else {
    await downloadDocx(scriptResult, name);
  }

  setShowExportModal(false);
};


// Aggiorna una nota nello storico
const updateNote = (index: number) => {
  const newNote = prompt('Modifica la nota:', history[index].note || history[index].topic);
  if (newNote === null) return;
  
  const updated = [...history];
  updated[index].note = newNote;
  setHistory(updated);
  localStorage.setItem('scriptHistory', JSON.stringify(updated));
};

// ✅ Copia moderna negli appunti con feedback
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(scriptResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    alert('Errore durante la copia negli appunti.');
  }
};

  // Imposta il tema iniziale in base a localStorage (o default = dark)
useEffect(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  setTheme(savedTheme as 'light' | 'dark');
}, []);

  return (
    
    <div className={styles.container}>
    <img src="/banner_martello.png" alt="Logo" className={styles.logo} />
      <Navbar onToggleGuide={() => {}} onToggleTheme={handleToggleTheme} />
      
      <h1 className={styles.title}>ScriptForge AI</h1>
      <p className={styles.subtitle}>Il tuo compagno di script</p>
      <div className={styles.ctaContainer}>
  <Link href="/searchweb">
    <button className={styles.button3D}>
      <span className={styles.buttonText}>🔍 Vai alla Ricerca Web</span>
      <span className={styles.buttonShadow}></span>
    </button>
  </Link>
</div>
      

        {/* 📝 Campo Argomento con stile moderno */}
          <div className={styles.formGroup}>
            <div className={styles.labelWithIcon}>
              <PenLine size={20} className={styles.icon} />
              <label className={styles.label}>Inserisci Argomento</label>
            </div>
            <textarea
              className={styles.input}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Scrivi l'argomento qui..."
            />
          </div>

{/* 🎯 Seleziona la nicchia */}
      <div className={styles.formGroup}>
  <div className={styles.labelWithIcon}>
    <Compass size={20} className={styles.icon} />
    <label className={styles.label}>Seleziona la nicchia</label>
  </div>
  <select
    className={styles.select}
    value={niche}
    onChange={(e) => setNiche(e.target.value)}
  >
    <option>Anime</option>
    <option>Gaming</option>
    <option>Educazione</option>
    <option>Educazione Finanziaria</option>
    <option>Podcast</option>
    <option>Motivazionale</option>
    <option>Cinema</option>
    <option>Salute e Benessere</option>
    <option>Fantasy</option>
    <option>Sport</option>
    <option>Tecnologia</option>
    <option>Trading</option>
  </select>
</div>

      {/* 🎭 Select: Stile Narrativo */}
          <div className={styles.formGroup}>
      <div className={styles.labelWithIcon}>
        <BookOpenCheck size={20} className={styles.icon} />
        <label className={styles.label}>Seleziona lo stile narrativo</label>
      </div>
      <select
        className={styles.select}
        value={style}
        onChange={(e) => setStyle(e.target.value)}
      >
        <option>Epico</option>
        <option>Riflessivo</option>
        <option>Psicologico</option>
        <option>Ironico</option>
      </select>
    </div>

      {/* ❤️ Select: Intensità Emotiva */}
              <div className={styles.formGroup}>
          <div className={styles.labelWithIcon}>
            <HeartPulse size={20} className={styles.icon} />
            <label className={styles.label}>Seleziona l'intensità emotiva</label>
          </div>
          <select
            className={styles.select}
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
          >
            <option>Alta</option>
            <option>Media</option>
            <option>Bassa</option>
          </select>
        </div>

        {/* PULSANTE "GENERA SCRIPT" */}
      <button className="glassButton" onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generazione in corso...' : 'Genera Script'}
      </button>

      {history.length > 0 && (
  <div className="historyBox">
    <button
      className="accordionToggle"
      onClick={() => setHistoryOpen(!historyOpen)}
    >
      <span>{historyOpen ? '▼' : '▶'} Script Recenti</span>
    </button>

    <AnimatePresence>
      {historyOpen && (
        <motion.ul
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {history
  
  .map((item, index) => (
    <li key={index} className="historyItem">
      <div className="historyEntry">
        <button
          className="glassButton"
          onClick={() => setScriptResult(item.content)}
        >
          {item.topic || 'Script ' + (index + 1)}  
          ({new Date(item.timestamp).toLocaleDateString()})
        </button>
      </div>
    </li>
))}
        </motion.ul>
      )}
    </AnimatePresence>
  </div>
)}
      {/* SCHERMATA CARICAMENTO */}
      {loading && (
      <div className="skeletonLoader">
        <div className="skeleton-line short" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
      )}

      

      <AnimatePresence>
  {scriptResult && (
    <MotionDiv
      className={styles.outputContainer} // ✅ Contenitore principale
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* 🔽 Toggle per mostrare/nascondere l'output */}
      <button
  onClick={() => setIsOutputVisible(!isOutputVisible)}
  className={styles.toggleButton}
>
  {isOutputVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
  {isOutputVisible ? 'Nascondi Output' : 'Mostra Output'}
</button>

      {/* 🧾 Titolo */}
      <MotionDiv
        className={styles.outputHeader}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.iconWrap}>
          <BookOpenCheck size={24} className={styles.iconAnimated} />
        </div>
        <h2 className={styles.outputTitle}>Script Generato</h2>
      </MotionDiv>

      {/* 📄 Corpo dello script visibile solo se isOutputVisible */}
      {isOutputVisible && (
        <div className={styles.outputText}>
          {scriptResult.trim().split(/\n{2,}/).map((block, i) => {
            if (block.trim() === '---') {
              return <div key={`sep-${i}`} className={styles.separator} />;
            }

            return (
              <MotionDiv
                key={i}
                className={styles.scriptBlock}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                {block.split(/(\(.*?\))/g).map((part, j) =>
                  part.match(/^\(.*\)$/) ? (
                    <span key={j} className={styles.tag}>{part}</span>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </MotionDiv>
            );
          })}
        </div>
      )}

      {/* 🎛️ Azioni */}
      <div className={styles.buttonGrid}>
        <button className="glassButton" onClick={handleCopy}>
          <ClipboardCopy size={18} />
          <span>{copied ? 'Copiato ✅' : 'Copia'}</span>
        </button>

        <button className="glassButton" onClick={goToAnalysis}>
          <BarChart4 size={18} className={styles.icon} />
          <span>Analizza Script</span>
        </button>

        <button
          className="glassButton"
          onClick={() => router.push('/raffina')}
        >
          <Wand2 size={18} />
          <span>Raffina Manualmente</span>
        </button>
      </div>
    </MotionDiv>
  )}
</AnimatePresence>

      
      {/* PULSANTE ESPORTA SCRIPT */}
      <AnimatePresence>
      {showExportModal && (
        <MotionDiv
          className="exportModal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
        >
          <div className="modalContent">
            <h3>📤 Esporta il tuo script</h3>
            <input
              className="input"
              type="text"
              value={exportFilename}
              onChange={(e) => setExportFilename(e.target.value)}
              placeholder="Nome del file..."
            />
            <div className="exportButtons">
              <button className="glassButton" onClick={() => handleExport('docx')}>📄 .docx</button>
              <button className="glassButton" onClick={() => handleExport('txt')}>📃 .txt</button>
            </div>
            <button className="glassButton cancelButton" onClick={() => setShowExportModal(false)}>❌ Annulla</button>
          </div>
        </MotionDiv>
      )}
      </AnimatePresence>
      {scriptResult && (
      <button className="glassButton" onClick={() => setShowExportModal(true)}>
        📤 Esporta Script
      </button>
      )}

      {/* PULSANTE CANCELLA BOZZA */}
      <button className="glassButton cancelButton" onClick={() => {
        const conferma = window.confirm('Sei sicuro di voler cancellare la bozza?');
        if (conferma) { setScriptResult(''); localStorage.removeItem('lastScript');}
        }}> 🗑️ Cancella Bozza
      </button>
    </div>
  );
}

// ✅ Applica l'HOC al momento dell'export
export default withAuth(Hero);
