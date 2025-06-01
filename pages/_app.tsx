// /pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '../src/output.css';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { UserProvider } from '../components/UserContext';
import FloatingProfile from '../components/FloatingProfile'; // ✅ Importa il pulsante profilo

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <ThemeProvider attribute="class">
      <UserProvider>
        <>
          <Component {...pageProps} />
          <FloatingProfile /> {/* ✅ Mostra in tutte le pagine */}
        </>
      </UserProvider>
    </ThemeProvider>
  );
}

export default MyApp;