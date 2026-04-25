import { CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import styles from './MemberConfirmedModal.module.css'; // Reusing similar styles for consistency

export default function BookingActivatedModal({ onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.successIcon}>
          <CheckCircle size={48} />
        </div>
        
        <h2 className={styles.title}>Booking Activated!</h2>
        <p className={styles.message}>
          Your request has been fully arranged and scheduled. You can now view your collection ticket on the event day.
        </p>

        <div className={styles.nextSteps}>
          <div className={styles.step}>
            <Calendar size={18} />
            <span>Added to Scheduled Events</span>
          </div>
        </div>

        <button className={styles.doneBtn} onClick={onClose}>
          Great, Thanks! <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
