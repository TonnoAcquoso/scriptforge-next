// components/Navbar.tsx
'use client'; // Se usi app directory di Next.js
import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Navbar.module.css';
import Link from 'next/link';

import { useRouter } from 'next/router'; // 🔁 Navigazione tra pagine

// 🎨 Icone Lucide
import { Menu, X, Info, Wand2, Sun, Moon } from 'lucide-react';

// 🎬 Motion per animazioni
import { motion, AnimatePresence } from 'framer-motion';

// 📲 Gesture mobile (swipe per chiudere)
import { useSwipeable } from 'react-swipeable';

export default function Navbar({ onToggleGuide, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showGuide, setShowGuide] = useState(false);
    const [openGeneral, setOpenGeneral] = useState(false);
    const [openSelect, setOpenSelect] = useState(false);
    const [isScrollingDown, setIsScrollingDown] = useState(false);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const guideRef = useRef(null);
    const router = useRouter();
    // 🌗 Stato del tema (light o dark)
    const [theme, setTheme] = useState<"light" | "dark">("light");

useEffect(() => {
  console.log("📂 Stato menuOpen:", menuOpen);
}, [menuOpen]);

// ✅ Chiude il menu SOLO se clicchi fuori sia dal menu che dal bottone
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

// 🌗 Gestione tema
useEffect(() => {
  const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

  setTheme(initialTheme);
  document.documentElement.setAttribute("data-theme", initialTheme);
}, []);

const toggleTheme = () => {
  const nextTheme = theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem("theme", nextTheme);
};


// 🧠 Recupera il tema iniziale da localStorage o dal sistema operativo
useEffect(() => {
  const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

  setTheme(initialTheme);
  document.documentElement.setAttribute("data-theme", initialTheme);
}, []);


// Gestisce la direzione dello scroll per far scomparire/riapparire i pulsanti su mobile
useEffect(() => {
  if (typeof window === 'undefined') return;
  const handleScroll = () => {
    const currentScroll = window.scrollY;
    if (currentScroll > lastScrollTop) {
      setIsScrollingDown(true); // Scorrimento verso il basso
    } else {
      setIsScrollingDown(false); // Scorrimento verso l’alto
    }
    setLastScrollTop(currentScroll);
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [lastScrollTop]);

// Nasconde il menu su mobile se si scorre troppo in basso
useEffect(() => {
  const isMobile = window.innerWidth <= 768;
  if (!isMobile) return;

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const shouldShow = scrollTop < 100;
    const menu = document.querySelector('.menuContainer') as HTMLElement;
    if (menu) {
      menu.style.opacity = shouldShow ? '1' : '0';
      menu.style.transition = 'opacity 0.5s ease';
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

  // ✅ Chiudi il menu cliccando fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🎯 Inizializza le gesture di swipe su dispositivi mobili
  const swipeHandlers = useSwipeable({
    onSwipedDown: () => setShowGuide(false), // 🔽 Chiude la guida con swipe verso il basso
    delta: 300,                               // 📏 Soglia minima in pixel per riconoscere lo swipe
    preventScrollOnSwipe: true,             // 🔒 Blocca lo scroll del browser durante lo swipe
    trackTouch: true,                       // 📱 Attiva il tracking degli eventi touch
  });
  
  // 🚫 Blocca lo scroll del body quando la guida è visibile
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
  
    if (showGuide) {
      if (isMobile) {
        // 🔒 Blocca scroll solo su mobile
        document.body.style.overflow = 'hidden';
      } else {
        // 🔓 Sblocca scroll su desktop
        document.body.style.overflow = 'auto';
      }
    } else {
      // Ripristina sempre scroll normale quando guida chiusa
      document.body.style.overflow = '';
    }
  
    return () => {
      document.body.style.overflow = '';
    };
  }, [showGuide]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        guideRef.current &&
        !guideRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false); // ✅ Chiude solo il menu
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
      <nav className={styles.navbar}>
      {/* 📂 Menu popup al posto del titolo "ScriptForge AI", visibile solo su desktop */}
            <div className={`${styles.menuContainer} ${styles.desktopOnly}`}>
              <button
                className={styles.menuButton}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Apri menu"
                ref={buttonRef} // 🆕 IMPORTANTE
              >
                <Menu size={24} />
              </button>

              
                {menuOpen && ( 
                  <div ref={menuRef} className={styles.dropdown}>
                  <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/raffina">Raffina uno Script</a></li>
                    <li><a href="/analisiscript">Analisi</a></li>
                    <li><a href="/about">About</a></li>
                    {/* 🌗 Cambio tema con icona dinamica */}
                    <li onClick={toggleTheme} className={styles.themeToggle}>
                      {theme === "dark" ? (<><Sun size={16} style={{ marginRight: "8px" }} />Tema Chiaro</>) : 
                          (<><Moon size={16} style={{ marginRight: "8px" }} />Tema Scuro</>)}</li>
                  </ul>
                </div>
              )}
            </div>

            {/* ✅ Desktop buttons */}
      <div className={styles.navRight}>
        <Link href="/raffina" className={styles.navLink}>Raffina uno Script</Link>
        <Link href="/Hero" className={styles.navButton}>Scopri ScriptForge</Link>
      </div>

      {/* ✅ Mobile buttons dropdown */}
      <div className={styles.mobileMenuWrapper}>
        <button
          className={styles.mobileMenuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Apri menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              ref={menuRef}
              className={styles.mobileDropdown}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >

              <button 
                onClick={toggleTheme}
                className={styles.mobileButton} >
                {theme === "dark" ? ( <><Sun size={16} style={{ marginRight: "8px" }} /> Tema Chiaro</>) : 
                  (<><Moon size={16} style={{ marginRight: "8px" }} />Tema Scuro</>)}
              </button>

              <button
                className={styles.mobileButton}
                onClick={() => {setMenuOpen(false);router.push('/raffina');}}>
                  <Wand2 size={18} />Raffina uno Script
              </button>

              <button
                className={styles.mobileButton}
                onClick={() => {setMenuOpen(false); router.push('/Hero');}}>
                <Info size={18} /> Scopri ScriptForge
              </button>

            </motion.div>
          )}
        </AnimatePresence>
      </div> </nav>
  )
}
