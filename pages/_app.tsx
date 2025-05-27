// /pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import '@fontsource/inter/400.css'; // Peso normale
import '@fontsource/inter/600.css'; // Peso medio (opzionale)
import '@fontsource/inter/700.css'; // Peso bold (opzionale)
import '../styles/globals.css';     // Il tuo CSS globale
import '../src/output.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}