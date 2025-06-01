// utils/auth.ts
import { supabase } from './supabaseClient';

// ✅ Signup con email e password (rimane valido)
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

// ✅ Login con email e password (rimane valido)
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

// ✅ Logout
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// ✅ Recupera l'utente corrente
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ✅ Invia un OTP via email
export const sendOtp = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // ❌ Non creare utente, è già registrato
      emailRedirectTo: 'https://scriptforge.it.com/verify' // 🔁 Cambia in produzione
    }
  });

  return { success: !error, error };
};

// ✅ Verifica il codice OTP ricevuto via email
export const verifyOtp = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email' // 🧾 Specifica che il token è arrivato via email
  });

  return { success: !error, data, error };
};

// Setup MFA - genera il QR Code (per app tipo Google Authenticator)
export const setupTotp = async () => {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });
  return { data, error }; // contiene: id (factorId), qr_code (URL immagine), secret
};

// Verifica il codice TOTP inserito dall’utente
export const verifyTotp = async (code: string, factorId: string) => {
  const { data, error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });
  return { data, error };
};