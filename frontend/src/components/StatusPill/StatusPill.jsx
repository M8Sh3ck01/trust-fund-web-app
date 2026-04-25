/**
 * @file StatusPill.jsx
 * @description A reusable circular/pill status indicator for meals and orders.
 * Follows the color tokens defined in vars.css.
 */
import styles from './StatusPill.module.css';

/**
 * @param {Object} props
 * @param {'avail' | 'warning' | 'danger' | 'info'} props.status - Determines the color
 * @param {string} props.label - The text to display
 * @param {boolean} [props.minimal=false] - If true, only shows the colored dot, no text
 */
export default function StatusPill({ status, label, minimal = false }) {
  // Map status to CSS class
  const colorClass = styles[status] || styles.avail;

  if (minimal) {
    return <span className={`${styles.dot} ${colorClass}`} aria-label={label} title={label} />;
  }

  return (
    <div className={styles.pillContainer}>
      <span className={`${styles.dot} ${colorClass}`} />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
