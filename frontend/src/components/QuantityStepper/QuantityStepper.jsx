/**
 * @file QuantityStepper.jsx
 * @description A small +/- controller for quantity selection.
 */
import { Minus, Plus } from 'lucide-react';
import styles from './QuantityStepper.module.css';

export default function QuantityStepper({ value, onChange, min = 1, max = 99 }) {
  const handleDecrement = (e) => {
    e.stopPropagation();
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.button} 
        onClick={handleDecrement}
        disabled={value <= min}
      >
        <Minus size={16} />
      </button>
      <span className={styles.value}>{value}</span>
      <button 
        className={styles.button} 
        onClick={handleIncrement}
        disabled={value >= max}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
