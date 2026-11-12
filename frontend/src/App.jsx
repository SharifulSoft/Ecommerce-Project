import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import CategoryNavbar from './components/CategoryNavbar';
import MiniCartButton from './components/MiniCartButton';
import NewsletterSection from './components/NewsletterSection';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import { useAuth } from './hooks/useAuth';
import { allRoutes } from './routes';
import AdminRoute from './routes/AdminRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import { AdminSidebarProvider } from './context/AdminSidebarContext';
import { CategoryMenuProvider } from './context/CategoryMenuContext';
import Header from './components/Header';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <AdminSidebarProvider>
        <CategoryMenuProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          {/* Show admin navbar when logged in user is admin, otherwise show regular navbar */}
          {user && user.role === 'admin' ? <AdminNavbar /> : <Header />}
          {/* Show category navbar for customers (non-admin users) */}
          {/* {!user || user.role !== 'admin' ? <CategoryNavbar /> : null} */}
          {/* Mini Cart Button - Floating on right side */}
          {!user || user.role !== 'admin' ? <MiniCartButton /> : null}

          {/* Main Content with padding for mobile bottom nav */}
          <div className="pb-20 md:pb-0">
            <Routes>
          {/* Public Routes */}
          {allRoutes.public.map((route) => (
            <Route key={route.path} path={route.path} element={<route.element />} />
          ))}

          {/* Auth Routes */}
          {allRoutes.auth.map((route) => (
            <Route key={route.path} path={route.path} element={<route.element />} />
          ))}

          {/* Protected Routes */}
          {allRoutes.protected.map((route) => (
            <Route key={route.path} path={route.path} element={<ProtectedRoute element={route.element} />} />
          ))}

          {/* Admin Routes */}
          {allRoutes.admin?.map((route) => (
            <Route key={route.path} path={route.path} element={<AdminRoute element={route.element} />} />
          ))}
            </Routes>
          </div>

          {/* Footer - Display on all pages except admin */}
          {!user || user.role !== 'admin' ? <Footer /> : null}

          {/* Mobile Bottom Navigation - Display on mobile/tablet for non-admin users */}
          {!user || user.role !== 'admin' ? <MobileBottomNav /> : null}
        </CategoryMenuProvider>
      </AdminSidebarProvider>
    </Router>
  );
}

export default App;
