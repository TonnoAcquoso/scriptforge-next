import type { NextApiRequest, NextApiResponse } from 'next';

// Variabili d'ambiente
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query mancante o non valida.' });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Errore nella ricerca:', error);
    res.status(500).json({ error: 'Errore durante la ricerca.' });
  }
}