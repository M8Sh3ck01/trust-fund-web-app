/**
 * @file MemberConfirmedModal.jsx
 * @description The success screen (Modal 13) for new subscribers.
 */
import { Check, Repeat, ArrowRight } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import styles from './MemberConfirmedModal.module.css';

export default function MemberConfirmedModal({ onClose }) {
  const { profile } = useUserStore();
  const { currentPlan } = profile;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        <div className={styles.iconCircle}>
           <Check size={32} color="#fff" strokeWidth={3} />
        </div>

        <div className={styles.content}>
           <h2 className={styles.title}>Welcome to the Club!</h2>
           <p className={styles.subtitle}>You are now a Trust Fund subscriber.</p>

           <div className={styles.planCard}>
              <div className={styles.row}>
                 <span className={styles.label}>Active Plan</span>
                 <span className={styles.value}>{currentPlan?.months} Months</span>
              </div>
              <div className={styles.row}>
                 <span className={styles.label}>Voucher Balance</span>
                 <div className={styles.credits}>
                   <Repeat size={14} />
                   <span>{profile.subscriptionBalance} Meals Added</span>
                 </div>
              </div>
           </div>

           <p className={styles.infoText}>
              Your dashboard is now unlocked. You can redeem one or more meals instantly from the "Daily Plan" tab.
           </p>
        </div>

        <button className={styles.ctaBtn} onClick={onClose}>
           Start Redeeming <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
