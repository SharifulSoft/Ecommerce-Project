import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import BasicInfoSection from '../components/ProductForm/BasicInfoSection';
import MediaSection from '../components/ProductForm/MediaSection';
import PricingSection from '../components/ProductForm/PricingSection';
import InventorySection from '../components/ProductForm/InventorySection';
import VariationsSection from '../components/ProductForm/VariationsSection';
import ShippingSection from '../components/ProductForm/ShippingSection';
import VideoSection from '../components/ProductForm/VideoSection';
import SEOSection from '../components/ProductForm/SEOSection';
import api from '../services/api';

export default function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    media: true,
    pricing: true,
    inventory: true,
    variations: false,
    shipping: false,
    video: false,
    seo: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch product
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const transformVariationsForFrontend = (variations) => {
    if (!variations || !Array.isArray(variations)) return [];

    return variations.map((variation) => {
      // Transform flat structure to nested pricing and inventory
      return {
        id: variation.id || `var_${Date.now()}_${Math.random()}`,
        sku: variation.sku || '',
        attributes: variation.attributes || {},
        pricing: {
          regularPrice: variation.price || 0,
          salePrice: variation.salePrice || null,
          costPrice: variation.costPrice || null,
        },
        inventory: {
          quantity: variation.stock || 0,
          trackStock: variation.extraInfo?.trackStock !== false,
          lowStockThreshold: variation.extraInfo?.lowStockThreshold || 5,
          allowBackorder: variation.extraInfo?.allowBackorder || false,
        },
        image: variation.image || null,
        gallery: variation.gallery || [],
        barcode: variation.barcode || '',
        status: variation.status || 'active',
        weight: variation.weight || '',
        dimensions: variation.dimensions || {},
        description: variation.description || '',
      };
    });
  };

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/products/${productId}`);
      const productData = response.data.data;

      // Transform variations to frontend format
      if (productData.variations && Array.isArray(productData.variations)) {
        productData.variations = transformVariationsForFrontend(productData.variations);
      }

      setFormData(productData);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setIsLoading(false);
    }
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

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const transformVariationsForBackend = (variations) => {
    if (!variations || !Array.isArray(variations)) return [];

    return variations.map((variation) => {
      // Transform nested pricing and inventory to flat structure
      return {
        id: variation.id,
        sku: variation.sku || '',
        attributes: variation.attributes || {},
        price: variation.pricing?.regularPrice || 0,
        salePrice: variation.pricing?.salePrice || null,
        costPrice: variation.pricing?.costPrice || null,
        stock: variation.inventory?.quantity || 0,
        image: variation.image || null,
        barcode: variation.barcode || '',
        status: variation.status || 'active',
        weight: variation.weight || '',
        dimensions: variation.dimensions || {},
        extraInfo: {
          trackStock: variation.inventory?.trackStock !== false,
          lowStockThreshold: variation.inventory?.lowStockThreshold || 5,
          allowBackorder: variation.inventory?.allowBackorder || false,
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      // Transform variations before sending
      const dataToSend = {
        ...formData,
        variations: transformVariationsForBackend(formData.variations),
      };

      await api.put(`/products/${productId}`, dataToSend);
      toast.success('Product updated successfully!');
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
      console.error('Error updating product:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 border border-red-200 bg-red-50">
          <p className="text-red-900">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-1">{formData.title}</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
              <p className="text-sm text-indigo-600 font-medium">Product ID</p>
              <p className="text-2xl font-bold text-indigo-900">#{formData.productId || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('basic')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform ${
                  expandedSections.basic ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSections.basic && (
              <BasicInfoSection
                formData={formData}
                handleInputChange={handleInputChange}
                handleArrayChange={handleArrayChange}
                handleNestedChange={handleNestedChange}
              />
            )}
          </div>

          {/* Media */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('media')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-semibold text-gray-900">Product Media</h2>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform ${
                  expandedSections.media ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSections.media && (
              <MediaSection formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} />
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('pricing')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform ${
                  expandedSections.pricing ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSections.pricing && (
              <PricingSection formData={formData} handleNestedChange={handleNestedChange} />
            )}
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('inventory')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform ${
                  expandedSections.inventory ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSections.inventory && (
              <InventorySection formData={formData} handleNestedChange={handleNestedChange} />
            )}
          </div>

          {/* Variations - Only show for Variable products */}
          {formData?.type === 'variable' && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('variations')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <h2 className="text-lg font-semibold text-gray-900">Variations</h2>
                <ChevronDown
                  size={20}
                  className={`text-gray-600 transition-transform ${
                    expandedSections.variations ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSections.variations && (
                <VariationsSection formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} />
              )}
            </div>
          )}

          {/* Shipping */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('shipping')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-semibold text-gray-900">Shipping</h2>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform ${
                  expandedSections.shipping ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSections.shipping && (
              <ShippingSection formData={formData} handleNestedChange={handleNestedChange} />
            )}
          </div>

          {/* Video */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('video')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-semibold text-gray-900">Product Video</h2>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform ${
                  expandedSections.video ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSections.video && (
              <VideoSection formData={formData} handleNestedChange={handleNestedChange} />
            )}
          </div>

          {/* SEO */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('seo')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-semibold text-gray-900">SEO & Marketing</h2>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform ${
                  expandedSections.seo ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSections.seo && (
              <SEOSection formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} />
            )}
          </div>

          {/* Submit Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

