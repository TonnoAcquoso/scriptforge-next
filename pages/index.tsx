import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [showGuide, setShowGuide] = useState(false);
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState('Anime');
  const [style, setStyle] = useState('Epico');
  const [intensity, setIntensity] = useState('Media');
  const [loading, setLoading] = useState(false);
  const [scriptResult, setScriptResult] = useState('');
  const [theme, setTheme] = useState('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilename, setExportFilename] = useState('script');
  const [openGeneral, setOpenGeneral] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [history, setHistory] = useState<{ timestamp: string; topic: string; content: string; note?: string }[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [noteFilter, setNoteFilter] = useState('');
  const [copied, setCopied] = useState(false);
  
<pre className={`outputText`}>{scriptResult}</pre>

useEffect(() => {
  if (typeof window === 'undefined') return;
  const handleScroll = () => {
    const currentScroll = window.scrollY;
    if (currentScroll > lastScrollTop) {
      setIsScrollingDown(true);
    } else {
      setIsScrollingDown(false);
    }
    setLastScrollTop(currentScroll);
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [lastScrollTop]);

useEffect(() => {
  const isMobile = window.innerWidth <= 768;
  if (!isMobile) return;

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const shouldShow = scrollTop < 100;
    const menu = document.querySelector('.menuContainer') as HTMLElement;
    if (menu) {
      menu.style.opacity = shouldShow ? '1' : '0';
      menu.style.transition = 'opacity 0.5s ease';
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);

useEffect(() => {
  if (scriptResult) {
    const history = JSON.parse(localStorage.getItem('scriptHistory') || '[]');
    const newEntry = {
  timestamp: new Date().toISOString(),
  topic,
  content: scriptResult,
};
    localStorage.setItem('scriptHistory', JSON.stringify([newEntry, ...history].slice(0, 5))); // Max 5
  }
}, [scriptResult]);

useEffect(() => {
  const stored = localStorage.getItem('scriptHistory');
  if (stored) {
    setHistory(JSON.parse(stored));
  }
}, []);


const downloadFile = (text: string, filename: string) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
};

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

const handleTxtDownload = () => {
  const filename = prompt('Nome del file?', 'script');
  if (filename) {
    downloadFile(scriptResult, `${filename}.txt`);
  }
};

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

  const [rotateIcon, setRotateIcon] = useState(false); // ROTAZIONE BOTTONE

const handleThemeToggle = () => {
  setRotateIcon(true);
  setTheme(theme === 'dark' ? 'light' : 'dark');
  setTimeout(() => setRotateIcon(false), 500); // durata animazione
};

useEffect(() => {
  const savedScript = localStorage.getItem('lastScript');
  if (savedScript) {
    setScriptResult(savedScript);
  }
}, []);

useEffect(() => {
  if (scriptResult) {
    localStorage.setItem('lastScript', scriptResult);
  }
}, [scriptResult]);

const updateNote = (index: number) => {
  const newNote = prompt('Modifica la nota:', history[index].note || history[index].topic);
  if (newNote === null) return;
  
  const updated = [...history];
  updated[index].note = newNote;
  setHistory(updated);
  localStorage.setItem('scriptHistory', JSON.stringify(updated));
};

const handleCopy = () => {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = scriptResult;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    alert('Errore durante la copia');
  }
};


  return (
    <div className={styles.container}>
      <img src="/banner_martello.png" alt="Logo" className={styles.logo} />
      <h1 className={styles.title}>ScriptForge AI</h1>
      <p className={styles.subtitle}>Il tuo compagno di script</p>

      <div className="menuContainer"> 
      <button
      className="menuIcon"
      onClick={() => {
      if (menuOpen) setShowGuide(false); // ← CHIUDE anche la guida
      setMenuOpen(!menuOpen);
      }}
      >
      {menuOpen ? '✖' : '☰'}
    </button>

  <AnimatePresence>
  {menuOpen && (
    <motion.div
      className="menuPopup"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
  className="floatingControls"
  initial={{ opacity: 1 }}
  animate={{ opacity: isScrollingDown && showGuide ? 0 : 1 }}
  transition={{ duration: 0.3 }}
>
      <button className="glassButton" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? '☀️' : '🌙'} Tema
      </button>
      <button className="glassButton" onClick={() => setShowGuide(!showGuide)}>
        {showGuide ? 'ℹ︎ Guida' : 'ℹ︎ Guida'}
      </button>
    </motion.div>
    </motion.div>
  )}
  </AnimatePresence>
  
</div>

<AnimatePresence>
  {showGuide && (
    <motion.div
      className="guideBox"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <h3>Guida Rapida 📘</h3>

      <div className="accordionBlock">
        <button
          className="accordionToggle"
          onClick={() => setOpenGeneral(!openGeneral)}
        >
          <span>{openGeneral ? '▼' : '▶'} Come usare il sito</span>
        </button>
        <AnimatePresence>
          {openGeneral && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <li>✏️ Inserisci un argomento rilevante</li>
              <li>🎯 Seleziona la nicchia del contenuto</li>
              <li>🎭 Scegli lo stile narrativo più adatto</li>
              <li>❤️ Imposta l’intensità emotiva</li>
              <li>⚡ Premi “Genera Script” e attendi</li>
              <li>📥 Esporta in .txt o .docx se desideri salvarlo</li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <div className="accordionBlock">
        <button
          className="accordionToggle"
          onClick={() => setOpenSelect(!openSelect)}
        >
          <span>{openSelect ? '▼' : '▶'} Come funzionano le select box</span>
        </button>
        <AnimatePresence>
          {openSelect && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ul>
                <li><strong>🎭 Stile Narrativo:</strong>
                  <ul>
                    <li><strong>Epico:</strong> Ideale per anime d’azione, fantasy, sport o storie eroiche. Trasmette forza, ritmo e solennità.</li>
                    <li><strong>Riflessivo:</strong> Perfetto per podcast, biografie, narrazioni personali o salute & benessere. Crea connessione intima.</li>
                    <li><strong>Psicologico:</strong> Per drammi, cinema e crescita personale. Approfondisce emozioni e conflitti interni.</li>
                    <li><strong>Ironico:</strong> Gaming, tecnologia, reaction o satira. Stile leggero, tagliente, vivace.</li>
                  </ul>
                </li>
                <li><strong>❤️ Intensità Emotiva:</strong>
                  <ul>
                    <li><strong>Alta:</strong> Scene drammatiche, epiche o motivazionali. Per massimo impatto.</li>
                    <li><strong>Media:</strong> Bilanciata, versatile. Adatta a quasi tutti i contenuti.</li>
                    <li><strong>Bassa:</strong> Neutra, razionale. Ottima per educazione e tutorial.</li>
                  </ul>
                </li>
                <li><strong>💡 Suggerimenti per nicchie:</strong>
                  <ul>
                    <li><strong>Anime / Fantasy:</strong> Epico o Psicologico – Alta/Media</li>
                    <li><strong>Educazione / Finanza:</strong> Riflessivo o Psicologico – Media/Bassa</li>
                    <li><strong>Podcast / Salute:</strong> Riflessivo – Media</li>
                    <li><strong>Gaming / Tecnologia:</strong> Ironico o Epico – Media/Bassa</li>
                    <li><strong>Cinema / Motivazionale:</strong> Epico o Psicologico – Alta</li>
                    <li><strong>Sport:</strong> Epico – Alta</li>
                  </ul>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      
      <div className={styles.formGroup}>
        <label className={styles.label}>Inserisci Argomento</label>
        <textarea
          className={styles.input}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Scrivi l'argomento qui..."
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Seleziona la nicchia</label>
        <select className={styles.select} value={niche} onChange={(e) => setNiche(e.target.value)}>
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

      <div className={styles.formGroup}>
        <label className={styles.label}>Seleziona lo stile narrativo</label>
        <select className={styles.select} value={style} onChange={(e) => setStyle(e.target.value)}>
          <option>Epico</option>
          <option>Riflessivo</option>
          <option>Psicologico</option>
          <option>Ironico</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Seleziona l'intensità emotiva</label>
        <select className={styles.select} value={intensity} onChange={(e) => setIntensity(e.target.value)}>
          <option>Alta</option>
          <option>Media</option>
          <option>Bassa</option>
        </select>
      </div>

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
        <motion.div
          className={styles.output}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <h2>Risultato:</h2>
          <pre>{scriptResult}</pre>
          <button className="glassButton" onClick={handleCopy}>
          📋 {copied ? 'Copiato ✅' : 'Copia'}
          </button>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {showExportModal && (
        <motion.div
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
              <button className="glassButton" onClick={() => handleExport('docx')}>📄 DOCX</button>
              <button className="glassButton" onClick={() => handleExport('txt')}>📃 TXT</button>
            </div>
            <button className="glassButton cancelButton" onClick={() => setShowExportModal(false)}>❌ Annulla</button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      {scriptResult && (
      <button className="glassButton" onClick={() => setShowExportModal(true)}>
        📤 Esporta Script
      </button>
      )}
      <button
  className="glassButton cancelButton"
  onClick={() => {
    const conferma = window.confirm('Sei sicuro di voler cancellare la bozza?');
    if (conferma) {
      setScriptResult('');
      localStorage.removeItem('lastScript');
    }
  }}
>
  🗑️ Cancella Bozza
</button>

    </div>
  );
}
