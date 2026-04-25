import { useState } from 'react';
import { Minus, Plus, CheckCircle2, Repeat } from 'lucide-react';
import { QRCode } from 'react-qr-code';
import BottomSheet from '../../components/BottomSheet/BottomSheet';
import { useUserStore } from '../../store/useUserStore';
import { useOrderStore } from '../../store/useOrderStore';
import styles from './RedeemConfirmSheet.module.css';

export default function RedeemConfirmSheet({ meal, onClose }) {
  const { profile, fetchProfile } = useUserStore();
  const { addRedemptionOrder } = useOrderStore();
  const [quantity, setQuantity] = useState(1);
  const [isDone, setIsDone] = useState(false);
  const [order, setOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (isSubmitting) return; // Logic guard
    
    try {
      setIsSubmitting(true);
      // Create Order - Backend handles credit deduction
      const newOrder = await addRedemptionOrder(meal, quantity);
      setOrder(newOrder);
      
      // Re-fetch profile to sync the updated balance from the server
      await fetchProfile();

      // Success animation
      setIsDone(true);
    } catch (err) {
      alert('Failed to redeem meal. Please verify your balance and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <BottomSheet isOpen={true} onClose={onClose} title="Collection Ticket">
        <div className={styles.successContainer}>
          <div className={styles.qrWrapper}>
            <div className={styles.qrBox}>
              {order?.collectionToken ? (
                <QRCode 
                  value={order.collectionToken} 
                  size={160}
                  level="M"
                />
              ) : (
                <div className={styles.qrError} />
              )}
            </div>
          </div>

          <div className={styles.successInfo}>
            <h3 className={styles.orderId}>Order #{order?.orderNumber}</h3>
            <p className={styles.instructions}>Present this code at the cafeteria counter to collect your <strong>{quantity}x {meal.name}</strong>.</p>
          </div>

          <button className={styles.doneBtn} onClick={onClose}>
            Done & Go Back
          </button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet 
      isOpen={true} 
      onClose={onClose} 
      title="Confirm Redemption"
    >
      <div className={styles.container}>
        <div className={styles.mealPreview}>
          <div className={styles.imageBox}>
            {meal.imageUrl ? (
              <img src={meal.imageUrl} alt={meal.name} />
            ) : (
              <div className={styles.placeholder} />
            )}
          </div>
          <div className={styles.mealInfo}>
            <h3 className={styles.mealName}>{meal.name}</h3>
            <span className={styles.creditBadge}><Repeat size={12} /> Subscriber Plan</span>
          </div>
        </div>

        <div className={styles.quantitySection}>
          <p className={styles.label}>How many meals today?</p>
          <div className={styles.stepper}>
            <button 
              className={styles.stepperBtn} 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus size={20} />
            </button>
            <span className={styles.quantityVal}>{quantity}</span>
            <button 
              className={styles.stepperBtn} 
              onClick={() => setQuantity(quantity + 1)}
              disabled={quantity >= profile.subscriptionBalance}
            >
              <Plus size={20} />
            </button>
          </div>
          <p className={styles.balanceInfo}>
            Cost: {quantity} {quantity === 1 ? 'Credit' : 'Credits'} &bull; Balance: {profile.subscriptionBalance}
          </p>
        </div>

        <button 
          className={styles.confirmBtn}
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Confirming...' : 'Confirm Redemption'}
        </button>
      </div>
    </BottomSheet>
  );
}
