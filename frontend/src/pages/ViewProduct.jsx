import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, AlertCircle, Edit2, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import brandService from '../services/brandService';

export default function ViewProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [brands, setBrands] = useState([]);
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
  const [error, setError] = useState(null);

  // Fetch product and brands
  useEffect(() => {
    fetchProduct();
    fetchBrands();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/products/${productId}`);
      setFormData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product');
      console.error('Error fetching product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await brandService.getAllBrands();
      setBrands(response.data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const getBrandTitle = (brandId) => {
    const brand = brands.find((b) => b._id === brandId);
    return brand ? brand.title : 'N/A';
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getVideoEmbedUrl = (url, type) => {
    if (!url) return '';

    try {
      if (type === 'youtube') {
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(youtubeRegex);
        return match ? `https://www.youtube.com/embed/${match[1]}` : '';
      } else if (type === 'vimeo') {
        const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
        const match = url.match(vimeoRegex);
        return match ? `https://player.vimeo.com/video/${match[1]}` : '';
      } else if (type === 'dailymotion') {
        const dailymotionRegex = /(?:dailymotion\.com\/video\/)([^_]+)/;
        const match = url.match(dailymotionRegex);
        return match ? `https://www.dailymotion.com/embed/video/${match[1]}` : '';
      }
    } catch (error) {
      console.error('Error extracting video ID:', error);
    }
    return '';
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

  const SectionHeader = ({ title, section }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition border-b border-gray-200"
    >
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <ChevronDown
        size={20}
        className={`text-gray-600 transition-transform ${
          expandedSections[section] ? 'rotate-180' : ''
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Products
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">View Product</h1>
              <p className="text-gray-600 mt-1">{formData.title}</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
                <p className="text-sm text-indigo-600 font-medium">Product ID</p>
                <p className="text-2xl font-bold text-indigo-900">#{formData.productId || 'N/A'}</p>
              </div>
              <button
                onClick={() => navigate(`/admin/products/edit/${productId}`)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
              >
                <Edit2 size={18} />
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <SectionHeader title="Basic Information" section="basic" />
            {expandedSections.basic && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Title</p>
                    <p className="text-gray-900 font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">SKU</p>
                    <p className="text-gray-900 font-medium">{formData.sku || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="text-gray-900 font-medium">{formData.type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-gray-900 font-medium">{formData.status || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Brand</p>
                    <p className="text-gray-900 font-medium">
                      {formData.brand && formData.brand.length > 0
                        ? getBrandTitle(formData.brand[0])
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="text-gray-900 font-medium">
                      {formData.category && formData.category.length > 0
                        ? (formData.category[0]?.title || formData.category[0])
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <SectionHeader title="Pricing" section="pricing" />
            {expandedSections.pricing && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-gray-900 font-medium">${formData.pricing?.price?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sale Price</p>
                    <p className="text-gray-900 font-medium">${formData.pricing?.salePrice?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cost Price</p>
                    <p className="text-gray-900 font-medium">${formData.pricing?.costPrice?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Discount %</p>
                    <p className="text-gray-900 font-medium">{formData.pricing?.discountPercent || 0}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <SectionHeader title="Inventory" section="inventory" />
            {expandedSections.inventory && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Stock Quantity</p>
                    <p className="text-gray-900 font-medium">{formData.inventory?.stockQuantity || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Low Stock Threshold</p>
                    <p className="text-gray-900 font-medium">{formData.inventory?.lowStockThreshold || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Track Stock</p>
                    <p className="text-gray-900 font-medium">{formData.inventory?.trackStock ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Allow Backorder</p>
                    <p className="text-gray-900 font-medium">{formData.inventory?.allowBackorder ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Video */}
          {formData.video?.enabled && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <SectionHeader title="Product Video" section="video" />
              {expandedSections.video && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Video Platform</p>
                      <p className="text-gray-900 font-medium capitalize">{formData.video?.type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-gray-900 font-medium">{formData.video?.enabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                  </div>
                  {formData.video?.url && (
                    <div className="bg-black rounded-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="315"
                        src={getVideoEmbedUrl(formData.video.url, formData.video.type)}
                        title="Product Video"
                        style={{ border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Created Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Created By</p>
                <p className="text-gray-900 font-medium">{formData.createdBy || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="text-gray-900 font-medium">
                  {formData.createdAt ? new Date(formData.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

