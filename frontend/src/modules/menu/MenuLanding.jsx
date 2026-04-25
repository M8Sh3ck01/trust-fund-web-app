import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, ArrowRight, User, ShoppingCart } from 'lucide-react';
import MealCard from '../../components/MealCard/MealCard';
import { useCartStore } from '../../store/useCartStore';
import { useUserStore } from '../../store/useUserStore';
import { useMenuStore } from '../../store/useMenuStore';
import useAuthStore from '../../store/authStore';
import LoadingState from '../../components/LoadingState/LoadingState';
import styles from './MenuLanding.module.css';

export default function MenuLanding() {
  const navigate = useNavigate();
  const totalItems = useCartStore((state) => state.getTotalItemsCount());
  const openSettings = useUserStore((state) => state.openSettings);
  const { user } = useAuthStore();
  const { meals, categories, activeCategory, fetchMenu, isLoading } = useMenuStore();

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return (
    <div className={styles.container}>

      {/* Sticky Top Action Bar */}
      <header className={styles.header}>
        <div className={styles.headerActions}>
          <div className={styles.brandContainer}>
            <h1 className={styles.brandName}>Trust Fund.</h1>
            <div className={styles.statusPill}>
              <span className={styles.statusDot} />
              <span>Open until 9:00 PM</span>
            </div>
          </div>
          <div className={styles.rightActions}>
            <button className={styles.iconBtn} onClick={() => navigate('/cart')}>
              <ShoppingCart size={30} />
              {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
            </button>
            <button className={styles.iconBtn} onClick={openSettings}>
              {user?.picture ? (
                <img src={user.picture} alt="Profile" className={styles.profileAvatar} />
              ) : (
                <User size={24} />
              )}
            </button>
          </div>
        </div>

        <div className={styles.filterScroll}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.filterChip} ${activeCategory === cat ? styles.chipActive : ''}`}
              onClick={() => fetchMenu(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div className={styles.content}>

        {isLoading ? (
          <LoadingState message="Loading today's specialties..." />
        ) : (
          <>
            {/* 2-Column Meal Grid */}
            <section className={styles.grid}>
              {meals.map((meal) => (
                <MealCard key={meal._id} {...meal} id={meal._id} status={meal.availability === 'Available' ? 'avail' : meal.availability === 'Limited' ? 'warning' : 'danger'} />
              ))}
            </section>
          </>
        )}

        {/* Event Booking Banner */}
        <div
          className={styles.eventBanner}
          onClick={() => navigate('/book')}
        >
          <div className={styles.bannerContent}>
            <CalendarDays size={20} className={styles.bannerIcon} />
            <div>
              <p className={styles.bannerTitle}>Need meals for an event?</p>
              <p className={styles.bannerSubtext}>Book in advance</p>
            </div>
          </div>
          <ArrowRight size={20} className={styles.bannerArrow} />
        </div>

      </div>
    </div>
  );
}
