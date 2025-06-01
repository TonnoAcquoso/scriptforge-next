import { useState, useRef, useEffect } from 'react';
import {
  signUp,
  signIn,
  setupTotp,
  verifyTotp,
  getTotpFactors,
  isEmailRegistered,
} from '../utils/auth';
import styles from '../styles/SignUp.module.css';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';

export default function SignUpPage() {
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);

  const [message, setMessage] = useState('');
  const [totpMessage, setTotpMessage] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const router = useRouter();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { redirect } = router.query;
  const [redirectPath, setRedirectPath] = useState('/');

  useEffect(() => {
  if (typeof redirect === 'string') {
    setRedirectPath(redirect);
  }
}, [redirect]);

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
  setIsLoading(true);

  if (!isLogin) {
  setIsLoading(true);

  try {
    const exists = await isEmailRegistered(email.trim().toLowerCase());

    if (exists) {
      toast.error('❌ Account già esistente. Effettua il login.');
      setIsLoading(false);
      return;
    }

    if (recaptchaRef.current) {
      const token = await recaptchaRef.current.executeAsync();
      recaptchaRef.current.reset();

      if (!token) {
        toast.error('⚠️ Verifica reCAPTCHA fallita. Riprova.');
        setIsLoading(false);
        return;
      }

      setRecaptchaToken(token);
    }
  } catch (error) {
    console.error('Errore durante il controllo email:', error);
    toast.error('⚠️ Errore durante la verifica. Riprova più tardi.');
    setIsLoading(false);
    return;
  }
}

  const method = isLogin ? signIn : signUp;
  const { data, error } = await method(email, password);
  setIsLoading(false);

  if (error) {
    setMessage(`Errore: ${error.message}`);
    return;
  }

    await supabase.auth.getSession();

    if (isLogin) {
      const { data: factors, error: factorError } = await getTotpFactors();
      if (factorError) {
        setMessage('Errore nel recupero dei fattori MFA.');
        return;
      }

      const verifiedTotp = factors?.totp?.find(f => f.status === 'verified');

      if (verifiedTotp) {
        setFactorId(verifiedTotp.id);
        setMfaRequired(true);
      } else {
        const { data: mfaData, error: mfaError } = await setupTotp();
        if (mfaError || !mfaData?.totp?.qr_code || !mfaData?.totp?.secret) {
          setMessage('❌ Impossibile configurare MFA. Riprova.');
          return;
        }

        setQrUrl(mfaData.totp.qr_code);
        setManualSecret(mfaData.totp.secret);
        setFactorId(mfaData.id);
        setMfaRequired(true);
        setMessage('');
      }
    } else {
      toast.success('✅ Registrazione completata. Ora puoi effettuare il login.');
    }
  };

  const handleVerifyTotp = async () => {
    if (!totpCode || !factorId) return;

    const { data, error } = await verifyTotp(totpCode, factorId);
    if (error) {
        toast.error(`❌ Codice non valido: ${error.message}`);
      } else {
        toast.success('✅ Verifica MFA riuscita! Reindirizzamento...');
        setTimeout(() => router.push(redirectPath), 1500);
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
            {!isLogin && (
                <div className={styles.passwordCriteria}>
                  <p className={password.length >= 8 ? styles.valid : styles.invalid}>
                    Almeno 8 caratteri
                  </p>
                  <p className={/\d/.test(password) ? styles.valid : styles.invalid}>
                    Almeno un numero
                  </p>
                  <p className={/[A-Z]/.test(password) ? styles.valid : styles.invalid}>
                    Almeno una lettera maiuscola
                  </p>
                </div>
              )}
                {!isLogin && (
                  <ReCAPTCHA
                    sitekey="6LdwZ1IrAAAAALY0PKNRMAdFNUMBQ8mQGw3y2X-D"
                    size="invisible"
                    onChange={(token) => setRecaptchaToken(token || '')}
                    ref={recaptchaRef}
                  />
                )}
            <button
                onClick={handleSubmit}
                className={styles.signupButton}
                disabled={isLoading}
              >
                {isLoading ? 'Caricamento...' : isLogin ? 'Login' : 'Registrati'}
              </button>

            {message && ( <p className={
            message.toLowerCase().includes('esistente') ||
            message.toLowerCase().includes('errore')
              ? styles.errorMessage
              : styles.message}>{message}</p>)}

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
            {qrUrl && (
              <>
                <p className={styles.qrInstructions}>
                  Scansiona questo codice QR con Google Authenticator:
                </p>
                <div className={styles.qrCode}>
                  <img src={qrUrl} alt="QR Code MFA" />
                </div>
              </>
            )}

            {manualSecret && (
              <p className={styles.secretKey}>
                Inserimento manuale: <strong>{manualSecret}</strong>
              </p>
            )}

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

      {!mfaRequired && (
  <div className={styles.disclaimerWrapper}>
    <button
      onClick={() => setShowDisclaimer(!showDisclaimer)}
      className={styles.disclaimerToggle}
      aria-expanded={showDisclaimer}
      aria-controls="disclaimerContent"
    >
      ⚠️ Termini & Privacy
    </button>

    <div
      id="disclaimerContent"
      className={`${styles.disclaimerContent} ${showDisclaimer ? styles.open : ''}`}
    >
      <p>
        Accedendo o creando un account, accetti i nostri{' '}
        <a href="/termini" target="_blank" rel="noopener noreferrer">Termini di Servizio</a>{' '}
        e l' <a href="/privacy" target="_blank" rel="noopener noreferrer">Informativa sulla Privacy</a>.
      </p>
    </div>
  </div>
)}
    </div>
  );
}