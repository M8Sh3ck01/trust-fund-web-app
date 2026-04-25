import React from 'react';
import styles from './LoadingState.module.css';

/**
 * LoadingState - A reusable, high-quality loading indicator.
 * Can be used as a full-page overlay or an inline spinner.
 */
export default function LoadingState({ message = 'Loading...', fullPage = false }) {
  const containerClass = fullPage ? styles.fullPageContainer : styles.inlineContainer;

  return (
    <div className={containerClass}>
      <div className={styles.spinnerWrapper}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
