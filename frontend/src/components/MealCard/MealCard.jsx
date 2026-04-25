/**
 * @file MealCard.jsx
 * @description A reusable "invisible" style card for displaying meals.
 * Maintains its own Add to Cart interaction state (Idle -> Loading -> Added).
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Lock } from 'lucide-react';
import StatusPill from '../StatusPill/StatusPill';
import { useCartStore } from '../../store/useCartStore';
import styles from './MealCard.module.css';

export default function MealCard({ 
  id, 
  name, 
  price, 
  status, 
  isVegetarian, 
  imageUrl 
}) {
  const navigate = useNavigate();
  const openAddSheet = useCartStore((state) => state.openAddSheet);

  const isUnavailable = status === 'danger';

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isUnavailable) return;
    openAddSheet({ id, name, price, status, isVegetarian, imageUrl });
  };

  // Format price
  const formattedPrice = new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency: 'MWK',
    maximumFractionDigits: 0
  }).format(price);

  return (
    <div 
      className={`${styles.card} ${isUnavailable ? styles.unavailable : ''}`}
      onClick={() => {
        if (!isUnavailable) {
          navigate(`/meal/${id}`);
        }
      }}
    >
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className={styles.image} />
        ) : (
           <div className={styles.imagePlaceholder} />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{name}</h3>
          {isVegetarian && <Leaf size={14} className={styles.vegIcon} />}
        </div>
        
        <div className={styles.meta}>
          <span className={styles.price}>{formattedPrice}</span>
          <StatusPill 
            status={status} 
            label={status === 'avail' ? 'Avail.' : status === 'warning' ? 'Almost' : 'Stock'} 
          />
        </div>

        <button 
          className={`${styles.addButton} ${isUnavailable ? styles.btnDisabled : ''}`}
          onClick={handleAdd}
          disabled={isUnavailable}
        >
          {isUnavailable ? (
            <span className={styles.btnContent}><Lock size={14} /> Unavailable</span>
          ) : (
            '+ Add'
          )}
        </button>
      </div>
    </div>
  );
}
