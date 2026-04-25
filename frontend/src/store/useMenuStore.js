import { create } from 'zustand';
import apiClient from '../api/client';

export const useMenuStore = create((set, get) => ({
  meals: [],
  categories: ['All', 'Main', 'Vegetarian', 'Sides', 'Special'],
  activeCategory: 'All',
  isLoading: false,
  error: null,

  /**
   * fetchMenu - Hydrates the menu from the backend API.
   * Supports optional filtering by category.
   */
  fetchMenu: async (category = 'All') => {
    set({ isLoading: true, error: null, activeCategory: category });
    try {
      const url = category === 'All' ? '/api/meals' : `/api/meals?category=${category}`;
      const result = await apiClient.get(url);
      
      // The interceptor already returns result.data (which is { meals: [...] })
      set({ 
        meals: result.meals || [], 
        isLoading: false 
      });
    } catch (err) {
      console.error('Failed to fetch menu:', err);
      set({ 
        error: 'Unable to load today\'s menu. Please try again.', 
        isLoading: false 
      });
    }
  },

  /**
   * getMealById - Helper to find a meal in the local state or fetch from API if missing.
   */
  getMealDetail: async (id) => {
    // Check if we already have it in local state
    const localMeal = get().meals.find(m => m._id === id);
    if (localMeal) return localMeal;

    try {
      const result = await apiClient.get(`/api/meals/${id}`);
      return result.meal;
    } catch (err) {
      console.error('Failed to fetch meal detail:', err);
      return null;
    }
  }
}));
