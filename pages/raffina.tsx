import * as React from 'react';

// ✅ Import dei moduli necessari
import { useState, useEffect } from 'react';
import styles from '../styles/Raffina.module.css';
import { motion } from 'framer-motion';
import { Wand2, FileText, ArrowLeftCircle, AlignLeft } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import dynamic from 'next/dynamic';

import highlightDiff from '../utils/highlightDiff'; // 🔍 Per evidenziare differenze
import useThemeAndDraft from '../utils/useThemeAndDraft'; // 🌓 Tema + salvataggio automatico

// ⌨️ Editor avanzato caricato solo lato client
const AceEditor = dynamic(() => import('react-ace'), { ssr: false });

export default function RaffinaScriptPage() {
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
    if (!refinedScript) return;
    const name = exportFilename.trim() || 'script';
    type === 'txt'
      ? downloadFile(refinedScript, `${name}.txt`)
      : await downloadDocx(refinedScript, name);
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

      {/* ✍️ Editor avanzato con evidenziazione e supporto markdown */}
              <AceEditor
                mode="markdown"
                wrapEnabled={true} // ✅ obbliga il ritorno a capo
                theme="twilight" // Cambia in 'github' se usi tema chiaro
                value={userScript}
                onChange={(value) => setUserScript(value)}
                name="editor"
                fontSize={14}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  showLineNumbers: true,
                  tabSize: 2,
                }}
                style={{
                  width: '100%',
                  height: '320px',
                  borderRadius: '12px',
                  marginTop: '1rem',
                  fontFamily: 'monospace',
                  padding: '1rem', // ✅ Spazio interno al contenuto
                  boxSizing: 'border-box', // ✅ Include il padding nei calcoli di dimensione
                  overflowWrap: 'break-word', // ✅ Va a capo dove serve
                  whiteSpace: 'pre-wrap', // ✅ Mantiene il testo leggibile e a capo
                  backgroundColor: 'rgba(255, 255, 255, 0.33)', // ✅ Migliore visibilità bordo editor
                  color: 'var(--text-color)' // ✅ Colore testo dinamico
                }}
              />

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
        <motion.div
          className={styles.resultContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* 🔎 Testo originale */}
          <div className={styles.column}>
            <h3 className={styles.resultTitle}>
              <FileText size={20} /> Testo Originale
            </h3>
            <pre className={styles.resultText}>{refinedScript}</pre>
          </div>

          {/* 🌟 Testo raffinato */}
              <div className={styles.column}>
                <h3 className={styles.resultTitle}>
                  <FileText size={20} /> Testo Raffinato
                </h3>
                {showDiff ? (
                        <div
                          className={styles.resultText} // ✅ Mantiene lo stesso stile del testo originale
                          dangerouslySetInnerHTML={{ __html: highlightedText }}
                        />
                      ) : (
                        <pre className={styles.resultText}>{refinedScript}</pre>
                      )}
              </div>
        </motion.div>
      )}
      
      {/* 📤 Pulsante per aprire il popup di esportazione */}
          {refinedScript && (
            <button className="glassButton" onClick={() => setShowExportModal(true)}>
              📤 Esporta Script
            </button>
          )}

          {/* 🕘 Storico degli ultimi script raffinati */}
              {refinedHistory.length > 0 && (
                <div className={styles.historyBox}>
                  <h3>📜 Cronologia Script Raffinati</h3>
                  <ul>
                    {refinedHistory.map((item, index) => (
                      <li key={index}>
                        <button
                          className="glassButton"
                          onClick={() => setRefinedScript(item.content)} // 🔁 Carica nuovamente lo script selezionato
                        >
                          Script del {new Date(item.timestamp).toLocaleString()}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

      {/* 🔙 Pulsante per tornare alla home */}
      <div className={styles.backButtonContainer}>
        <motion.button
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
        </motion.button>
      </div>
      {/* 📦 Popup modale per esportazione file */}
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

                {/* ✍️ Campo per inserire il nome del file */}
                <input
                  className="input"
                  type="text"
                  value={exportFilename}
                  onChange={(e) => setExportFilename(e.target.value)}
                  placeholder="Nome del file..."
                />

                {/* 📄 Pulsanti formato file */}
                <div className="exportButtons">
                  <button className="glassButton" onClick={() => handleExport('docx')}>📄 DOCX</button>
                  <button className="glassButton" onClick={() => handleExport('txt')}>📃 TXT</button>
                </div>

                {/* ❌ Pulsante per annullare */}
                <button className="glassButton cancelButton" onClick={() => setShowExportModal(false)}>
                  ❌ Annulla
                </button>
              </div>
            </motion.div>
          )}
              </div>
            );
}