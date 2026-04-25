import { Routes, Route, Link } from 'react-router-dom';
import MainLayout from './modules/layout/MainLayout';
import FocusLayout from './modules/layout/FocusLayout';
import MenuLanding from './modules/menu/MenuLanding';
import CartScreen from './modules/cart/CartScreen';
import CheckoutScreen from './modules/checkout/CheckoutScreen';
import OrdersScreen from './modules/orders/OrdersScreen';
import MealDetailScreen from './modules/menu/MealDetailScreen';
import PlansScreen from './modules/bookings/PlansScreen';
import AccountSettingsSheet from './modules/profile/AccountSettingsSheet';
import AddToCartSheet from './modules/cart/AddToCartSheet';
import RequireAuth from './components/RequireAuth';
import LoginScreen from './modules/auth/LoginScreen';
import StaffHub from './modules/staff/StaffHub';
import useAuthStore from './store/authStore';
import { useUserStore } from './store/useUserStore';
import { useEffect } from 'react';


// Removed Home Placeholder

function App() {
  const { checkSession, isLoading } = useAuthStore();
  const { fetchProfile } = useUserStore();

  useEffect(() => {
    checkSession().then(() => {
      fetchProfile();
    });
  }, [checkSession, fetchProfile]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />

        {/* Routes that need the bottom navigation */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<RequireAuth><MenuLanding /></RequireAuth>} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/orders" element={<RequireAuth><OrdersScreen /></RequireAuth>} />
          <Route path="/book" element={<RequireAuth><PlansScreen /></RequireAuth>} />
        </Route>

        {/* Routes that need maximum focus (no nav) */}
        <Route element={<FocusLayout />}>
          <Route path="/checkout" element={<RequireAuth><CheckoutScreen /></RequireAuth>} />
          <Route path="/meal/:id" element={<MealDetailScreen />} />
          <Route path="/staff" element={<RequireAuth><StaffHub /></RequireAuth>} />
        </Route>
      </Routes>
      <AccountSettingsSheet />
      <AddToCartSheet />
    </>
  );
}

export default App;
