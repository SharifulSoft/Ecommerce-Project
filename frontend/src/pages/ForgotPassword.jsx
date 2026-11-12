import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { ROUTES } from '../routes/routeConstants';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email) {
        toast.error('Please enter your email address');
        setIsLoading(false);
        return;
      }

      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        toast.error('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      const response = await api.post('/auth/forgot-password', { email });

      if (response.data.success) {
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send reset email';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
          </div>

          <p className="text-gray-600 text-center mb-6">
            We've sent a password reset link and PIN code to <strong>{email}</strong>
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>⏱️ Valid for 5 minutes:</strong> Both the reset link and PIN code expire in 5 minutes. Please act quickly!
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate(ROUTES.RESET_PASSWORD)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Enter Reset Code
            </button>

            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition-colors"
            >
              Try Another Email
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Remember your password?{' '}
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="text-red-500 hover:text-red-600 font-semibold"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 mb-6 font-semibold"
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
        <p className="text-gray-600 mb-8">
          Enter your email address and we'll send you a link and PIN code to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail size={18} />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            className="text-red-500 hover:text-red-600 font-semibold"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}

