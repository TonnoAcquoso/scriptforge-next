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
import FloatingProfile from '../components/FloatingProfile';
import { Toaster } from 'react-hot-toast';
import { useIdleLogout } from '../hooks/useIdleLogout';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { Router } from 'next/router';

function MyApp({ Component, pageProps }: AppProps) {
  // 🔐 Logout dopo inattività
  useIdleLogout(120);

  useEffect(() => {
    // 🎨 Imposta il tema salvato localmente
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 📊 Inizializza PostHog
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // la gestiamo manualmente
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') ph.debug();
      }
    });

    // 📈 Tracciamento pageview manuale
    const handleRouteChange = () => posthog.capture('$pageview');
    Router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      Router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <ThemeProvider attribute="class">
        <UserProvider>
          <>
            <Component {...pageProps} />
            <FloatingProfile />
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
    </PostHogProvider>
  );
}

export default MyApp;