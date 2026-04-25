/**
 * @file Stepper.jsx
 * @description A minimalist progress stepper for multi-step flows.
 */
import styles from './Stepper.module.css';

export default function Stepper({ steps, currentStep }) {
  return (
    <div className={styles.stepperContainer}>
      <div className={styles.stepNodes}>
        {steps.map((_, index) => {
          const stepNum = index + 1;
          const isActive = stepNum <= currentStep;
          const isCurrent = stepNum === currentStep;
          
          return (
            <div key={index} className={styles.nodeWrapper}>
              <div 
                className={`${styles.node} ${isActive ? styles.active : ''} ${isCurrent ? styles.current : ''}`}
              />
              {index < steps.length - 1 && (
                <div className={`${styles.line} ${stepNum < currentStep ? styles.lineActive : ''}`} />
              )}
            </div>
          );
        })}
      </div>
      <div className={styles.stepLabels}>
        {steps.map((label, index) => (
          <span 
            key={index} 
            className={`${styles.label} ${(index + 1) === currentStep ? styles.labelActive : ''}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
