/**
 * @file CartScreen.jsx
 * @description The Cart view (Screen 4). Lists added items, steppers to adjust
 * quantity, and substitution preferences.
 */
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Leaf, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import QuantityStepper from '../../components/QuantityStepper/QuantityStepper';
import EmptyState from '../../components/EmptyState/EmptyState';
import styles from './CartScreen.module.css';

export default function CartScreen() {
  const navigate = useNavigate();
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    subPreference, 
    setSubPreference,
    getCartTotal 
  } = useCartStore();

  const total = getCartTotal();

  // Price formatter
  const formatPrice = (price) => new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency: 'MWK',
    maximumFractionDigits: 0
  }).format(price);

  // Empty State
  if (items.length === 0) {
    return (
      <EmptyState 
        icon={<ShoppingCart />}
        title="Your cart is empty"
        description="Looks like you haven't added any meals yet. Browse our menu to find something delicious!"
        actionLabel="Browse Menu"
        onAction={() => navigate('/')}
      />
    );
  }

  // Count veg items
  const vegCount = items.filter(i => i.meal.isVegetarian).reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className={styles.container}>
      {/* Header - HCI Improved */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          <span>Keep Browsing</span>
        </button>
        <button className={styles.clearBtn} onClick={clearCart}>
          Clear All
        </button>
      </header>
      
      {/* Progress Tracker — Step 1 of 3 */}
      <div className={styles.progressTracker}>
        <div className={styles.stepNodes}>
          <span className={`${styles.node} ${styles.activeNode}`}></span>
          <div className={styles.line}></div>
          <span className={styles.node}></span>
          <div className={styles.line}></div>
          <span className={styles.node}></span>
        </div>
        <div className={styles.stepLabels}>
          <span className={styles.activeLabel}>Cart</span>
          <span>Checkout</span>
          <span>Done</span>
        </div>
      </div>

      <h1 className={styles.pageTitle}>Your Cart ({items.length})</h1>

      {/* Cart Items List */}
      <section className={styles.itemList}>
        {items.map(({ meal, quantity }) => (
          <div key={meal.id} className={styles.cartRow}>
            <div className={styles.itemInfo}>
              <div className={styles.itemNameWrapper}>
                <span className={styles.itemName}>{meal.name}</span>
                {meal.isVegetarian && <Leaf size={14} className={styles.vegIcon} />}
              </div>
              <span className={styles.itemPrice}>{formatPrice(meal.price)}</span>
            </div>
            
            <div className={styles.itemActions}>
              <QuantityStepper 
                value={quantity} 
                onChange={(newQty) => updateQuantity(meal.id, newQty)} 
              />
              <button className={styles.deleteBtn} onClick={() => removeItem(meal.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Substitution Preference Component */}
      <section className={styles.preferenceSection}>
        <p className={styles.prefLabel}>If a meal becomes unavailable:</p>
        <label className={styles.radioRow}>
          <input 
            type="radio" 
            name="subPref" 
            value="allow_sub"
            checked={subPreference === 'allow_sub'}
            onChange={(e) => setSubPreference(e.target.value)}
          />
          <span>Allow equal-value substitute</span>
        </label>
        <label className={styles.radioRow}>
          <input 
            type="radio" 
            name="subPref" 
            value="refund"
            checked={subPreference === 'refund'}
            onChange={(e) => setSubPreference(e.target.value)}
          />
          <span>Remove and refund</span>
        </label>
      </section>

      {/* Diet Summary */}
      {vegCount > 0 && (
        <div className={styles.dietSummary}>
          <Leaf size={16} className={styles.vegIcon} />
          <span>Vegetarian items: {vegCount}</span>
        </div>
      )}

      {/* Totals Section */}
      <section className={styles.totalsSection}>
        <div className={styles.totalRow}>
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </section>

      {/* Checkout Button */}
      <button 
        className={styles.checkoutBtn} 
        onClick={() => navigate('/checkout')}
      >
        Proceed to Checkout &rarr;
      </button>

    </div>
  );
}
