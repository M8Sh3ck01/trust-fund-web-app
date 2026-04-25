import { useState, useEffect } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import OrderConfirmedModal from './OrderConfirmedModal';
import MemberConfirmedModal from '../bookings/MemberConfirmedModal';
import BookingActivatedModal from '../bookings/BookingActivatedModal';
import apiClient from '../../api/client';
import styles from './PaymentOverlay.module.css';

export default function PaymentOverlay({ total, amount, onComplete, onPaymentConfirmed, mode = 'order' }) {
  const [statusText, setStatusText] = useState('Initializing secure session...');
  const [phase, setPhase] = useState('processing'); // 'processing' | 'success' | 'error'
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    let isMounted = true;

    async function processPayment() {
      try {
        await new Promise(r => setTimeout(r, 800));
        if (!isMounted) return;

        setStatusText('Confirming with PayChangu...');

        const paymentRes = await apiClient.post('/api/payments/paychangu/simulate', {
          amount: amount || parseFloat(total?.replace(/[^0-9.]/g, '') || '0'),
          metadata: { mode }
        });

        if (!isMounted) return;
        setStatusText('Securing transaction...');

        let data = null;
        if (onPaymentConfirmed) {
          data = await onPaymentConfirmed(paymentRes.transactionId);
        }

        if (!isMounted) return;
        setSuccessData(data);
        setPhase('success'); // ← replaces entire processing UI
      } catch (err) {
        if (!isMounted) return;
        setPhase('error');

        const status = err.response?.status;
        if (status === 401 || status === 403) {
          setStatusText('Security session expired. Please log in again.');
        } else if (status === 402) {
          setStatusText('Payment verification failed. No funds were deducted.');
        } else if (status === 504) {
          setStatusText('PayChangu gateway timed out. Please check your banking app.');
        } else {
          setStatusText(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
        }
      }
    }

    processPayment();

    return () => {
      isMounted = false;
      document.body.style.overflow = '';
    };
  }, []);

  // ── Success: hand off entirely to the relevant confirmation modal ──
  if (phase === 'success') {
    return mode === 'membership' ? (
      <MemberConfirmedModal onClose={onComplete} />
    ) : mode === 'booking' ? (
      <BookingActivatedModal onClose={onComplete} />
    ) : (
      <OrderConfirmedModal order={successData} totalPaid={total} onClose={onComplete} />
    );
  }

  // ── Processing / Error ─────────────────────────────────────────────
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        {phase === 'error' ? (
          <>
            <div className={styles.errorIcon}>
              <AlertCircle size={28} />
            </div>
            <h2 className={styles.title}>Payment Issue</h2>
            <div className={styles.statusBox}>
              <p className={`${styles.statusText} ${styles.errorText}`}>{statusText}</p>
              <button className={styles.retryBtn} onClick={onComplete}>Close</button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.spinnerWrapper}>
              <div className={styles.spinner}></div>
              <Lock size={20} className={styles.lockIcon} />
            </div>
            <h2 className={styles.title}>Processing Payment</h2>
            <p className={styles.amount}>{total}</p>
            <div className={styles.statusBox}>
              <p className={styles.statusText}>{statusText}</p>
              <p className={styles.warningText}>Please do not close or go back.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
