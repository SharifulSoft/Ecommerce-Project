import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import BasicInfoSection from '../components/ProductForm/BasicInfoSection';
import PricingSection from '../components/ProductForm/PricingSection';
import InventorySection from '../components/ProductForm/InventorySection';
import MediaSection from '../components/ProductForm/MediaSection';
import VariationsSection from '../components/ProductForm/VariationsSection';
import ShippingSection from '../components/ProductForm/ShippingSection';
import VideoSection from '../components/ProductForm/VideoSection';
import SEOSection from '../components/ProductForm/SEOSection';
import { productService } from '../services/productService';

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    sku: '',
    type: 'physical',
    status: 'draft',
    category: [],
    subCategory: [],
    brand: [],
    label: '',
    tags: [],
    mainImage: '',
    gallery: [],
    pricing: {
      currency: 'USD',
      price: 0,
      salePrice: 0,
      discountPercent: 0,
      taxIncluded: false,
      costPrice: 0,
    },
    inventory: {
      trackStock: true,
      stockQuantity: 0,
      lowStockThreshold: 5,
      allowBackorder: false,
    },
    variations: [],
    shipping: {
      enable: false,
      freeShipping: false,
      shippingClass: '',
      originCountry: '',
    },
    video: {
      enabled: false,
      type: 'youtube',
      url: '',
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
    },
    description: {
      short: '',
      full: '',
    },
    attributes: [],
    adminControls: {
      enablePricing: true,
      enableStock: true,
      enableShipping: false,
      enableVariations: false,
      enableSEO: false,
      enableCustomAttributes: false,
    },
  });

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    pricing: true,
    inventory: true,
    media: true,
    variations: false,
    shipping: false,
    video: false,
    seo: false,
  });

  const [loading, setLoading] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.sku) {
        toast.error('Title and SKU are required');
        setLoading(false);
        return;
      }

      await productService.createProduct(formData);
      toast.success('Product created successfully!');

      // Reset form
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title, section }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 border-l-4 border-teal-600 transition-all"
    >
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <ChevronDown
        size={20}
        className={`text-teal-600 transition-transform ${
          expandedSections[section] ? 'rotate-180' : ''
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-2">Create and configure a new product for your store</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <SectionHeader title="Basic Information" section="basic" />
            {expandedSections.basic && (
              <BasicInfoSection
                formData={formData}
                handleInputChange={handleInputChange}
                handleArrayChange={handleArrayChange}
                handleNestedChange={handleNestedChange}
              />
            )}
          </div>

          {/* Media Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <SectionHeader title="Product Media" section="media" />
            {expandedSections.media && (
              <MediaSection formData={formData} setFormData={setFormData} />
            )}
          </div>

          {/* Pricing Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <SectionHeader title="Pricing" section="pricing" />
            {expandedSections.pricing && (
              <PricingSection
                formData={formData}
                handleNestedChange={handleNestedChange}
              />
            )}
          </div>

          {/* Inventory Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <SectionHeader title="Inventory" section="inventory" />
            {expandedSections.inventory && (
              <InventorySection
                formData={formData}
                handleNestedChange={handleNestedChange}
              />
            )}
          </div>

          {/* Variations Section - Only show for Variable products */}
          {formData.type === 'variable' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <SectionHeader title="Product Variations" section="variations" />
              {expandedSections.variations && (
                <VariationsSection formData={formData} setFormData={setFormData} />
              )}
            </div>
          )}

          {/* Shipping Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <SectionHeader title="Shipping" section="shipping" />
            {expandedSections.shipping && (
              <ShippingSection
                formData={formData}
                handleNestedChange={handleNestedChange}
              />
            )}
          </div>

          {/* Video Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <SectionHeader title="Product Video" section="video" />
            {expandedSections.video && (
              <VideoSection
                formData={formData}
                handleNestedChange={handleNestedChange}
              />
            )}
          </div>

          {/* SEO Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <SectionHeader title="SEO & Marketing" section="seo" />
            {expandedSections.seo && (
              <SEOSection formData={formData} setFormData={setFormData} />
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 sticky bottom-0 bg-white p-4 rounded-lg shadow-lg">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

