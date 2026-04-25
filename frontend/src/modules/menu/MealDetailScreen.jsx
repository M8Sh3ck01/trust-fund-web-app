import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChefHat, Info, ChevronDown, ChevronUp, ShoppingCart, Leaf } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useMenuStore } from '../../store/useMenuStore';
import LoadingState from '../../components/LoadingState/LoadingState';
import QuantityStepper from '../../components/QuantityStepper/QuantityStepper';
import styles from './MealDetailScreen.module.css';

export default function MealDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const getMealDetail = useMenuStore((state) => state.getMealDetail);

  // Local state for the specific meal
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Accordion state
  const [showNutrition, setShowNutrition] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  
  // Shopping state
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Fetch the meal detail on load
  useEffect(() => {
    async function loadMeal() {
      setLoading(true);
      const data = await getMealDetail(id);
      setMeal(data);
      setLoading(false);
    }
    loadMeal();
  }, [id, getMealDetail]);

  if (loading) {
    return <LoadingState message="Fetching meal details..." />;
  }

  if (!meal) {
    return (
      <div className={styles.errorContainer}>
        <h2>Meal not found</h2>
        <button onClick={() => navigate('/')}>Back to Menu</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(meal, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const formattedPrice = new Intl.NumberFormat('en-MW', {
    style: 'currency',
    currency: 'MWK',
    maximumFractionDigits: 0
  }).format(meal.price);

  return (
    <div className={styles.container}>
      {/* Immersive Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <div className={styles.headerActions}>
           <button className={styles.actionBtn}><ShoppingCart size={22} /></button>
        </div>
      </header>

      {/* Hero Visual */}
      <div className={styles.hero}>
        {meal.imageUrl ? (
          <img src={meal.imageUrl} alt={meal.name} className={styles.heroImage} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <ChefHat size={64} className={styles.placeholderIcon} />
          </div>
        )}
      </div>

      {/* Primary Content */}
      <main className={styles.content}>
        <div className={styles.mainInfo}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{meal.name}</h1>
            {meal.isVegetarian && <Leaf size={20} className={styles.vegIcon} />}
          </div>
          <p className={styles.price}>{formattedPrice}</p>
          <p className={styles.description}>{meal.description}</p>
        </div>

        {/* Collapsible Sections */}
        <div className={styles.metaSections}>
          
          {/* Nutrition Section */}
          <div className={styles.accordion}>
            <button 
              className={styles.accordionHeader} 
              onClick={() => setShowNutrition(!showNutrition)}
            >
              <div className={styles.accordionTitle}>
                <Info size={18} />
                <span>Nutrition Facts</span>
              </div>
              {showNutrition ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showNutrition && (
              <div className={styles.accordionContent}>
                <div className={styles.nutritionGrid}>
                  <div className={styles.nutriItem}>
                    <span className={styles.nutriVal}>{meal.nutrition.calories}</span>
                    <span className={styles.nutriLab}>Calories</span>
                  </div>
                  <div className={styles.nutriItem}>
                    <span className={styles.nutriVal}>{meal.nutrition.protein}</span>
                    <span className={styles.nutriLab}>Protein</span>
                  </div>
                  <div className={styles.nutriItem}>
                    <span className={styles.nutriVal}>{meal.nutrition.carbs}</span>
                    <span className={styles.nutriLab}>Carbs</span>
                  </div>
                  <div className={styles.nutriItem}>
                    <span className={styles.nutriVal}>{meal.nutrition.fat}</span>
                    <span className={styles.nutriLab}>Fat</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ingredients Section */}
          <div className={styles.accordion}>
            <button 
              className={styles.accordionHeader} 
              onClick={() => setShowIngredients(!showIngredients)}
            >
              <div className={styles.accordionTitle}>
                <ChefHat size={18} />
                <span>Ingredients</span>
              </div>
              {showIngredients ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showIngredients && (
              <div className={styles.accordionContent}>
                <ul className={styles.ingredientList}>
                  {meal.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Sticky Bottom Actions */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <QuantityStepper 
            value={quantity} 
            onChange={setQuantity} 
          />
          <button 
            className={`${styles.addBtn} ${isAdded ? styles.added : ''}`}
            onClick={handleAddToCart}
          >
            {isAdded ? '✓ Added' : `Add ${quantity} to Cart`}
            Add to Cart
          </button>
        </div>
      </footer>
    </div>
  );
}
