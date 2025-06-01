import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/SignUp.module.css';

export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'error'>('loading');

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const error = hashParams.get('error');
    const errorCode = hashParams.get('error_code');

    if (error === 'access_denied' && errorCode === 'otp_expired') {
      setStatus('expired');
    } else if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      // Facoltativo: reindirizza dopo qualche secondo
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, []);

  const getMessage = () => {
    switch (status) {
      case 'loading':
        return '⏳ Verifica in corso...';
      case 'success':
        return '✅ Verifica completata. Reindirizzamento in corso...';
      case 'expired':
        return '⚠️ Il codice OTP è scaduto. Riprova a effettuare il login.';
      case 'error':
        return '❌ Errore durante la verifica. Riprova o contatta il supporto.';
      default:
        return '';
    }
  };

  return (
    <div className={styles.signupContainer}>
      <h1 className={styles.pageTitle}>
        <span className={styles.gradient}>ScriptForge AI</span>
      </h1>

      <div className={styles.signupCard}>
        <h2 className={styles.signupTitle}>Verifica Email</h2>
        <p className={styles.message}>{getMessage()}</p>
      </div>
    </div>
  );
}