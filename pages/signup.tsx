// ⬆️ IMPORTS (come da tuo codice)
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
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const router = useRouter();
  const { redirect } = router.query;
  const [redirectPath, setRedirectPath] = useState('/');
  const [showGuideModal, setShowGuideModal] = useState(false);

  // ✨ Component guida MFA (interno al file)
const AuthGuide = () => (
  <div className={styles.authGuideBox}>
    <h4>🔒 Come verificarti</h4>
    <ul>
      <li>1. Scarica l'app 'Google Authenticator' dallo store</li>
      <li>2. Apri l'app</li>
      <li>3. Clicca sul + in basso a destra e inserisci il codice fornito manualmente o scansiona il QR</li>
      <li>4. Se non trovi l’account, ricontrolla il QR o il codice manuale</li>
    </ul>
  </div>
);

  useEffect(() => {
    if (typeof redirect === 'string') {
      setRedirectPath(redirect);
    }
  }, [redirect]);

  const validateInputs = () => {
    const emailOK = /\S+@\S+\.\S+/.test(email.trim());
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

    // 🔐 REGISTRAZIONE
    if (!isLogin) {
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const exists = await isEmailRegistered(normalizedEmail);
        if (exists) {
          toast.error('❌ Account già esistente. Effettua il login.');
          setIsLoading(false);
          return;
        }

        // ✅ reCAPTCHA
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

        const { data, error } = await signUp(normalizedEmail, password);
        if (error || !data?.user) {
          console.error('🛑 Signup fallita:', { error, user: data?.user });
          toast.error('❌ Errore durante la registrazione.');
          setIsLoading(false);
          return;
        }

        console.log('✅ Registrazione riuscita:', data.user);
        toast.success("✅ Registrazione completata. Controlla l’email per confermare l’account.");
      } catch (err) {
        console.error('❌ Errore inatteso durante la registrazione:', err);
        toast.error('⚠️ Errore imprevisto. Riprova più tardi.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 🔐 LOGIN
    try {
      const { data, error } = await signIn(email, password);
      if (error) {
        toast.error('❌ Login fallito.');
        setIsLoading(false);
        return;
      }

      const session = await supabase.auth.getSession();
      const access_token = session?.data?.session?.access_token;

      if (!access_token) {
        toast.error("⚠️ Sessione non valida. Conferma l’email e riprova.");
        setIsLoading(false);
        return;
      }

      console.log("🧾 UID Sessione:", session.data.session.user.id);

      // MFA
      const { data: factors, error: factorError } = await getTotpFactors();
      if (factorError) {
        toast.error('Errore nel recupero dei fattori MFA.');
        setIsLoading(false);
        return;
      }

      const verifiedTotp = factors?.totp?.find(f => f.status === 'verified');

      if (verifiedTotp) {
        setFactorId(verifiedTotp.id);
        setMfaRequired(true);
      } else {
        const { data: mfaData, error: mfaError } = await setupTotp();
        if (mfaError || !mfaData?.totp?.qr_code || !mfaData?.totp?.secret) {
          toast.error('❌ Impossibile configurare MFA. Riprova.');
          setIsLoading(false);
          return;
        }

        setQrUrl(mfaData.totp.qr_code);
        setManualSecret(mfaData.totp.secret);
        setFactorId(mfaData.id);
        setMfaRequired(true);
        setMessage('');
      }

      toast.success('✅ Login riuscito!');
    } catch (err) {
      console.error('❌ Errore imprevisto durante il login:', err);
      toast.error('❌ Errore imprevisto durante il login.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔐 MFA + CREAZIONE PROFILO POST-MFA
  const handleVerifyTotp = async () => {
    console.log('🧪 Verifica TOTP con', { factorId, totpCode });

    const { error: verifyError } = await verifyTotp(totpCode, factorId);
    if (verifyError) {
      console.error('❌ Errore verifica TOTP:', verifyError);
      setTotpMessage('⚠️ Codice MFA non valido.');
      return;
    }

    toast.success('✅ MFA verificata!');
    setTotpMessage('');

    try {
      const session = await supabase.auth.getSession();
      const access_token = session?.data?.session?.access_token;

      if (!access_token) {
        toast.error("⚠️ Sessione non valida. Riprova.");
        return;
      }

      const userId = session.data.session.user.id;
      const userEmail = session.data.session.user.email;

      console.log('🧾 UID Sessione:', userId);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          [{
            id: userId,
            email: userEmail,
            role: 'user',
          }],
          { onConflict: 'id' }
        );

      if (profileError) {
        console.error('❌ Errore salvataggio profilo post-MFA:', profileError.message || profileError);
        toast.error('⚠️ Errore durante il salvataggio del profilo.');
        return;
      }

      console.log('✅ Profilo salvato o aggiornato correttamente post-MFA.');
      toast.success('✅ Login completato con successo!');
      router.push(redirectPath || '/');
    } catch (err) {
      console.error('❌ Errore durante il salvataggio post-MFA:', err);
      toast.error('❌ Errore imprevisto. Riprova.');
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
      <div className={styles.formContent}>
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
                <p className={/[^A-Za-z0-9]/.test(password) ? styles.valid : styles.invalid}>
                  Almeno un carattere speciale
                </p>
              </div>
            )}

            {!isLogin && (
              <ReCAPTCHA
                sitekey="6LdwZ1IrAAAAALY0PKNRMAdFNUMBQ8mQGw3y2X-D"
                size="invisible"
                onChange={token => setRecaptchaToken(token || '')}
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

            {message && (
              <p
                className={
                  message.toLowerCase().includes('esistente') ||
                  message.toLowerCase().includes('errore')
                    ? styles.errorMessage
                    : styles.message
                }
              >
                {message}
              </p>
            )}

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
            {/* 📱 Pulsante guida mobile */}
            <div className={styles.mobileGuideLink}>
              <button onClick={() => setShowGuideModal(true)}>❓ Come fare?</button>
            </div>

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

      {/* 🖥️ Mini guida desktop */}
      {mfaRequired && (
        <div className={styles.desktopGuideBox}>
          <AuthGuide />
        </div>
      )}

      {/* 📱 Modal guida mobile */}
      {showGuideModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeModal}
              onClick={() => setShowGuideModal(false)}
            >
              Chiudi
            </button>
            <AuthGuide />
          </div>
        </div>
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
            <a href="/termini" target="_blank" rel="noopener noreferrer">
              Termini di Servizio
            </a>{' '}
            e l'{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Informativa sulla Privacy
            </a>.
          </p>
        </div>
      </div>
    )}
  </div>
);



}