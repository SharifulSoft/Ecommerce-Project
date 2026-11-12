/**
 * Auth Routes - Routes for authentication (Login, Register, etc.)
 * These routes are accessible to unauthenticated users
 */

import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';

export const authRoutes = [
  {
    path: '/login',
    element: Login,
    name: 'Login',
    description: 'User login page'
  },
  {
    path: '/register',
    element: Register,
    name: 'Register',
    description: 'User registration page'
  },
  {
    path: '/forgot-password',
    element: ForgotPassword,
    name: 'Forgot Password',
    description: 'Forgot password page'
  },
  {
    path: '/reset-password',
    element: ResetPassword,
    name: 'Reset Password',
    description: 'Reset password page'
  }
];

