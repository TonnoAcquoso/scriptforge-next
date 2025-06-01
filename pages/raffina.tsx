
// ✅ Import dei moduli necessari
import React, { useState, useEffect } from 'react';
import { useUser } from '../components/UserContext';
import { useRouter } from 'next/router';
import styles from '../styles/Raffina.module.css';
import { motion } from 'framer-motion';
import { Wand2, FileText, ArrowLeftCircle, AlignLeft } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import dynamic from 'next/dynamic';
import highlightDiff from '../utils/highlightDiff'; // 🔍 Per evidenziare differenze
import useThemeAndDraft from '../utils/useThemeAndDraft'; // 🌓 Tema + salvataggio automatico
import withAuth from '../utils/withAuth';




function RaffinaPage() {
  return <div>Benvenuto nella pagina Raffina!</div>;
}



// ⌨️ Editor avanzato caricato solo lato client
const AceEditor = dynamic(() => import('react-ace'), { ssr: false });
const MotionDiv = motion.div as React.FC<React.HTMLAttributes<HTMLDivElement> & any>;
const MotionButton = motion.button as React.FC<React.HTMLAttributes<HTMLDivElement> & any>;

export function RaffinaScriptPage() {

const router = useRouter();
const { user } = useUser();
const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !user) {
      router.replace(`/signup?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [user, isClient]);

  if (!isClient || !user) return null;


  type HistoryEntry = {
  note: string;
  timestamp: number;
  content: string;
};

const [history, setHistory] = useState<HistoryEntry[]>([]);

const loadScript = (index: number) => {
  const selected = history[index];
  setEditableScript(selected.content);
  setEnableEditing(true); // ✅ Mostra l’editor
};

const updateNote = (index: number) => {
  const newNote = prompt("Inserisci un nuovo titolo per questo script:");
  if (!newNote) return;

  const updatedHistory = [...history];
  updatedHistory[index].note = newNote;
  setHistory(updatedHistory);
  localStorage.setItem("scriptHistory", JSON.stringify(updatedHistory));
};

  // ✅ Controlla se l'utente vuole modificare manualmente il testo raffinato
const [enableEditing, setEnableEditing] = useState(false);

// ✅ Contiene la versione modificabile dello script raffinato
const [editableScript, setEditableScript] = useState('');

// 🧠 Lista delle versioni precedenti dello script modificato
const [historyVersions, setHistoryVersions] = useState<string[]>([]);

// 🧠 Stato principale dello script (editor avanzato)
const [advancedScript, setAdvancedScript] = useState('');

  // 🧠 Editor init (solo lato client)
  const [editorReady, setEditorReady] = useState(false);
  useEffect(() => {
    import('ace-builds/src-noconflict/ace').then(() => {
      Promise.all([
        import('ace-builds/src-noconflict/mode-markdown'),
        import('ace-builds/src-noconflict/theme-twilight'),
        import('ace-builds/src-noconflict/ext-language_tools')
      ]).then(() => setEditorReady(true));
    });
  }, []);

  // ✍️ Stato per script utente e raffinato
  const [userScript, setUserScript] = useState('');
  const [refinedScript, setRefinedScript] = useState('');
  const [loading, setLoading] = useState(false);

  // 🌓 Applica tema dark + recupera bozza salvata
  useThemeAndDraft({ userScript, setUserScript });

  // 💾 Cronologia degli script raffinati
  const [refinedHistory, setRefinedHistory] = useState<{ timestamp: string; content: string }[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem('refinedHistory');
    if (stored) setRefinedHistory(JSON.parse(stored));
  }, []);

  // 🎛 Modal esportazione
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilename, setExportFilename] = useState('script-raffinato');

  // 🔁 Differenze attive?
  const [showDiff, setShowDiff] = useState(false);

  

  // 📄 Gestione file txt
  const downloadFile = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
  };

  // 📄 Gestione file docx
  const downloadDocx = async (text: string, filename: string) => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: text.split('\n').map(line =>
          new Paragraph({ children: [new TextRun(line)] })
        ),
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
  };

  // 📤 Esporta in base al tipo
const handleExport = async (type: 'txt' | 'docx') => {
  if (!finalText) return;
  const name = exportFilename.trim() || 'script';
  if (type === 'txt') {
    downloadFile(finalText, `${name}.txt`);
  } else {
    await downloadDocx(finalText, name);
  }
  setShowExportModal(false);
};
  

  

  // 🔁 Raffina il testo inviandolo all'API
  const handleRefine = async () => {
    setLoading(true);
    setRefinedScript('');
    try {
      const response = await fetch('/api/genera', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'refine',
          userScript,
        }),
      });

      const data = await response.json();
      const refined = data.script || 'Nessuna risposta generata.';
      setRefinedScript(refined);

      // 💾 Salva in cronologia (max 5)
      const history = JSON.parse(localStorage.getItem('refinedHistory') || '[]');
      const newEntry = { timestamp: new Date().toISOString(), content: refined };
      const updated = [newEntry, ...history].slice(0, 5);
      localStorage.setItem('refinedHistory', JSON.stringify(updated));
      setRefinedHistory(updated);
    } catch (err) {
      alert('Errore durante il raffinamento dello script');
    } finally {
      setLoading(false);
    }
  };

  // 🎨 Evidenzia differenze solo se attivo
  const highlightedText = showDiff && userScript && refinedScript
  ? highlightDiff(userScript, refinedScript)
  : '';
    

const finalText = enableEditing ? editableScript : refinedScript;


// 🔁 Quando il testo nell’editor avanzato cambia
const handleAdvancedEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setAdvancedScript(e.target.value);
};

// 🟢 Quando attivo la modifica manuale, copia lo script avanzato
const handleToggleEdit = () => {
  const newState = !enableEditing;
  setEnableEditing(newState);
  if (newState) {
    setEditableScript(advancedScript); // Copia contenuto
  }
};

// 💾 Salva una nuova versione dello script ogni volta che viene modificato
const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  setHistoryVersions(prev => [...prev, editableScript]);
  setEditableScript(e.target.value);
};

const handleUndo = () => {
  console.log("🌀 Clic su Ripristina");
  if (historyVersions.length === 0) return;
  const previousVersion = historyVersions[historyVersions.length - 1];
  setEditableScript(previousVersion);
  setHistoryVersions(prev => prev.slice(0, -1));
};

const handleApplyChanges = () => {
  console.log("💾 Modifiche applicate");
  localStorage.setItem("finalEditedScript", editableScript);
  setHistoryVersions([]);
};




  return (
  <div className={styles.container}>
    {/* 🧠 Intestazione con titolo e descrizione */}
    <h1 className={styles.title}>
      <Wand2 size={28} />
      Raffina il tuo Script/Testo
    </h1>
    <p className={styles.subtitle}>
      Scrivi il tuo testo qui sotto e miglioralo con un solo click
    </p>

    {/* ✍️ Editor avanzato */}
    <div className={styles.customEditorWrapper}>
      <textarea
        className={styles.customEditor}
        placeholder="Inizia a scrivere il tuo script qui..."
        value={userScript}
        onChange={(e) => setUserScript(e.target.value)}
      />
    </div>

    {/* ✨ Bottone per eseguire il raffinamento */}
    <button
      className={styles.refineButton}
      onClick={handleRefine}
      disabled={loading || !userScript.trim()}
    >
      {loading ? 'Raffinamento in corso...' : '✨ Migliora Testo'}
    </button>

    {/* ✅ Toggle per confronto visivo */}
    <label style={{ display: 'block', marginTop: '1.5rem' }}>
      <input
        type="checkbox"
        checked={showDiff}
        onChange={() => setShowDiff(!showDiff)}
        style={{ marginRight: '0.5rem' }}
      />
      Mostra differenze evidenziate
    </label>

    {/* 📊 Confronto Testo Originale vs Raffinato */}
    {refinedScript && (
      <MotionDiv
        className={styles.resultContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.column}>
          <h3 className={styles.resultTitle}>
            <FileText size={20} /> Testo Originale
          </h3>
          <pre className={styles.resultText}>{userScript}</pre>
        </div>

        <div className={styles.column}>
          <h3 className={styles.resultTitle}>
            <FileText size={20} /> Testo Raffinato
          </h3>
          {showDiff ? (
            <div
              className={styles.resultText}
              dangerouslySetInnerHTML={{ __html: highlightedText }}
            />
          ) : (
            <pre className={styles.resultText}>{refinedScript}</pre>
          )}
        </div>
      </MotionDiv>
    )}

    {/* 🧠 Editor modificabile (manuale) */}
    <div className={styles.editorContainer}>
      <label className={styles.editorToggle}>
        <input
          type="checkbox"
          checked={enableEditing}
          onChange={() => {
            const newState = !enableEditing;
            setEnableEditing(newState);
            if (newState) {
              setEditableScript(userScript); // ✅ copia il testo attuale
            }
          }}
        />
        🧠 Entra in modalità editor avanzato
      </label>

      {enableEditing && (
        <div className={styles.editorAreaWrapper}>
          <textarea
            className={styles.editableArea}
            value={editableScript}
            onChange={handleScriptChange}
          />
          <div className={styles.editorButtons}>
            <button onClick={handleUndo} className={styles.undoButton}>↩️ Ripristina</button>
            <button onClick={handleApplyChanges} className={styles.applyButton}>✅ Applica</button>
          </div>
        </div>
      )}
    </div>

    {/* 📤 Pulsante per esportazione */}
    {refinedScript && (
      <button className="glassButton" onClick={() => setShowExportModal(true)}>
        📤 Esporta Script
      </button>
    )}

    {/* 🕘 Storico script raffinati */}
    <div className={styles.historyContainer}>
      <h3 className={styles.historyTitle}>📜 Script Salvati</h3>
      <ul className={styles.historyList}>
        {history.map((entry, index) => (
          <li key={index} className={styles.historyItem}>
            <div className={styles.historyInfo}>
              <span className={styles.historyNote}>{entry.note || `Script ${index + 1}`}</span>
              <span className={styles.historyTimestamp}>
                {new Date(entry.timestamp).toLocaleString('it-IT', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className={styles.historyButtons}>
              <button onClick={() => loadScript(index)} className={styles.loadButton}>🔄 Carica</button>
              <button onClick={() => updateNote(index)} className={styles.editButton}>✏️ Modifica</button>
            </div>
          </li>
        ))}
      </ul>
    </div>

    {/* 🔙 Torna alla Home */}
    <div className={styles.backButtonContainer}>
      <MotionButton
        className={styles.backButton}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
        onClick={() => window.location.href = '/'}
      >
        <ArrowLeftCircle size={20} className={styles.backIcon} />
        <span className={styles.backText}>Torna alla Home</span>
      </MotionButton>
    </div>

    {/* 📦 Modale Esportazione */}
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
            <button className="glassButton" onClick={() => handleExport('docx')}>📄 DOCX</button>
            <button className="glassButton" onClick={() => handleExport('txt')}>📃 TXT</button>
          </div>
          <button className="glassButton cancelButton" onClick={() => setShowExportModal(false)}>
            ❌ Annulla
          </button>
        </div>
      </MotionDiv>
    )}
  </div>
);
}
// ✅ Applica l'HOC al momento dell'export
export default withAuth(RaffinaScriptPage);
