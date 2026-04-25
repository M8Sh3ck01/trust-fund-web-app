/**
 * @file OrderConfirmedModal.jsx
 * @description The modal overlay (Modal 7) that sits on top of ProcessingScreen.
 * Requires user to explicitly dismiss it to navigate away.
 */
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import styles from './OrderConfirmedModal.module.css';

export default function OrderConfirmedModal({ totalPaid, order, onClose }) {
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);

  const handleGoToOrders = () => {
    clearCart();
    navigate('/orders');
  };

  const handleOrderSomethingElse = () => {
    clearCart();
    navigate('/');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        <div className={styles.iconCircle}>
          <Check size={32} className={styles.checkIcon} />
        </div>

        <h2 className={styles.title}>Payment Confirmed!</h2>
        
        <div className={styles.detailsBox}>
          <p className={styles.orderLabel}>Order #{order?.orderNumber || '...'}</p>
          <p className={styles.summaryText}>
            {order?.totalAmount ? `MK ${order.totalAmount.toLocaleString()}` : totalPaid} paid
          </p>
          <p className={styles.summaryText}>Kitchen has your order</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryBtn} onClick={handleGoToOrders}>
            View Order & QR Code <ArrowRight size={16} />
          </button>
          
          <button className={styles.secondaryBtn} onClick={handleOrderSomethingElse}>
            Order Something Else &rarr;
          </button>
        </div>

      </div>
    </div>
  );
}
