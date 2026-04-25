/**
 * @file MainLayout.jsx
 * @description The primary layout for landing screens (Menu, Orders, Book).
 * Includes an Outlet for content and the persistent Bottom Navigation.
 */
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  return (
    <div className={styles.layout}>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
