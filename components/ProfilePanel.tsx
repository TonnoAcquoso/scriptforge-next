import styles from '../styles/ProfilePanel.module.css';
import { X, LogOut, Clock } from 'lucide-react';
import { useUser } from './UserContext';
import { useRouter } from 'next/router';
import { signOut } from '../utils/auth';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { HTMLAttributes, useEffect, useState } from 'react';

type MotionDivProps = HTMLAttributes<HTMLDivElement> & MotionProps;

export default function ProfilePanel({ onClose }) {
  const { user } = useUser();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  

  // ✅ Tipizzazione corretta per evitare errori TS/React
  const MotionDiv = motion.div as React.FC<MotionDivProps>;

  const handleLogout = async () => {
    await signOut();
    router.push('/signup');
  };

  return (
    <div className={styles.panelOverlay} onClick={onClose}>
      <AnimatePresence mode="wait">
        <MotionDiv
          className={styles.panel}
    key="profile-panel"
    onClick={(e) => e.stopPropagation()}
    initial={{ scale: 0.95 }}
    animate={{ scale: 1 }}
    exit={{ scale: 0.95 }}
    transition={{
      duration: 0.25,
      ease: 'easeInOut',
    }}
        >
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>

          <h2 className={styles.title}>👤 Il tuo profilo</h2>

          {user ? (
            <div className={styles.infoSection}>
              <p className={styles.email}>
                Email: <strong>{user.email}</strong>
              </p>

              <button className={styles.panelButton} onClick={handleLogout}>
                <LogOut size={16} /> <span>Logout</span>
              </button>

              <button
                className={styles.panelButton}
                onClick={() => {
                  router.push('/cronologia');
                  onClose();
                }}
              >
                <Clock size={16} />
                <span>
                  Cronologia Script
                  <span className={styles.badge}>In Arrivo</span> {/* ✅ Badge */}
                </span>
              </button>
            </div>
          ) : (
            <p>Utente non autenticato.</p>
          )}
        </MotionDiv>
      </AnimatePresence>
    </div>
  );
}