import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const RequireAuth = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    // Avoid the flicker while verifying session with the server
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the location they were trying to go to, so we can redirect them back later
    // Although in this simple implementation, we'll just send them to / after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Session is verified and user is authenticated
  return children;
};

export default RequireAuth;
