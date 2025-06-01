import { useState, useEffect } from 'react';
import { signUp, signIn, verifyOtp, sendOtp } from '../utils/auth';
import styles from '../styles/SignUp.module.css';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);

  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpStep && countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [isOtpStep, countdown]);

  const validateInputs = () => {
    const emailOK = /\S+@\S+\.\S+/.test(email);
    const passwordOK = password.length >= 8;

    setEmailValid(emailOK);
    setPasswordValid(passwordOK);

    if (!emailOK || !passwordOK) {
      setMessage('Inserisci un\'email valida e una password di almeno 8 caratteri.');
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
        setIsOtpStep(true);
        setMessage('✅ Login effettuato. Inserisci il codice OTP che ti abbiamo inviato via email.');
        setCountdown(60);
        setCanResend(false);
        await sendOtp(email); // Invia OTP automaticamente
      } else {
        setMessage('✅ Registrazione completata. Ora puoi effettuare il login.');
      }
    }
  };

  const handleOtpVerification = async () => {
    if (!otp || otp.length < 6) {
      setOtpMessage('Inserisci un codice OTP valido.');
      return;
    }

    const { success, error } = await verifyOtp(email, otp);
    if (success) {
      setOtpMessage('✅ Verifica completata. Reindirizzamento...');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      setOtpMessage(`Errore: ${error.message}`);
    }
  };

  const handleResendOtp = async () => {
    const { success, error } = await sendOtp(email);
    if (success) {
      setOtpMessage('📩 Nuovo codice inviato alla tua email.');
      setCountdown(60);
      setCanResend(false);
    } else {
      setOtpMessage(`Errore: ${error.message}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      isOtpStep ? handleOtpVerification() : handleSubmit();
    }
  };

  return (
    <div className={styles.signupContainer}>
      <h1 className={styles.pageTitle}>
        <span className={styles.gradient}>ScriptForge AI</span>
      </h1>

      <div className={styles.signupCard}>
        <h2 className={styles.signupTitle}>
          {isOtpStep
            ? 'Verifica OTP'
            : isLogin
            ? 'Accedi al tuo account'
            : 'Crea un nuovo account'}
        </h2>

        {!isOtpStep ? (
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
            <input
              type="text"
              placeholder="Inserisci codice OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className={styles.inputField}
              onKeyDown={handleKeyDown}
            />

            <button onClick={handleOtpVerification} className={styles.signupButton}>
              Verifica OTP
            </button>

            {otpMessage && <p className={styles.message}>{otpMessage}</p>}

            <div className={styles.resendSection}>
              <p className={styles.otpCountdown}>
                {canResend
                  ? 'Non hai ricevuto il codice?'
                  : `Puoi reinviare il codice tra ${countdown}s`}
              </p>

              <button
                className={styles.resendButton}
                onClick={handleResendOtp}
                disabled={!canResend}
              >
                Reinvia codice
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}