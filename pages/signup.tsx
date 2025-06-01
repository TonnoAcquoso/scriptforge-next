import { useState } from 'react';
import { signUp, signIn, sendOtp } from '../utils/auth';
import styles from '../styles/SignUp.module.css';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/router';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
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
        // Dopo login classico → invia link OTP via email
        await sendOtp(email);
        setMessage('✅ Login riuscito. Controlla la tua email per completare l’accesso.');
      } else {
        setMessage('✅ Registrazione completata. Ora puoi effettuare il login.');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className={styles.signupContainer}>
      <h1 className={styles.pageTitle}>
        <span className={styles.gradient}>ScriptForge AI</span>
      </h1>

      <div className={styles.signupCard}>
        <h2 className={styles.signupTitle}>
          {isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
        </h2>

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
      </div>
    </div>
  );
}