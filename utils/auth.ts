// utils/auth.ts
import { supabase } from './supabaseClient';

// ✅ Signup con email e password
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

// ✅ Login con email e password
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
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// ✅ Invia OTP via email (non più usato se si usa TOTP)
export const sendOtp = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: 'https://scriptforge.it.com/verify' // ✅ Dominio corretto
    }
  });
  return { success: !error, error };
};

// ✅ Verifica OTP via email
export const verifyOtp = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
  return { success: !error, data, error };
};

// ✅ Setup TOTP: genera QR code e secret per Google Authenticator
export const setupTotp = async () => {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });
  return { data, error }; // data.totp.qr_code, data.id
};

// ✅ Verifica TOTP dopo che l’utente ha inserito il codice dall’app
export const verifyTotp = async (factorId: string, code: string) => {
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) return { error: challengeError };

  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });

  

  return { error };
};
// ✅ Lista dei fattori MFA abilitati per l'utente (utile per sapere se è già registrato)
export const getTotpFactors = async () => {
  const { data, error } = await supabase.auth.mfa.listFactors();
  return { data, error };
};

export const isEmailRegistered = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle();

  if (error) {
    console.error('Errore durante il check email:', error);
    return false; // fallback sicuro
  }

  return !!data;
};