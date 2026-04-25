/**
 * @file BookingWizard.jsx
 * @description The 3-step wizard for advance meal ordering.
 * Handles the logic for switching between Steps 1, 2, and 3.
 */
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Users, Phone, Info, Check } from 'lucide-react';
import { useBookingStore } from '../../store/useBookingStore';
import { useUserStore } from '../../store/useUserStore';
import { useMenuStore } from '../../store/useMenuStore';
import Stepper from '../../components/Stepper/Stepper';
import MealPickerSheet from './MealPickerSheet';
import LoadingState from '../../components/LoadingState/LoadingState';
import styles from './BookingWizard.module.css';

export default function BookingWizard({ onExit }) {
  const { wizardStep, setStep, draft, updateDraft, toggleMealSelection } = useBookingStore();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const steps = ['Details', 'Meals', 'Confirm'];
  const handleBack = () => wizardStep > 1 ? setStep(wizardStep - 1) : onExit?.();

  return (
    <div className={styles.container}>
      {/* Header - HCI Improved */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeft size={20} />
          <span>{wizardStep > 1 ? 'Back' : 'Exit'}</span>
        </button>
        <span className={styles.stepIndicator}>Step {wizardStep} of 3</span>
      </header>

      <main className={styles.content}>
        <Stepper steps={steps} currentStep={wizardStep} />

        {wizardStep === 1 && <Step1Details />}
        {wizardStep === 2 && (
          <Step2Meals onOpenPicker={() => setIsPickerOpen(true)} />
        )}
        {wizardStep === 3 && <Step3Confirm onDone={onExit} />}

        <MealPickerSheet
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          selectedIds={draft.selectedMealIds}
          onToggle={toggleMealSelection}
        />
      </main>
    </div>
  );
}

/**
 * Step 1: Booking Details
 */
function Step1Details() {
  const { draft, updateDraft, setStep } = useBookingStore();
  const preferences = useUserStore((state) => state.preferences);

  // Pre-fill from profile only ONCE on mount if the draft is still at default
  useEffect(() => {
    if (draft.dietaryPreference === 'No Preference' && preferences.dietary.length > 0) {
      updateDraft({ dietaryPreference: preferences.dietary.join(', ') });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.dietary]); // Only watch preferences for the initial sync

  const handleNext = (e) => {
    e.preventDefault();
    if (isInvalid) return; // Guard for button-bypassers
    setStep(2);
  };

  const bookingDate = new Date(draft.date);
  const now = new Date();
  const minAdvanceTime = 48 * 60 * 60 * 1000;

  const isDateInvalid = draft.date && (bookingDate.getTime() < now.getTime() + minAdvanceTime);
  const isHeadcountInvalid = draft.headcount < 5;
  const isInvalid = !draft.date || !draft.time || !draft.contactNumber || isDateInvalid || isHeadcountInvalid;

  // Calculate min date string for the input (now + 48h)
  const minDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <form className={styles.form} onSubmit={handleNext}>
      <h2 className={styles.formTitle}>Booking Details</h2>

      {/* Date & Time Row */}
      <div className={styles.formGroup}>
        <label>When is your event?</label>
        <div className={styles.inputRow}>
          <div className={styles.inputIconWrapper}>
            <Calendar size={18} className={styles.inputIcon} />
            <input
              type="date"
              value={draft.date}
              onChange={(e) => updateDraft({ date: e.target.value })}
              min={minDate}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.inputIconWrapper}>
            <Clock size={18} className={styles.inputIcon} />
            <input
              type="time"
              value={draft.time}
              onChange={(e) => updateDraft({ time: e.target.value })}
              className={styles.input}
              required
            />
          </div>
        </div>
      </div>

      {/* Headcount */}
      <div className={styles.formGroup}>
        <label>How many people?</label>
        <div className={styles.headcountControl}>
          <Users size={18} className={styles.fieldIcon} />
          <input
            type="number"
            min="5"
            max="200"
            value={draft.headcount}
            onChange={(e) => {
              const val = e.target.value;
              updateDraft({ headcount: val === '' ? '' : parseInt(val) });
            }}
            className={`${styles.input} ${draft.headcount !== '' && draft.headcount < 5 ? styles.inputError : ''}`}
          />
        </div>
        {draft.headcount < 5 && (
          <span className={styles.errorHint}>Event bookings require min. 5 people.</span>
        )}
      </div>

      {/* Event Name */}
      <div className={styles.formGroup}>
        <label>Event name (optional)</label>
        <input
          type="text"
          placeholder="e.g. CS Department Meeting"
          value={draft.eventName}
          onChange={(e) => updateDraft({ eventName: e.target.value })}
          className={styles.input}
        />
      </div>

      {/* Contact Number */}
      <div className={styles.formGroup}>
        <label>Your contact number</label>
        <div className={styles.inputIconWrapper}>
          <Phone size={18} className={styles.inputIcon} />
          <input
            type="tel"
            placeholder="0999 123 456"
            value={draft.contactNumber}
            onChange={(e) => updateDraft({ contactNumber: e.target.value })}
            className={styles.input}
            required
          />
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className={styles.formGroup}>
        <label>Dietary preferences</label>
        <div className={styles.chipGroup}>
          {['Vegetarian', 'No Preference', 'Special Diet'].map((pref) => (
            <button
              key={pref}
              type="button"
              className={`${styles.chip} ${draft.dietaryPreference === pref ? styles.chipActive : ''}`}
              onClick={() => updateDraft({ dietaryPreference: pref })}
            >
              {pref}
            </button>
          ))}
        </div>
        <div className={styles.infoBox}>
          <Info size={14} />
          <span>Kitchen will do their best to accommodate dietary requests.</span>
        </div>
      </div>

      <button
        type="submit"
        className={styles.nextBtn}
        disabled={isInvalid}
      >
        {isInvalid ? 'Please check details...' : 'Next: Select Meals \u2192'}
      </button>
    </form>
  );
}

/**
 * Step 2: Meal Selection
 */
function Step2Meals({ onOpenPicker }) {
  const { draft, setStep } = useBookingStore();
  const { meals } = useMenuStore();

  // Get selected meal objects from dynamic store
  const selectedMeals = meals.filter(m => draft.selectedMealIds.includes(m._id || m.id));

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.formTitle}>Select Meals</h2>
      <p className={styles.stepSubTitle}>What should we prepare for your group?</p>

      <button className={styles.pickerTrigger} onClick={onOpenPicker}>
        <span>🍽</span> Select Meals &rarr;
      </button>

      {selectedMeals.length > 0 && (
        <div className={styles.selectedSection}>
          <h3 className={styles.sectionTitle}>Selected</h3>
          <div className={styles.selectedList}>
            {selectedMeals.map((meal) => {
              const mealId = meal._id || meal.id;
              return (
                <div key={mealId} className={styles.selectedMealItem}>
                  <Check size={16} className={styles.checkIcon} />
                  <div className={styles.selectedMealInfo}>
                    <div className={styles.selectedMealName}>{meal.name}</div>
                    <div className={styles.selectedMealPrice}>
                      {new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK', maximumFractionDigits: 0 }).format(meal.price)} per person
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.stepInfo}>
        <Info size={14} />
        <span>Kitchen will confirm if all selected meals can be prepared on your chosen date.</span>
      </div>

      <button
        className={styles.nextBtn}
        disabled={selectedMeals.length === 0}
        onClick={() => setStep(3)}
      >
        Next: Confirm &rarr;
      </button>
    </div>
  );
}

/**
 * Step 3: Confirm Booking
 */
function Step3Confirm({ onDone }) {
  const { draft, updateDraft, submitBooking, setStep } = useBookingStore();
  const { meals } = useMenuStore();

  const selectedMeals = meals.filter(m => draft.selectedMealIds.includes(m._id || m.id));
  const estimatedTotal = selectedMeals.reduce((acc, meal) => acc + (meal.price * draft.headcount), 0);

  const handleSubmit = () => {
    submitBooking();
    onDone?.(); // Return to the booking list after submission
  };

  const formattedTotal = new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency: 'MWK',
    maximumFractionDigits: 0
  }).format(estimatedTotal);

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.formTitle}>Confirm Booking</h2>

      <div className={styles.reviewCard}>
        <div className={styles.reviewSection}>
          <h3 className={styles.sectionTitle}>Event Details</h3>
          <div className={styles.reviewGrid}>
            <div className={styles.reviewItem}>
              <Calendar size={16} />
              <span>{new Date(draft.date).toLocaleDateString('en-GB', { dateStyle: 'full' })}</span>
            </div>
            <div className={styles.reviewItem}>
              <Clock size={16} />
              <span>{draft.time}</span>
            </div>
            <div className={styles.reviewItem}>
              <Users size={16} />
              <span>{draft.headcount} people</span>
            </div>
            {draft.eventName && (
              <div className={styles.reviewItem}>
                <span>🏢 {draft.eventName}</span>
              </div>
            )}
            <div className={styles.reviewItem}>
              <Phone size={16} />
              <span>{draft.contactNumber}</span>
            </div>
          </div>
        </div>

        <div className={styles.reviewSection}>
          <h3 className={styles.sectionTitle}>Selected Meals</h3>
          <div className={styles.reviewMeals}>
            {selectedMeals.map(meal => {
              const mealId = meal._id || meal.id;
              return (
                <div key={mealId} className={styles.reviewMealItem}>
                  <span className={styles.mealName}>{meal.name} ×{draft.headcount}</span>
                  <span className={styles.mealPrice}>
                    {new Intl.NumberFormat('en-MW', { style: 'currency', currency: 'MWK', maximumFractionDigits: 0 }).format(meal.price * draft.headcount)}
                  </span>
                </div>
              );
            })}
            <div className={styles.totalRow}>
              <span>Est. Total</span>
              <span>{formattedTotal}</span>
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Note to kitchen (optional)</label>
          <textarea
            className={styles.textarea}
            placeholder="e.g. 'Please ensure all meals are vegetarian.'"
            value={draft.note}
            onChange={(e) => updateDraft({ note: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.infoBox}>
        <Info size={14} />
        <span>This is a request. Kitchen will confirm or respond with any changes needed.</span>
      </div>

      <button className={styles.submitBtn} onClick={handleSubmit}>
        Submit Booking Request
      </button>

      <button className={styles.editBtn} onClick={() => setStep(1)}>
        Edit Booking Details
      </button>
    </div>
  );
}
