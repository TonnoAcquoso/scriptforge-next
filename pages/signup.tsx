import { useState } from 'react';
import {
  signUp,
  signIn,
  sendOtp,
  setupTotp,
  verifyTotp,
  getTotpFactors,
} from '../utils/auth';
import styles from '../styles/SignUp.module.css';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [factorId, setFactorId] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);

  const [message, setMessage] = useState('');
  const [totpMessage, setTotpMessage] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);

  const router = useRouter();

  const validateInputs = () => {
    const emailOK = /\S+@\S+\.\S+/.test(email);
    const passwordOK = password.length >= 8;

    setEmailValid(emailOK);
    setPasswordValid(passwordOK);

    if (!emailOK || !passwordOK) {
      setMessage("Inserisci un'email valida e una password di almeno 8 caratteri.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    const method = isLogin ? signIn : signUp;
    const { data, error } = await method(email, password);

    if (error) {
      setMessage(`Errore: ${error.message}`);
    } else {
      if (isLogin) {
        // 🔐 Verifica se esiste già un TOTP configurato
        const { data: factorData } = await getTotpFactors();
        const totpFactor = factorData?.totp?.find(f => f.status === 'verified');

        if (totpFactor) {
          setFactorId(totpFactor.id);
          setMfaRequired(true);
        } else {
          // Nessun TOTP esistente → creazione QR
          const mfa = await setupTotp();
          if (mfa.error || !mfa.data) {
            setMessage('✅ Login riuscito. MFA non configurata, riceverai un link via email.');
            await sendOtp(email);
          } else {
            setQrUrl(mfa.data.totp.qr_code);
            setFactorId(mfa.data.id);
            setMfaRequired(true);
            setMessage('');
          }
        }
      } else {
        setMessage('✅ Registrazione completata. Ora puoi effettuare il login.');
      }
    }
  };

  const handleVerifyTotp = async () => {
    if (!totpCode || !factorId) return;

    const { data, error } = await verifyTotp(totpCode, factorId);
    if (error) {
      setTotpMessage(`❌ Codice non valido: ${error.message}`);
    } else {
      setTotpMessage('✅ Verifica MFA riuscita. Reindirizzamento...');
      setTimeout(() => router.push('/'), 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      mfaRequired ? handleVerifyTotp() : handleSubmit();
    }
  };

  return (
    <div className={styles.signupContainer}>
      <h1 className={styles.pageTitle}>
        <span className={styles.gradient}>ScriptForge AI</span>
      </h1>

      <div className={styles.signupCard}>
        <h2 className={styles.signupTitle}>
          {mfaRequired
            ? 'Verifica con Google Authenticator'
            : isLogin
            ? 'Accedi al tuo account'
            : 'Crea un nuovo account'}
        </h2>

        {!mfaRequired ? (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`${styles.inputField} ${emailValid ? '' : styles.invalid}`}
              onKeyDown={handleKeyDown}
            />

            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`${styles.inputField} ${passwordValid ? '' : styles.invalid}`}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(prev => !prev)}
                aria-label="Mostra o nascondi password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button onClick={handleSubmit} className={styles.signupButton}>
              {isLogin ? 'Login' : 'Registrati'}
            </button>

            {message && <p className={styles.message}>{message}</p>}

            <p className={styles.toggleText}>
              {isLogin ? 'Non hai un account?' : 'Hai già un account?'}{' '}
              <span
                className={styles.toggleLink}
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                }}
              >
                {isLogin ? 'Registrati' : 'Accedi'}
              </span>
            </p>
          </>
        ) : (
          <>
            <p className={styles.qrInstructions}>
              Scansiona il codice QR con Google Authenticator, poi inserisci il codice a 6 cifre:
            </p>

            <div className={styles.qrCode}>
              <img src={qrUrl} alt="QR Code" />
            </div>

            <input
              type="text"
              placeholder="Codice a 6 cifre"
              value={totpCode}
              onChange={e => setTotpCode(e.target.value)}
              className={styles.inputField}
              onKeyDown={handleKeyDown}
            />

            <button onClick={handleVerifyTotp} className={styles.signupButton}>
              Verifica Codice
            </button>

            {totpMessage && <p className={styles.message}>{totpMessage}</p>}
          </>
        )}
      </div>
    </div>
  );
}