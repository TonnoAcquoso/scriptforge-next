// utils/useThemeAndDraft.ts
import { useEffect, useRef } from 'react';

interface Props {
  userScript: string;
  setUserScript: (text: string) => void;
}

export default function useThemeAndDraft({ userScript, setUserScript }: Props) {
  const previousScriptRef = useRef(userScript);

  useEffect(() => {
    // 🌓 Imposta il tema dark di default al caricamento
    document.documentElement.classList.add('dark');

    // 📥 Recupera eventuale bozza salvata
    const draft = localStorage.getItem('raffina_draft');
    if (draft) {
      setUserScript(draft);
    }
  }, [setUserScript]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (previousScriptRef.current !== userScript) {
        // 💾 Salva automaticamente solo se il contenuto cambia
        localStorage.setItem('raffina_draft', userScript);
        previousScriptRef.current = userScript;
      }
    }, 3000); // ⏱️ Ogni 3 secondi

    return () => clearInterval(interval);
  }, [userScript]);
}