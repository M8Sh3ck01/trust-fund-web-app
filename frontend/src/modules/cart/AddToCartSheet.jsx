/**
 * @file AddToCartSheet.jsx
 * @description Global sheet for quick quantity selection before adding to cart (Sheet 8).
 */
import { useState, useEffect } from 'react';
import { Minus, Plus, ShoppingCart, CheckCircle2 } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet/BottomSheet';
import { useCartStore } from '../../store/useCartStore';
import { useUserStore } from '../../store/useUserStore';
import styles from './AddToCartSheet.module.css';

export default function AddToCartSheet() {
  const { isAddSheetOpen, closeAddSheet, activeMeal, addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);

  // Reset quantity when sheet opens for a new meal
  useEffect(() => {
    if (isAddSheetOpen) setQuantity(1);
  }, [isAddSheetOpen, activeMeal]);

  if (!activeMeal) return null;

  const handleAdd = () => {
    addItem(activeMeal, quantity);
    closeAddSheet();
  };

  const totalPrice = activeMeal.price * quantity;
  const formattedTotal = new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency: 'MWK',
    maximumFractionDigits: 0
  }).format(totalPrice);

  return (
    <BottomSheet 
      isOpen={isAddSheetOpen} 
      onClose={closeAddSheet} 
      title="Add to Cart"
    >
      <div className={styles.container}>
        {/* Meal Preview */}
        <div className={styles.mealHeader}>
          <div className={styles.imageBox}>
             {activeMeal.imageUrl ? (
               <img src={activeMeal.imageUrl} alt={activeMeal.name} />
             ) : (
               <div className={styles.placeholder} />
             )}
          </div>
          <div className={styles.mealInfo}>
            <h3 className={styles.mealName}>{activeMeal.name}</h3>
            <p className={styles.mealPrice}>
              {new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK', maximumFractionDigits: 0 }).format(activeMeal.price)} each
            </p>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className={styles.quantitySection}>
          <p className={styles.label}>Select Quantity</p>
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
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          className={styles.addBtn} 
          onClick={handleAdd}
        >
          <ShoppingCart size={18} />
          <span>Add to Cart &bull; {formattedTotal}</span>
        </button>
      </div>
    </BottomSheet>
  );
}
