// pages/analisiscript.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/AnalisiScript.module.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
import { Clock, FileText, Brain, ArrowLeftCircle, BarChart, Smile, Meh, Frown } from 'lucide-react'; // Icone usate
// Importa la libreria di analisi del tono
import Sentiment from 'sentiment';
const sentiment = new Sentiment();

// ✅ Registriamo i moduli per Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AnalisiScriptPage() {
  const router = useRouter();
  const [script, setScript] = useState('');

  // Analizza il testo una volta che lo script è pronto
const sentimentResult = sentiment.analyze(script);

// Restituisce: score (intensità), comparative, e parole positive/negative
const tone = sentimentResult.score;
const toneLabel =
  tone > 2 ? 'Positivo' : tone < -2 ? 'Negativo' : 'Neutro';

const toneColor =
  tone > 2 ? '#4caf50' : tone < -2 ? '#f44336' : '#9e9e9e';

const toneIcon =
  tone > 2 ? <Smile color="#4caf50" size={18} /> :
  tone < -2 ? <Frown color="#f44336" size={18} /> :
  <Meh color="#9e9e9e" size={18} />;

  // 🧩 Recupera lo script dalla query param
  useEffect(() => {
    if (router.query.script) {
      setScript(decodeURIComponent(router.query.script as string));
    }
  }, [router.query.script]);

  // 📊 Calcolo statistiche base
  const wordCount = script.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);
  const sentenceCount = script.split(/[.!?]/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = sentenceCount ? Math.round(wordCount / sentenceCount) : 0;

  // 🔁 Calcolo parole ricorrenti (ignora parole corte)
  const wordFrequency: Record<string, number> = {};
  script.toLowerCase().split(/\s+/).forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length > 3) {
      wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
    }
  });
  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

    // 🎯 Evidenzia parole chiave rilevanti in stile badge
      const highlightWords = topWords.map(([word, count]) => ({
        word,
        count,
      }));

  // 🧠 Etichetta di complessità lettura
  const getReadingLabel = (minutes: number) => {
    if (minutes <= 2) return { label: 'Breve', color: 'green' };
    if (minutes <= 5) return { label: 'Media', color: 'orange' };
    return { label: 'Lunga', color: 'red' };
  };
  const { label, color } = getReadingLabel(readingTime);

  // 📏 Calcolo lunghezza dei paragrafi
  const filteredParagraphs = script
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.split(/\s+/).length >= 10);
  const paragraphLengths = filteredParagraphs
    .slice(0, 10)
    .map(p => p.split(/\s+/).length);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Analisi Script</h1>

      {/* ✏️ Script visualizzato */}
      <div className={styles.scriptBox}>
        {script || 'Nessuno script ricevuto.'}
      </div>

      {/* 📋 Statistiche dettagliate */}
{script && (
  <div className={styles.analysisBlock}>
    <h3>Analisi Dettagliata</h3>

    {/* 🎯 Griglia delle statistiche principali */}
    <div className={styles.analysisGrid}>
      <div className={styles.statCard}>
        <FileText size={18} style={{ marginBottom: 6 }} />
        <span className={styles.statLabel}>Parole totali</span>
        <strong>{wordCount}</strong>
      </div>
      <div className={styles.statCard}>
        <Clock size={18} style={{ marginBottom: 6 }} />
        <span className={styles.statLabel}>Tempo di lettura</span>
        <strong>{readingTime} min</strong>
      </div>
      <div className={styles.statCard}>
        <Brain size={18} style={{ marginBottom: 6 }} />
        <span className={styles.statLabel}>Complessità</span>
        <strong style={{ color }}>{label}</strong>
      </div>
      <div className={styles.statCard}>
        {toneIcon}
        <span className={styles.statLabel}>Tono generale</span>
        <span className={styles.toneBadge} style={{ backgroundColor: toneColor }}>
          {toneLabel}
        </span>
      </div>
    </div>

    {/* 🔝 Top 5 parole più ricorrenti
    <div className={styles.topWords}>
      <h4>🔠 Parole più usate</h4>
      <ul>
        {topWords.map(([word, freq], i) => (
          <li key={i}>
            <strong>{word}</strong> – {freq} occorrenze
          </li>
        ))}
      </ul>
    </div> */}

    {/* ✨ Temi Ricorrenti 
    <div className={styles.themesBlock}>
      <h4>✨ Temi Ricorrenti</h4>
      <div className={styles.badgeGrid}>
        {highlightWords.map(({ word, count }, index) => (
          <span key={index} className={styles.badge}>
            {word} <span className={styles.badgeCount}>×{count}</span>
          </span>
        ))}
      </div>
    </div> */}

    {/* 📊 Grafico barre */}
    <div className={styles.chartContainer}>
      <h4 className={styles.chartTitle}>
        <BarChart size={20} />
        Lunghezza dei Paragrafi
      </h4>
      <Bar
        data={{
          labels: paragraphLengths.map((_, i) => `Paragrafo ${i + 1}`),
          datasets: [
            {
              label: 'Numero di parole',
              data: paragraphLengths,
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderRadius: 8,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: context => `${context.parsed.y} parole`,
              },
            },
          },
          scales: {
            x: { ticks: { color: '#ccc' } },
            y: { beginAtZero: true, ticks: { color: '#ccc' } },
          },
        }}
      />
    </div>
  </div>
)}
      {/* 🔙 Pulsante di ritorno elegante con animazione */}
          <div className={styles.backButtonContainer}>
            <motion.button
              className={styles.backButton}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onClick={() => router.push('/')}>
              <ArrowLeftCircle size={22} className={styles.backIcon} />
              <span className={styles.backText}>Torna alla Home</span>
            </motion.button>
          </div>
    </div>
  );
}