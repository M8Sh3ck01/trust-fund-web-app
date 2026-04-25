import React from 'react';
import styles from './EmptyState.module.css';

/**
 * EmptyState Component
 * @param {ReactNode} icon - A Lucide-react icon component
 * @param {string} title - The main heading
 * @param {string} description - The sub-text description
 * @param {string} actionLabel - Text for the primary button
 * @param {function} onAction - Click handler for the primary button
 */
export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        {icon && React.isValidElement(icon) ? (
          React.cloneElement(icon, { size: 64, className: styles.icon })
        ) : (
          icon
        )}
      </div>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      
      {actionLabel && onAction && (
        <button className={styles.actionBtn} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
