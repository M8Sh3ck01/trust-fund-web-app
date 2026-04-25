/**
 * @file MealPickerSheet.jsx
 * @description A specialized bottom sheet for selecting multiple meals in the booking flow.
 */
import { Search, Check, Utensils } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet/BottomSheet';
import { useMenuStore } from '../../store/useMenuStore';
import LoadingState from '../../components/LoadingState/LoadingState';
import styles from './MealPickerSheet.module.css';

export default function MealPickerSheet({ isOpen, onClose, selectedIds, onToggle }) {
  const { meals, categories, activeCategory, fetchMenu, isLoading } = useMenuStore();

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Choose Meals for Your Group"
      showDone={true}
      onDone={onClose}
    >
      <div className={styles.pickerContainer}>
        {/* Search Mock */}
        <div className={styles.searchBox}>
          <Search size={18} />
          <input type="text" placeholder="Search meals..." className={styles.searchInput} />
        </div>

        {/* Dynamic Category Chips */}
        <div className={styles.filters}>
          {categories.map(cat => (
            <span 
              key={cat}
              className={`${styles.filterChip} ${activeCategory === cat ? styles.active : ''}`}
              onClick={() => fetchMenu(cat)}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Meal List */}
        <div className={styles.mealList}>
          {isLoading ? (
            <LoadingState message="Loading menu..." />
          ) : (
            meals.map((meal) => {
              const mealId = meal._id || meal.id;
              const isSelected = selectedIds.includes(mealId);
              const formattedPrice = new Intl.NumberFormat('en-MW', {
                style: 'currency',
                currency: 'MWK',
                maximumFractionDigits: 0
              }).format(meal.price);

              return (
                <div 
                  key={mealId} 
                  className={`${styles.mealRow} ${isSelected ? styles.selectedRow : ''}`}
                  onClick={() => onToggle(mealId)}
                >
                  <div className={styles.mealInfo}>
                    <div className={styles.iconBox}>
                      <Utensils size={18} />
                    </div>
                    <div className={styles.textDetails}>
                      <div className={styles.mealName}>
                        {meal.name} {meal.isVegetarian && <span className={styles.vegMark}>🌿</span>}
                      </div>
                      <div className={styles.mealPrice}>{formattedPrice} per person</div>
                    </div>
                  </div>
                  <div className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}>
                    {isSelected && <Check size={14} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.footerInfo}>
          {selectedIds.length} meals selected
        </div>
      </div>
    </BottomSheet>
  );
}
