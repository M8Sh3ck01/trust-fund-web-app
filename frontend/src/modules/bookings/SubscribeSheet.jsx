/**
 * @file SubscribeSheet.jsx
 * @description The 'Full' enrollment sheet for Guest -> Subscriber conversion.
 */
import { useState } from 'react';
import { Check, Repeat, Zap, ShieldCheck } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet/BottomSheet';
import { useUserStore } from '../../store/useUserStore';
import PaymentOverlay from '../checkout/PaymentOverlay';
import styles from './SubscribeSheet.module.css';

const TIERS = [
  { id: 1, months: 1, meals: 20, price: 85000, label: 'Standard' },
  { id: 2, months: 2, meals: 40, price: 160000, label: 'Popular', discount: 'Save MK 10k' },
  { id: 3, months: 3, meals: 60, price: 230000, label: 'Best Value', discount: 'Save MK 25k', highlight: true },
];

export default function SubscribeSheet({ onClose }) {
  const { activateSubscription } = useUserStore();
  const [selectedTier, setSelectedTier] = useState(TIERS[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
  };

  const handlePaymentConfirmed = async (transactionId) => {
    // This runs inside PaymentOverlay BEFORE it shows success
    await activateSubscription(selectedTier.id, transactionId);
  };

  const handleCloseOverlay = () => {
    // This runs when the user clicks 'Start Redeeming' on the success modal
    setIsProcessing(false);
    onClose();
  };

  const formatMWK = (amt) => new Intl.NumberFormat('en-MW', {
    style: 'currency', currency: 'MWK', maximumFractionDigits: 0
  }).format(amt);

  return (
    <BottomSheet 
      isOpen={true} 
      onClose={onClose} 
      title="Choose Your Plan"
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.subtitle}>Unlock daily meals, priority collection, and exclusive member savings.</p>
        </header>

        {/* Tier Cards Vertical List */}
        <div className={styles.tierList}>
          {TIERS.map((tier) => (
            <button 
              key={tier.id}
              className={`${styles.tierCard} ${selectedTier.id === tier.id ? styles.selectedCard : ''} ${tier.highlight ? styles.highlightCard : ''}`}
              onClick={() => setSelectedTier(tier)}
            >
              <div className={styles.tierHeader}>
                <div className={styles.tierTitle}>
                  <span className={styles.months}>{tier.months} {tier.months === 1 ? 'Month' : 'Months'}</span>
                  {tier.discount && <span className={styles.discountBadge}>{tier.discount}</span>}
                </div>
                {tier.label && <span className={styles.planLabel}>{tier.label}</span>}
              </div>

              <div className={styles.tierBody}>
                <div className={styles.stat}>
                  <Repeat size={14} />
                  <span>{tier.meals} Total Meals</span>
                </div>
                <div className={styles.priceContainer}>
                   <span className={styles.currency}>MK</span>
                   <span className={styles.price}>{(tier.price / 1000).toFixed(0)}K</span>
                </div>
              </div>

              {selectedTier.id === tier.id && (
                <div className={styles.checkArea}>
                  <Check size={20} color="#22c55e" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className={styles.trustGrid}>
           <div className={styles.trustItem}>
              <Zap size={16} /> <span>Instant Setup</span>
           </div>
           <div className={styles.trustItem}>
              <ShieldCheck size={16} /> <span>Secure Payment</span>
           </div>
        </div>

        {/* Action Button */}
        <button className={styles.payBtn} onClick={handlePay}>
          Subscribe & Pay {formatMWK(selectedTier.price)}
        </button>

        <p className={styles.terms}>By subscribing, you agree to the 30-day meal cycle terms. Plans do not auto-renew.</p>
      </div>

      {isProcessing && (
        <PaymentOverlay 
          total={formatMWK(selectedTier.price)}
          amount={selectedTier.price}
          onPaymentConfirmed={handlePaymentConfirmed}
          onComplete={handleCloseOverlay}
          mode="membership"
        />
      )}
    </BottomSheet>
  );
}
