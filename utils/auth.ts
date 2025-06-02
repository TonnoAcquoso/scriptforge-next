// utils/auth.ts
import { supabase } from './supabaseClient';

// ✅ Signup con email e password
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error('🛑 Errore signUp Supabase:', error.message);
    return { data: null, error };
  }

  // ❗ Controllo se l’utente è nullo o ha ID non valido
  if (!data?.user || data.user.id === '00000000-0000-0000-0000-000000000000') {
    console.error('❌ ID utente non valido o mancante:', data);
    return { data: null, error: new Error('ID utente non valido') };
  }

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

export const verifyTotp = async (code: string, factorId: string) => {
  // 1. Crea una challenge
  const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });

  if (challengeError || !challengeData?.id) {
    return { data: null, error: challengeError || new Error('Impossibile creare la challenge MFA.') };
  }

  // 2. Verifica il codice TOTP con challengeId
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challengeData.id,
    code,
  });

  return { data, error };
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