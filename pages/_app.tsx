// /pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import '@fontsource/inter/400.css'; // Peso normale
import '@fontsource/inter/600.css'; // Peso medio (opzionale)
import '@fontsource/inter/700.css'; // Peso bold (opzionale)
import '../src/output.css';
import { ThemeProvider } from 'next-themes'


import { useEffect } from "react";



function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
