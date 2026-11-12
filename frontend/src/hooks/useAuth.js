import { useDispatch, useSelector } from 'react-redux';
import { setUser, setToken, setLoading, setError, logout } from '../store/authSlice';
import { authService } from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isLoading, error } = useSelector((state) => state.auth);

  /**
   * Register a new user
   * @param {object} formData - Registration form data
   * @returns {object} Registration result
   */
  const register = async (formData) => {
    dispatch(setLoading(true));
    try {
      const data = await authService.register(formData);
      dispatch(setUser(data.user));
      dispatch(setToken(data.accessToken));
      dispatch(setError(null));
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.errors?.[0] || err.response?.data?.message || 'Registration failed';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {object} Login result
   */
  const login = async (email, password) => {
    dispatch(setLoading(true));
    try {
      const data = await authService.login(email, password);
      dispatch(setUser(data.user));
      dispatch(setToken(data.accessToken));
      dispatch(setError(null));
      return { success: true, data };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  /**
   * Logout user
   */
  const handleLogout = async () => {
    dispatch(setLoading(true));
    try {
      await authService.logout();
      dispatch(logout());
    } catch (err) {
      console.error('Logout error:', err);
      dispatch(logout());
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    user,
    token,
    isLoading,
    error,
    register,
    login,
    logout: handleLogout,
    isAuthenticated: !!token,
  };
};

