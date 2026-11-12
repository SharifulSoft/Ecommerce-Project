import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminSidebar from '../components/AdminSidebar';

export default function ReviewSettings() {
  const [settings, setSettings] = useState({
    reviewsEnabled: true,
    approvalRequired: true,
    maxReviewLength: 500,
    minReviewLength: 10,
    allowImages: true,
    maxImagesPerReview: 5,
    verifiedPurchaseOnly: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const token = localStorage.getItem('accessToken');

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/page-settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.settings?.reviewSettings) {
          setSettings(response.data.settings.reviewSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Use default settings if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE_URL}/page-settings`,
        {
          reviewSettings: settings,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Review settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save review settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Review Settings</h1>
            <p className="text-gray-600 mt-2">Configure review system behavior</p>
          </div>

          {/* Settings Form */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Enable/Disable Reviews */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="reviewsEnabled"
                    checked={settings.reviewsEnabled}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">Enable Reviews</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="approvalRequired"
                    checked={settings.approvalRequired}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">Require Admin Approval</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="verifiedPurchaseOnly"
                    checked={settings.verifiedPurchaseOnly}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">Verified Purchase Only</span>
                </label>
              </div>
            </div>

            {/* Content Settings */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Minimum Review Length (characters)
                  </label>
                  <input
                    type="number"
                    name="minReviewLength"
                    value={settings.minReviewLength}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Maximum Review Length (characters)
                  </label>
                  <input
                    type="number"
                    name="maxReviewLength"
                    value={settings.maxReviewLength}
                    onChange={handleChange}
                    min="100"
                    max="2000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Image Settings */}
            <div className="border-b pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Image Settings</h2>

              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowImages"
                    checked={settings.allowImages}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">Allow Review Images</span>
                </label>

                {settings.allowImages && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Maximum Images Per Review
                    </label>
                    <input
                      type="number"
                      name="maxImagesPerReview"
                      value={settings.maxImagesPerReview}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Review System Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Reviews are stored separately from products for better scalability</li>
              <li>• Admin approval can be toggled to auto-publish or require moderation</li>
              <li>• Verified purchase badge shows only for users who bought the product</li>
              <li>• All review content is sanitized to prevent XSS attacks</li>
              <li>• Users can update or delete their own reviews anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

