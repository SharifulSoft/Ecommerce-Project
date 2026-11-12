import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Loader, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { ROUTES } from '../routes/routeConstants';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [tokenOrPin, setTokenOrPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (token) {
      setTokenOrPin(token);
      // Auto-verify token from email link
      autoVerifyToken(emailParam, token);
    } else {
      // No token in URL, show manual entry form
      setIsVerifying(false);
    }
  }, [searchParams]);

  const autoVerifyToken = async (emailParam, token) => {
    try {
      // If email is in URL, use it; otherwise ask user to enter it
      if (!emailParam) {
        console.log('No email parameter in URL');
        setIsVerifying(false);
        return;
      }

      console.log('Auto-verifying token for email:', emailParam);
      setEmail(emailParam);

      const response = await api.post('/auth/verify-reset-token', {
        email: emailParam,
        tokenOrPin: token,
      });

      console.log('Verification response:', response.data);

      if (response.data.success) {
        console.log('Token verified successfully');
        setIsVerified(true);
        setIsVerifying(false);
        // Don't show toast - go directly to password form
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorMsg = error.response?.data?.message || 'Invalid or expired reset link';
      toast.error(errorMsg);
      setVerificationError(true);
      setIsVerifying(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      if (!email || !tokenOrPin) {
        toast.error('Please enter email and reset code');
        setIsVerifying(false);
        return;
      }

      const response = await api.post('/auth/verify-reset-token', {
        email,
        tokenOrPin,
      });

      if (response.data.success) {
        setIsVerified(true);
        toast.success('Reset code verified!');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid reset code';
      toast.error(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  // Show loading screen while auto-verifying token
  if (isVerifying && tokenOrPin && !verificationError) {
    return (
      <div className="py-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Loader className="w-8 h-8 text-green-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Setting Up Your Password Reset</h1>
          <p className="text-gray-600">Just a moment...</p>
        </div>
      </div>
    );
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!newPassword || !confirmPassword) {
        toast.error('Please fill in all password fields');
        setIsLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        toast.error('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        setIsLoading(false);
        return;
      }

      const response = await api.post('/auth/reset-password', {
        email,
        tokenOrPin,
        newPassword,
        confirmPassword,
      });

      if (response.data.success) {
        setResetSuccess(true);
        toast.success('Password reset successfully!');
        setTimeout(() => navigate(ROUTES.LOGIN), 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="py-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h1>
          <p className="text-gray-600 mb-6">Your password has been changed successfully. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Show verification error or manual entry form
  if (!isVerified) {
    return (
      <div className="py-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <button
            onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 mb-6 font-semibold"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {verificationError ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Link Expired or Invalid</h1>
              <p className="text-gray-600 mb-6">The reset link has expired or is invalid. Please request a new password reset.</p>
              <button
                onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Request New Reset Link
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Reset Code</h1>
              <p className="text-gray-600 mb-6">Enter your email and the reset code from your email.</p>

              <form onSubmit={handleVerify} className="space-y-4">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Reset Code (PIN or Link Token)
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={tokenOrPin}
                    onChange={(e) => setTokenOrPin(e.target.value)}
                    placeholder="Enter 6-digit PIN or token"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Password</h1>
        <p className="text-gray-600 mb-6">Enter your new password below.</p>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                <Lock size={18} />
                Reset Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

