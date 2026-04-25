/**
 * @file BookingTracker.jsx
 * @description Full-screen detail view for a single event booking.
 * Shows live progress stepper, booking details, kitchen messages, 
 * and unlocks the Group Ownership QR when conditions are met:
 *   - status === 'Ready' AND event date === today
 */
import { Calendar, Clock, Users, Phone, ChevronDown, ChevronUp, Bell, Check, ArrowLeft, QrCode, Lock } from 'lucide-react';
import { useState } from 'react';
import { useMenuStore } from '../../store/useMenuStore';
import { useBookingStore } from '../../store/useBookingStore';
import QRCodeModal from '../orders/QRCodeModal';
import PaymentOverlay from '../checkout/PaymentOverlay';
import styles from './BookingTracker.module.css';

export default function BookingTracker({ booking, onBack }) {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isNotifyOn, setIsNotifyOn] = useState(false);
  const [showOwnershipQR, setShowOwnershipQR] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { updateBookingStatus, activateBooking } = useBookingStore();

  if (!booking) return null;
  const bookingId = booking._id || booking.id;
  const { status } = booking;


  // ── Ownership QR Unlock Logic ──────────────────────────────────────
  // QR is unlocked only when the kitchen has confirmed & meals are ready
  // AND the event day has arrived.
  const isEventToday = () => {
    try {
      const eventDate = new Date(booking.eventDate || booking.data?.date);
      const today = new Date();
      return eventDate.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  };
  const isOwnershipUnlocked = status === 'Ready' && isEventToday();

  // ── Meal & Cost Calculation ────────────────────────────────────────
  // The backend now populates selectedMeals automatically
  const selectedMeals = booking.selectedMeals || [];
  const headcount = booking.headcount || booking.data?.headcount || 1;
  const estimatedTotal = selectedMeals.reduce((acc, meal) => acc + (meal.price * headcount), 0);
  const formattedTotal = new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK', maximumFractionDigits: 0 }).format(estimatedTotal);

  // ── Progress Stepper ──────────────────────────────────────────────
  const getStepStatus = (stepIndex) => {
    const statuses = ['Requested', 'ChangesMade', 'Confirmed', 'Scheduled', 'Preparing', 'Ready', 'Collected'];
    const currentIdx = statuses.indexOf(status);
    if (currentIdx > stepIndex) return 'completed';
    if (currentIdx === stepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className={styles.screen}>

      {/* Back Navigation */}
      {onBack && (
        <div className={styles.navBar}>
          <button className={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={20} /> Events
          </button>
          <div className={`${styles.statusPill} ${styles[status]}`}>
            {status.replace(/([A-Z])/g, ' $1').trim()}
          </div>
        </div>
      )}

      {/* Title */}
      <div className={styles.titleBlock}>
        <h1 className={styles.pageTitle}>{booking.eventName || booking.data?.eventName || `Booking #${bookingId.substring(0, 6)}`}</h1>
        <span className={styles.bookingId}>#{bookingId.substring(0, 8)} · {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : booking.data?.date} at {booking.eventTime || booking.data?.time}</span>
      </div>

      {/* Progress Stepper */}
      <div className={styles.stepper}>
        <Step label="Submitted"       time="Today 10:02"                               status={getStepStatus(0)} />
        <Step label={status === 'ChangesMade' ? 'Changes Made' : 'Kitchen Review'}
              time={status !== 'Requested' ? 'Today 14:30' : null}
              status={getStepStatus(1)}
              isWarning={status === 'ChangesMade'} />
        <Step label="Confirmed"       status={getStepStatus(2)} />
        <Step label="Scheduled"       status={getStepStatus(3)} />
        <Step label="Preparing"       status={getStepStatus(4)} />
        <Step label="Ready for Group" 
              status={getStepStatus(5)} 
              isSuccess={status === 'Ready' || status === 'Collected'} />
      </div>

      {/* ChangesMade — Kitchen needs a response */}
      {status === 'ChangesMade' && (
        <div className={styles.responseBox}>
          <div className={styles.responseHeader}>
            <span className={styles.responseLabel}>⚠ Response Needed</span>
          </div>
          <p className={styles.kitchenMessage}>
            {booking.notes || "No additional comments from the kitchen."}
          </p>
          <div className={styles.responseActions}>
            <button className={styles.acceptBtn} onClick={() => updateBookingStatus(bookingId, 'Confirmed')}>
              Accept Changes ✓
            </button>
            <button className={styles.declineBtn} onClick={() => {
              if (confirm('Are you sure you want to decline this booking?')) {
                updateBookingStatus(bookingId, 'Cancelled');
              }
            }}>
              Decline Booking
            </button>
          </div>
        </div>
      )}

      {/* Confirmed but UNPAID — Show Payment Action */}
      {status === 'Confirmed' && booking.paymentStatus === 'Pending' && (
        <div className={styles.responseBox}>
          <div className={styles.responseHeader}>
            <span className={styles.responseLabel}>Activation Required</span>
          </div>
          <p className={styles.kitchenMessage}>
            Your booking has been approved by the kitchen. Please pay the estimated total to finalize the arrangement and unlock your ticket.
          </p>
          <button className={styles.acceptBtn} onClick={() => setShowPayment(true)}>
            Pay {formattedTotal} & Activate →
          </button>
        </div>
      )}

      {/* Confirmed — Notify when ready */}
      {status === 'Confirmed' && (
        <div className={styles.infoBox}>
          <div className={styles.infoInner}>
            <Bell size={20} className={styles.bellIcon} />
            <div className={styles.infoText}>
              <span className={styles.infoTitle}>Notify me when ready</span>
              <span className={styles.infoSub}>Receive a push notification</span>
            </div>
            <button
              className={`${styles.toggle} ${isNotifyOn ? styles.toggleOn : ''}`}
              onClick={() => setIsNotifyOn(!isNotifyOn)}
            >
              <div className={styles.toggleThumb} />
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Booking Details */}
      <div className={styles.detailsCard}>
        <button className={styles.detailsToggle} onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}>
          <span>Your Request Details</span>
          {isDetailsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {isDetailsExpanded && (
          <div className={styles.detailsContent}>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}><Calendar size={14} /> {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : booking.data?.date}</div>
              <div className={styles.detailItem}><Clock size={14} /> {booking.eventTime || booking.data?.time}</div>
              <div className={styles.detailItem}><Users size={14} /> {headcount} people</div>
              <div className={styles.detailItem}><Phone size={14} /> {booking.contactNumber || booking.data?.contactNumber}</div>
            </div>
            <div className={styles.mealsSummary}>
              {selectedMeals.map(meal => {
                const mealId = meal._id || meal.id;
                return (
                  <div key={mealId} className={styles.mealRow}>
                    <span>{meal.name} ×{headcount}</span>
                    <span>{new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK', maximumFractionDigits: 0 }).format(meal.price * headcount)}</span>
                  </div>
                );
              })}
              <div className={styles.totalRow}>
                <span>Est. Total</span>
                <span>{formattedTotal}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer: Ownership QR ──────────────────────────────────────── */}
      <div className={styles.footerAction}>
        {isOwnershipUnlocked ? (
          <>
            <button className={styles.qrUnlockedBtn} onClick={() => setShowOwnershipQR(true)}>
              <QrCode size={20} />
              Show Group Entry QR
            </button>
            <p className={styles.qrHint}>Present this to cafeteria staff to permit your group entry.</p>
          </>
        ) : (
          <div className={styles.lockArea}>
            <button className={styles.qrLockedBtn} disabled>
              <Lock size={16} />
              {status === 'Ready' 
                ? 'QR available from event day' 
                : status === 'Scheduled' || status === 'Preparing'
                ? 'QR available when Ready' 
                : 'QR available after Activation'}
            </button>
            {booking.paymentStatus === 'Pending' && status === 'Confirmed' && (
              <span className={styles.helpText}>Activation payment required &uarr;</span>
            )}
            {booking.paymentStatus === 'Paid' && (
              <span className={styles.helpText}>Event fully scheduled and paid ✓</span>
            )}
          </div>
        )}
      </div>

      {/* Payment Overlay for Activation */}
      {showPayment && (
        <PaymentOverlay
          total={formattedTotal}
          amount={booking.totalAmount}
          mode="booking"
          onPaymentConfirmed={(txnId) => activateBooking(bookingId, txnId)}
          onComplete={() => setShowPayment(false)}
        />
      )}

      {/* Ownership QR Modal */}
      {showOwnershipQR && (
        <QRCodeModal
          orderId={`BOOKING-${booking.id}`}
          onClose={() => setShowOwnershipQR(false)}
        />
      )}
    </div>
  );
}

function Step({ label, time, status, isWarning, isSuccess }) {
  return (
    <div className={`${styles.stepRow} ${styles[status]}`}>
      <div className={styles.stepVisual}>
        <div className={`
          ${styles.stepCircle} 
          ${isWarning ? styles.warningCircle : ''} 
          ${isSuccess ? styles.successCircle : ''}
        `}>
          {(status === 'completed' || (isSuccess && status === 'active')) && <Check size={12} />}
        </div>
        <div className={styles.line} />
      </div>
      <div className={styles.stepInfo}>
        <span className={`
          ${styles.stepLabel} 
          ${isWarning ? styles.warningText : ''} 
          ${isSuccess ? styles.successText : ''}
        `}>
          {label}
        </span>
        {time && <span className={styles.stepTime}>{time}</span>}
      </div>
    </div>
  );
}
