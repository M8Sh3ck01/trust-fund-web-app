/**
 * @file AccountSettingsSheet.jsx
 * @description The global profile and settings sheet (Sheet 9).
 */
import { User, Phone, LogOut, Award, Check } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet/BottomSheet';
import { useUserStore } from '../../store/useUserStore';
import useAuthStore from '../../store/authStore';
import styles from './AccountSettingsSheet.module.css';

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'No Beef', 'No Pork', 'No Seafood', 'Gluten Free'
];

export default function AccountSettingsSheet() {
  const {
    isSettingsOpen,
    closeSettings,
    profile,
    preferences,
    updateProfile,
    toggleDietaryPreference
  } = useUserStore();

  const { user, logout, isAuthenticated } = useAuthStore();

  return (
    <BottomSheet
      isOpen={isSettingsOpen}
      onClose={closeSettings}
      title="Account Settings"
    >
      <div className={styles.container}>

        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {user?.picture ? (
              <img src={user.picture} alt="Avatar" className={styles.avatarImg} />
            ) : (
              <User size={32} />
            )}
          </div>
          <div className={styles.profileInfo}>
            {isAuthenticated ? (
              <>
                <h3 className={styles.name}>{user?.name || profile.name}</h3>
                {user?.email && <p className={styles.email}>{user.email}</p>}

              </>
            ) : (
              <>
                <h3 className={styles.name}>Welcome, Guest</h3>
                <p className={styles.email}>Sign in to save your preferences</p>
              </>
            )}
          </div>
        </div>



        {/* Dietary Preferences Section */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Dietary Preferences</h4>
          <p className={styles.sectionSub}>We'll use these to filter the menu and pre-fill your bookings.</p>
          <div className={styles.dietaryGrid}>
            {DIETARY_OPTIONS.map((tag) => {
              const isActive = preferences.dietary.includes(tag);
              return (
                <button
                  key={tag}
                  className={`${styles.dietChip} ${isActive ? styles.chipActive : ''}`}
                  onClick={() => toggleDietaryPreference(tag)}
                >
                  {isActive && <Check size={14} />}
                  {tag}
                </button>
              );
            })}
          </div>
        </section>

        {/* Contact Info Section */}
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Contact Information</h4>
          <div className={styles.inputGroup}>
            <Phone size={18} />
            <input
              type="tel"
              placeholder="Your phone number"
              value={profile.phone}
              onChange={(e) => updateProfile({ phone: e.target.value })}
              className={styles.input}
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className={styles.actions}>
          {isAuthenticated && user?.role === 'admin' && (
            <button 
              className={styles.staffBtn} 
              onClick={() => {
                closeSettings();
                window.location.href = '/staff';
              }}
            >
              <Award size={18} />
              Staff Operations Hub
            </button>
          )}

          {isAuthenticated ? (
            <button className={styles.logoutBtn} onClick={() => logout()}>
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <button
              className={styles.loginBtn}
              onClick={() => window.location.href = '/login'}
            >
              Sign In to Trust Fund
            </button>
          )}
          <p className={styles.version}>Trust Fund App v1.0.4</p>
        </div>

      </div>
    </BottomSheet>
  );
}
