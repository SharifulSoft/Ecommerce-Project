import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import pageSettingsService from '../services/pageSettingsService';
import PageSettingsToggle from '../components/Pages/PageSettingsToggle';

export default function AdminPageSettings() {
  const { pageId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageSettings, setPageSettings] = useState(null);

  useEffect(() => {
    fetchPageSettings();
  }, [pageId]);

  const fetchPageSettings = async () => {
    try {
      setLoading(true);
      const data = await pageSettingsService.getPageSettingsByPageId(pageId);
      setPageSettings(data);
    } catch (error) {
      // If settings don't exist, create default ones
      if (error?.success === false && error?.message === 'Page settings not found') {
        await createDefaultSettings();
      } else {
        toast.error('Failed to load page settings');
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const pageNames = {
        home: 'Home Page',
        cart: 'Cart Page',
        checkout: 'Checkout Page',
        'product-detail': 'Product Detail Page',
        category: 'Category Page',
        search: 'Search Page',
      };

      const descriptions = {
        home: 'Settings for the home page',
        cart: 'Settings for the shopping cart page',
        checkout: 'Settings for the checkout page',
        'product-detail': 'Settings for the product detail page',
        category: 'Settings for the category page',
        search: 'Settings for the search page',
      };

      const newSettings = await pageSettingsService.createPageSettings({
        pageId,
        pageName: pageNames[pageId] || pageId,
        description: descriptions[pageId] || `Settings for ${pageId}`,
      });

      setPageSettings(newSettings);
      toast.success('Default settings created successfully');
    } catch (error) {
      toast.error('Failed to create default settings');
      console.error(error);
    }
  };

  const handleToggleChange = async (settingPath, value) => {
    try {
      setSaving(true);
      await pageSettingsService.updatePageSettingToggle(pageId, settingPath, value);
      
      // Update local state
      const keys = settingPath.split('.');
      let obj = { ...pageSettings };
      let current = obj;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      setPageSettings(obj);
      
      toast.success('Setting updated successfully');
    } catch (error) {
      toast.error('Failed to update setting');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  if (!pageSettings) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Page settings not found</p>
      </div>
    );
  }

  const renderPageSettings = () => {
    switch (pageId) {
      case 'home':
        return renderHomePageSettings();
      case 'cart':
        return renderCartPageSettings();
      case 'checkout':
        return renderCheckoutPageSettings();
      default:
        return <p>No settings available for this page</p>;
    }
  };

  const renderHomePageSettings = () => (
    <div className="space-y-4">
     
      <PageSettingsToggle
        label="Enable Mini Cart"
        description="Show mini cart on the right side when products are added to cart"
        value={pageSettings.homePageSettings?.enableMiniCart}
        onChange={(value) => handleToggleChange('homePageSettings.enableMiniCart', value)}
      />
      
      {/* <PageSettingsToggle
        label="Brands"
        description="Show brands section on home page"
        value={pageSettings.homePageSettings?.showBrands}
        onChange={(value) => handleToggleChange('homePageSettings.showBrands', value)}
      />
      <PageSettingsToggle
        label="Banners"
        description="Show promotional banners on home page"
        value={pageSettings.homePageSettings?.showBanners}
        onChange={(value) => handleToggleChange('homePageSettings.showBanners', value)}
      />
      <PageSettingsToggle
        label="Categories"
        description="Show categories section on home page"
        value={pageSettings.homePageSettings?.showCategories}
        onChange={(value) => handleToggleChange('homePageSettings.showCategories', value)}
      />
      <PageSettingsToggle
        label="Testimonials"
        description="Show customer testimonials on home page"
        value={pageSettings.homePageSettings?.showTestimonials}
        onChange={(value) => handleToggleChange('homePageSettings.showTestimonials', value)}
      />
      <PageSettingsToggle
        label="Newsletter Signup"
        description="Show newsletter signup form on home page"
        value={pageSettings.homePageSettings?.showNewsletterSignup}
        onChange={(value) => handleToggleChange('homePageSettings.showNewsletterSignup', value)}
      /> */}
    </div>
  );

  const renderCartPageSettings = () => (
    <div className="space-y-4">
      <PageSettingsToggle
        label="Coupon Section"
        description="Show coupon/discount code input section"
        value={pageSettings.cartPageSettings?.showCouponSection}
        onChange={(value) => handleToggleChange('cartPageSettings.showCouponSection', value)}
      />
      <PageSettingsToggle
        label="Related Products"
        description="Show related products recommendations"
        value={pageSettings.cartPageSettings?.showRelatedProducts}
        onChange={(value) => handleToggleChange('cartPageSettings.showRelatedProducts', value)}
      />
      <PageSettingsToggle
        label="Cross-Sell Products"
        description="Show cross-sell product suggestions"
        value={pageSettings.cartPageSettings?.showCrossSellProducts}
        onChange={(value) => handleToggleChange('cartPageSettings.showCrossSellProducts', value)}
      />
      <PageSettingsToggle
        label="Shipping Estimate"
        description="Show estimated shipping costs"
        value={pageSettings.cartPageSettings?.showShippingEstimate}
        onChange={(value) => handleToggleChange('cartPageSettings.showShippingEstimate', value)}
      />
      <PageSettingsToggle
        label="Gift Message"
        description="Allow customers to add gift messages"
        value={pageSettings.cartPageSettings?.showGiftMessage}
        onChange={(value) => handleToggleChange('cartPageSettings.showGiftMessage', value)}
      />
      <PageSettingsToggle
        label="Save for Later"
        description="Allow customers to save items for later"
        value={pageSettings.cartPageSettings?.showSaveForLater}
        onChange={(value) => handleToggleChange('cartPageSettings.showSaveForLater', value)}
      />
      <PageSettingsToggle
        label="Continue Shopping"
        description="Show continue shopping button"
        value={pageSettings.cartPageSettings?.showContinueShopping}
        onChange={(value) => handleToggleChange('cartPageSettings.showContinueShopping', value)}
      />
      <PageSettingsToggle
        label="Recommended Products"
        description="Show AI-recommended products"
        value={pageSettings.cartPageSettings?.showRecommendedProducts}
        onChange={(value) => handleToggleChange('cartPageSettings.showRecommendedProducts', value)}
      />
    </div>
  );

  const renderCheckoutPageSettings = () => (
    <div className="space-y-4">
      <PageSettingsToggle
        label="Guest Checkout"
        description="Allow customers to checkout as guest"
        value={pageSettings.checkoutPageSettings?.showGuestCheckout}
        onChange={(value) => handleToggleChange('checkoutPageSettings.showGuestCheckout', value)}
      />
      <PageSettingsToggle
        label="Login Option"
        description="Show login option during checkout"
        value={pageSettings.checkoutPageSettings?.showLoginOption}
        onChange={(value) => handleToggleChange('checkoutPageSettings.showLoginOption', value)}
      />
      <PageSettingsToggle
        label="Shipping Options"
        description="Show multiple shipping method options"
        value={pageSettings.checkoutPageSettings?.showShippingOptions}
        onChange={(value) => handleToggleChange('checkoutPageSettings.showShippingOptions', value)}
      />
      <PageSettingsToggle
        label="Payment Methods"
        description="Show available payment methods"
        value={pageSettings.checkoutPageSettings?.showPaymentMethods}
        onChange={(value) => handleToggleChange('checkoutPageSettings.showPaymentMethods', value)}
      />
      <PageSettingsToggle
        label="Order Summary"
        description="Show order summary section"
        value={pageSettings.checkoutPageSettings?.showOrderSummary}
        onChange={(value) => handleToggleChange('checkoutPageSettings.showOrderSummary', value)}
      />
      <PageSettingsToggle
        label="Promo Code"
        description="Allow promo code entry"
        value={pageSettings.checkoutPageSettings?.showPromoCode}
        onChange={(value) => handleToggleChange('checkoutPageSettings.showPromoCode', value)}
      />
      <PageSettingsToggle
        label="Gift Options"
        description="Show gift wrapping and message options"
        value={pageSettings.checkoutPageSettings?.showGiftOptions}
        onChange={(value) => handleToggleChange('checkoutPageSettings.showGiftOptions', value)}
      />
      <PageSettingsToggle
        label="Terms & Conditions"
        description="Require acceptance of terms and conditions"
        value={pageSettings.checkoutPageSettings?.showTermsAndConditions}
        onChange={(value) => handleToggleChange('checkoutPageSettings.showTermsAndConditions', value)}
      />
      <PageSettingsToggle
        label="Newsletter Signup"
        description="Show newsletter signup option"
        value={pageSettings.checkoutPageSettings?.showNewsletterSignup}
        onChange={(value) => handleToggleChange('checkoutPageSettings.showNewsletterSignup', value)}
      />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{pageSettings.pageName}</h1>
            <p className="text-gray-600 mt-1">{pageSettings.description}</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Page Settings</h2>
        {renderPageSettings()}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}

