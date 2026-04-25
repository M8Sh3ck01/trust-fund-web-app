/**
 * @file FocusLayout.jsx
 * @description A maximum-focus layout used for wizards, checkout, and meal details.
 * Contains no bottom navigation to prevent distraction.
 */
import { Outlet } from 'react-router-dom';
import styles from './FocusLayout.module.css';

export default function FocusLayout() {
  return (
    <div className={styles.layout}>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
