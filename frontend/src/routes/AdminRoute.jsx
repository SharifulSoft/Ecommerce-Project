/**
 * Admin Route Guard
 * Renders the provided element only if the user is authenticated and has role 'admin'.
 * Redirects to login if not authenticated, and to home if authenticated but not admin.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from './routeConstants';
import AdminLayout from '../layouts/AdminLayout';

export const AdminRoute = ({ element: Element }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // If user exists but not admin, redirect (or could show a 403 page)
  if (!user || user.role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <AdminLayout>
      <Element />
    </AdminLayout>
  );
};

export default AdminRoute;
