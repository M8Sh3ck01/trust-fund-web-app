/**
 * @file CheckoutScreen.jsx
 * @description Final review screen before payment (Screen 5).
 * Has no bottom navigation (rendered inside FocusLayout).
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useOrderStore } from '../../store/useOrderStore';
import { useUserStore } from '../../store/useUserStore';
import useAuthStore from '../../store/authStore';
import PaymentOverlay from './PaymentOverlay';
import EmptyState from '../../components/EmptyState/EmptyState';
import { ShoppingCart } from 'lucide-react';
import styles from './CheckoutScreen.module.css';

export default function CheckoutScreen() {
  const navigate = useNavigate();
  const { items, getCartTotal, subPreference, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();
  const { user, isAuthenticated } = useAuthStore();
  const { profile, preferences } = useUserStore();

  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // If cart is empty, show empty state unless we just successfully placed an order
  if (items.length === 0 && !isProcessing) {
    return (
      <EmptyState 
        icon={<ShoppingCart />}
        title="Your cart is empty"
        description="You haven't added anything to checkout yet. Return home to browse our Malawian delicacies."
        actionLabel="Return Home"
        onAction={() => navigate('/')}
      />
    );
  }

  const total = getCartTotal();
  const formattedTotal = new Intl.NumberFormat('en-MW', {
    style: 'currency', currency: 'MWK', maximumFractionDigits: 0
  }).format(total);

  // Map real user profile details
  const userDetails = {
    name: user?.name || profile.name || 'Guest User',
    contact: profile.phone || (user?.email ? user.email : 'No contact provided'),
    diet: preferences.dietary.length > 0 
      ? `🌿 ${preferences.dietary.join(', ')}` 
      : 'None specified',
    sub: subPreference === 'allow_sub' ? 'Allow substitution' : 'Remove and refund'
  };

  const handlePay = () => {
    setIsProcessing(true);
  };

  return (
    <div className={styles.container}>
      
      {/* Header - HCI Improved */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/cart')}>
          <ArrowLeft size={20} />
          <span>Back to Cart</span>
        </button>
      </header>

      {/* Progress Indicator */}
      <div className={styles.progressTracker}>
        <div className={styles.stepNodes}>
          <span className={`${styles.node} ${styles.activeNode}`}></span>
          <div className={`${styles.line} ${styles.activeLine}`}></div>
          <span className={`${styles.node} ${styles.activeNode}`}></span>
          <div className={styles.line}></div>
          <span className={styles.node}></span>
        </div>
        <div className={styles.stepLabels}>
          <span>Cart</span>
          <span className={styles.activeLabel}>Checkout</span>
          <span>Done</span>
        </div>
      </div>

      {/* Accordion: Order Summary */}
      <section className={styles.section}>
        <button 
          className={styles.accordionHeader} 
          onClick={() => setSummaryExpanded(!summaryExpanded)}
        >
          <span className={styles.accordionTitle}>
            {summaryExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            Order Summary
          </span>
        </button>
        
        {summaryExpanded && (
          <div className={styles.accordionContent}>
            {items.map(({ meal, quantity }) => (
              <div key={meal._id || meal.id} className={styles.summaryItem}>
                <span className={styles.summaryDesc}>
                  {meal.name} <span className={styles.qtyMark}>×{quantity}</span>
                </span>
                <span className={styles.summaryPrice}>
                  MK {meal.price * quantity}
                </span>
              </div>
            ))}
            
            <div className={`${styles.summaryItem} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>{formattedTotal}</span>
            </div>
            <Link to="/cart" className={styles.editLink}>Edit order &rarr;</Link>
          </div>
        )}
      </section>

      {/* Read-Only User Details */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Your Details</h3>
        </div>
        
        <div className={styles.detailsCard}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Name</span>
            <span className={styles.detailValue}>{userDetails.name}</span>
            <Lock size={14} className={styles.lockIcon} />
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Contact</span>
            <span className={styles.detailValue}>{userDetails.contact}</span>
            <Lock size={14} className={styles.lockIcon} />
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Diet</span>
            <span className={styles.detailValue}>{userDetails.diet}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Sub</span>
            <span className={styles.detailValue}>{userDetails.sub}</span>
          </div>
        </div>
      </section>

      {/* Payment Action */}
      <section className={styles.paymentSection}>
        <div className={styles.dueRow}>
          <span>Total due</span>
          <span className={styles.dueTotal}>{formattedTotal}</span>
        </div>

        <button 
          className={styles.payBtn} 
          onClick={handlePay}
          disabled={isProcessing}
        >
          {isProcessing ? 'Connecting...' : `Pay ${formattedTotal} with PayChangu`}
        </button>
        <p className={styles.secureText}>
          <Lock size={12} /> Secured by PayChangu
        </p>
      </section>

      {/* Security Overlay */}
      {isProcessing && (
        <PaymentOverlay 
          total={formattedTotal} 
          amount={total}
          onPaymentConfirmed={async (transactionId) => {
            // Persist to DB immediately upon success (don't wait for the modal click)
            try {
               const order = await addOrder(items, total, transactionId);
               clearCart();
               return order; // Return for the success modal
            } catch (err) {
               console.error("Critical: Order persistence failed after payment", err);
               throw err; // Overlay will handle showing an error state if we want
            }
          }}
          onComplete={() => {
            // Final navigation when user dismisses the success modal
            navigate('/orders');
          }} 
        />
      )}
    </div>
  );
}
