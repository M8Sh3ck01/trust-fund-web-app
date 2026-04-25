/**
 * @file BottomNav.jsx
 * @description The sticky bottom navigation bar used in the MainLayout.
 * Switches between Menu, Orders, and Bookings tabs.
 */
import { NavLink } from 'react-router-dom';
import { Utensils, ClipboardList, Repeat } from 'lucide-react';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  return (
    <nav className={styles.bottomNav}>
      <div className={styles.navContainer}>
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
        >
          <Utensils size={24} />
          <span>Menu</span>
        </NavLink>
        
        <NavLink 
          to="/orders" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
        >
          <ClipboardList size={24} />
          <span>Orders</span>
        </NavLink>
        
        <NavLink 
          to="/book" 
          className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
        >
          <Repeat size={24} />
          <span>Plans</span>
        </NavLink>
      </div>
    </nav>
  );
}
