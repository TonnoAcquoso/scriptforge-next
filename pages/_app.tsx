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
import { Toaster } from 'react-hot-toast'; // ✅ Importa il sistema di toast
import { useIdleLogout } from '../hooks/useIdleLogout';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useIdleLogout(15); // ⏱ Logout dopo 15 minuti

  return (
    <ThemeProvider attribute="class">
      <UserProvider>
        <>
          <Component {...pageProps} />
          <FloatingProfile /> {/* ✅ Mostra in tutte le pagine */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1e293b',
                fontWeight: 600,
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </>
      </UserProvider>
    </ThemeProvider>
  );
}

export default MyApp;