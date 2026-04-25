/**
 * @file useCartStore.js
 * @description Global Zustand store tracking shopping cart state across the app.
 */
import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [], // Array of { meal, quantity }
  subPreference: 'allow_sub', // 'allow_sub' | 'refund'

  // UI State for Sheet 8
  isAddSheetOpen: false,
  activeMeal: null,
  
  openAddSheet: (meal) => set({ isAddSheetOpen: true, activeMeal: meal }),
  closeAddSheet: () => set({ isAddSheetOpen: false, activeMeal: null }),
  
  addItem: (meal, quantity = 1) => set((state) => {
    const mealId = meal._id || meal.id;
    const existingItem = state.items.find(item => (item.meal._id || item.meal.id) === mealId);
    if (existingItem) {
      return {
        items: state.items.map(item => 
          (item.meal._id || item.meal.id) === mealId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      };
    }
    return { items: [...state.items, { meal, quantity }] };
  }),

  updateQuantity: (id, newQuantity) => set((state) => {
    if (newQuantity <= 0) {
      return { items: state.items.filter(i => (i.meal._id || i.meal.id) !== id) };
    }
    return {
      items: state.items.map(item =>
        (item.meal._id || item.meal.id) === id ? { ...item, quantity: newQuantity } : item
      )
    };
  }),

  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => (i.meal._id || i.meal.id) !== id)
  })),

  clearCart: () => set({ items: [] }),

  setSubPreference: (pref) => set({ subPreference: pref }),

  // Derived state getters 
  getCartTotal: () => {
    return get().items.reduce((total, item) => total + (item.meal.price * item.quantity), 0);
  },

  getTotalItemsCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  }
}));
