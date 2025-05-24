// /pages/api/genera.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { topic, niche, style, intensity } = req.body;

  try {
    
    // Crea un nuovo thread di conversazione
    const thread = await openai.beta.threads.create();

    // Aggiungi il messaggio dell'utente al thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: `
  Crea uno script lungo (1200–1500 parole) in stile narrativo riflessivo ed epico, basato su questo personaggio/anime/tema: “${topic}”

  Lo script deve essere creato sulla base delle scelte dell’utente e sarà quindi:
  – Scorrevole e coinvolgente, con uno stile da documentario emotivo o storytelling YouTube
  – Strutturato in forma narrativa fluida (no scalette), con transizioni psicologiche forti (es. “ed è qui che tutto cambia”)
  – Capace di evolversi nel tono (es. da riflessivo a epico)
  – Perfettamente adatto alla registrazione audio

  Includi obbligatoriamente:
  – 1200/1500 parole di script e della durata di 10 minuti
  – Voice-over integrato (tra parentesi: tono, ritmo, pause)
  – Scene con timestamp verificati (episodio + minuto esatto, fonti affidabili)
  – Approfondimenti culturali, psicologici o simbolici
  – Montaggio suggerito: evidenzia i momenti visivi più forti o emotivi
  – Call to action narrativa *inserita nell’ultima frase*, senza chiusura esplicita

  Se possibile, aggiungi anche:
  – Titolo YouTube ottimizzato per CTR e curiosità
  – Descrizione SEO con parole chiave e hashtag

  Una volta completato tutto, riscrivi lo script sotto forma di **testo esteso in stile parlato**, contenente tutto lo script in forma fluida e naturale, come se fosse già pronto per essere registrato dal voice-over, senza sintesi o riassunti.

  Queste sono le preferenze dell’utente:
  – Nicchia: ${niche}
  – Stile narrativo scelto: ${style}
  – Intensità emotiva: ${intensity}
  `,
    });

    // Avvia il run con l'Assistant personale
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: 'asst_k8nUpECUsPnjCgPOfNdrs9el', // 🔁 Inserisci qui il tuo vero Assistant ID
    });

    // Aspetta che il run sia completato
    let result = null;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const check = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      if (check.status === 'completed') {
        result = check;
        break;
      }
    }

    if (!result) {
      return res.status(500).json({ error: 'Timeout durante la generazione dello script' });
    }

    // Recupera l'ultima risposta dell'assistente
    // Recupera tutti i messaggi
    const messages = await openai.beta.threads.messages.list(thread.id);
    console.log('MESSAGES:', JSON.stringify(messages.data, null, 2));
    // Trova il messaggio più recente dell'assistente
    const lastAssistantMessage = messages.data.find((m) => m.role === 'assistant');

    if (!lastAssistantMessage) {
      console.warn('Nessun messaggio dell’assistente trovato');
      return res.status(200).json({ script: 'Nessuna risposta generata' });
    }

    // Cerca il contenuto di tipo "text"
    const textBlock = lastAssistantMessage.content.find((c) => c.type === 'text');

    if (!textBlock || !('text' in textBlock)) {
      console.warn('Nessun contenuto testuale nel messaggio:', lastAssistantMessage.content);
      return res.status(200).json({ script: 'Nessuna risposta generata' });
    }

    const script = textBlock.text.value.trim();
    res.status(200).json({ script });
  }
  catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Errore nella generazione con Assistant' });
}
} 
