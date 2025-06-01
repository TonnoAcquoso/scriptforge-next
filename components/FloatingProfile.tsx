// components/FloatingProfile.tsx
import { useState } from 'react';
import styles from '../styles/FloatingProfile.module.css';
import { UserCircle } from 'lucide-react';
import ProfilePanel from './ProfilePanel';

export default function FloatingProfile() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={styles.floatingButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Apri pannello profilo"
      >
        <UserCircle size={24} />
      </button>

      {isOpen && <ProfilePanel onClose={() => setIsOpen(false)} />}
    </>
  );
}