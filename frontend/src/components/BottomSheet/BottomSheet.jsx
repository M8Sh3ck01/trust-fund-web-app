/**
 * @file BottomSheet.jsx
 * @description A reusable bottom sheet component supporting standard mobile gestures/visuals.
 */
import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from './BottomSheet.module.css';

export default function BottomSheet({ isOpen, onClose, title, children, showDone = false, onDone }) {
  const contentRef = useRef(null);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.sheet} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className={styles.dragHandle} />

        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.actions}>
            {showDone ? (
              <button className={styles.doneBtn} onClick={onDone}>Done</button>
            ) : (
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={styles.content} ref={contentRef}>
          {children}
        </div>
      </div>
    </div>
  );
}
