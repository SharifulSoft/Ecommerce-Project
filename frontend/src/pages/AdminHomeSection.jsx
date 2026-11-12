import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader, X, Plus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import homeSectionService from '../services/homeSectionService';
import { productService } from '../services/productService';
import categoryService from '../services/categoryService';
import brandService from '../services/brandService';
import PageSettingsToggle from '../components/Pages/PageSettingsToggle';

const SECTION_LABELS = {
  new_arrivals_grid: 'New Arrivals (Hero + Grid)',
  special_offers: 'Special Offers & Hot Deals',
  promo_banner: 'Promo Banner (2-Card Grid)',
};

const SECTION_CONFIG = {
  new_arrivals_grid: {
    showCoreFields: true,
    showHero: true,
    showBadges: true,
    showPromoBanners: false,
    showHotDeals: false,
    showSingleBanner: false,
    showProductSource: true,
  },
  special_offers: {
    showCoreFields: false,
    showHero: false,
    showBadges: false,
    showPromoBanners: false,
    showHotDeals: true,
    showSingleBanner: false,
    showProductSource: true,
  },
  promo_banner: {
    showCoreFields: false,
    showHero: false,
    showBadges: false,
    showPromoBanners: true,
    showHotDeals: false,
    showSingleBanner: false,
    showProductSource: false,
  },
};

const DEFAULT_CONFIG = {
  showCoreFields: true,
  showHero: true,
  showBadges: true,
  showPromoBanners: false,
  showHotDeals: false,
  showSingleBanner: false,
  showProductSource: true,
};

const GRADIENT_PRESETS = [
  { label: 'Orange → Pink', value: 'from-orange-500 to-pink-500' },
  { label: 'Blue → Cyan', value: 'from-blue-500 to-cyan-500' },
  { label: 'Purple → Pink', value: 'from-purple-500 to-pink-500' },
  { label: 'Green → Teal', value: 'from-green-500 to-teal-500' },
  { label: 'Red → Orange', value: 'from-red-500 to-orange-500' },
  { label: 'Indigo → Purple', value: 'from-indigo-500 to-purple-500' },
  { label: 'Yellow → Orange', value: 'from-yellow-500 to-orange-500' },
  { label: 'Slate → Gray', value: 'from-slate-700 to-gray-900' },
];

export default function AdminHomeSection() {
  const { sectionKey } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState(null);
  const [previewProducts, setPreviewProducts] = useState([]);

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [tagInput, setTagInput] = useState('');
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    fetchSection();
    fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  const fetchSection = async () => {
    try {
      setLoading(true);
      const data = await homeSectionService.getSectionByKey(sectionKey);
      setSection(data.section);
      setPreviewProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to load section');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [productRes, catRes, brandRes] = await Promise.all([
        productService.getAllProducts({ status: 'active' }),
        categoryService.getAllCategories(),
        brandService.getAllBrands(),
      ]);
      setAllProducts(productRes.data || []);
      setCategories(catRes.data || []);
      setBrands(brandRes.data || []);
    } catch (error) {
      console.error('Failed to load lookups', error);
    }
  };

  const update = (path, value) => {
    setSection((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...(cur[keys[i]] || {}) };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const toggleArrayValue = (path, value) => {
    setSection((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...(cur[keys[i]] || {}) };
        cur = cur[keys[i]];
      }
      const last = keys[keys.length - 1];
      const arr = Array.isArray(cur[last]) ? [...cur[last]] : [];
      const idx = arr.findIndex((v) => String(v?._id ?? v) === String(value));
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(value);
      cur[last] = arr;
      return next;
    });
  };

  const addTag = () => {
    const v = tagInput.trim();
    if (!v) return;
    const current = section?.filters?.tags || [];
    if (current.includes(v)) {
      setTagInput('');
      return;
    }
    update('filters.tags', [...current, v]);
    setTagInput('');
  };

  const removeTag = (tag) => {
    update(
      'filters.tags',
      (section?.filters?.tags || []).filter((t) => t !== tag)
    );
  };

  const filteredProductOptions = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return allProducts.slice(0, 30);
    return allProducts
      .filter((p) => p.title?.toLowerCase().includes(q))
      .slice(0, 30);
  }, [productSearch, allProducts]);

  const buildPayload = () => {
    if (!section) return {};
    const idsOf = (arr) =>
      (arr || []).map((v) => (typeof v === 'object' ? v._id : v)).filter(Boolean);
    return {
      sectionName: section.sectionName,
      enabled: section.enabled,
      title: section.title,
      subtitle: section.subtitle,
      viewAllText: section.viewAllText,
      viewAllUrl: section.viewAllUrl,
      heroProduct: section.heroProduct?._id || section.heroProduct || null,
      filterType: section.filterType,
      filters: {
        categories: idsOf(section.filters?.categories),
        brands: idsOf(section.filters?.brands),
        tags: section.filters?.tags || [],
        onSale: !!section.filters?.onSale,
        featured: !!section.filters?.featured,
        latest: !!section.filters?.latest,
      },
      manualProducts: idsOf(section.manualProducts),
      sortBy: section.sortBy,
      limit: Number(section.limit) || 6,
      badges: { ...(section.badges || {}) },
      promoBanners: (section.promoBanners || []).map((b) => ({ ...b })),
      hotDealsTitle: section.hotDealsTitle,
      hotDealsSubtitle: section.hotDealsSubtitle,
      hotDealsCountdownEnd: section.hotDealsCountdownEnd || null,
      hotDealsBaselineStock: Number(section.hotDealsBaselineStock) || 100,
      singleBanner: { ...(section.singleBanner || {}) },
    };
  };

  const updateBanner = (idx, field, value) => {
    setSection((prev) => {
      if (!prev) return prev;
      const banners = [...(prev.promoBanners || [])];
      banners[idx] = { ...(banners[idx] || {}), [field]: value };
      return { ...prev, promoBanners: banners };
    });
  };

  const addBanner = () => {
    setSection((prev) => {
      if (!prev) return prev;
      const banners = [...(prev.promoBanners || [])];
      banners.push({
        enabled: true,
        title: 'New Promo',
        subtitle: '',
        description: '',
        image: '',
        bgGradient: 'from-orange-500 to-pink-500',
        discount: '',
        endDate: '',
        buttonText: 'Shop Now',
        buttonUrl: '/shop',
      });
      return { ...prev, promoBanners: banners };
    });
  };

  const removeBanner = (idx) => {
    setSection((prev) => {
      if (!prev) return prev;
      const banners = [...(prev.promoBanners || [])];
      banners.splice(idx, 1);
      return { ...prev, promoBanners: banners };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = await homeSectionService.updateSection(sectionKey, buildPayload());
      setSection(data.section);
      setPreviewProducts(data.products || []);
      toast.success('Section saved');
    } catch (error) {
      toast.error(error?.message || 'Failed to save');
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

  if (!section) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Section not found</p>
      </div>
    );
  }

  const heroId = section.heroProduct?._id || section.heroProduct;
  const manualIds = (section.manualProducts || []).map((p) => p._id || p);
  const selectedCategoryIds = (section.filters?.categories || []).map(
    (c) => c._id || c
  );
  const selectedBrandIds = (section.filters?.brands || []).map((b) => b._id || b);
  const cfg = SECTION_CONFIG[sectionKey] || DEFAULT_CONFIG;
  const countdownInputValue = section.hotDealsCountdownEnd
    ? new Date(section.hotDealsCountdownEnd).toISOString().slice(0, 16)
    : '';

  return (
    <div className="p-6 max-w-5xl">
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
            <h1 className="text-3xl font-bold text-gray-900">
              {SECTION_LABELS[sectionKey] || section.sectionName}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage section content, filters, and badges
            </p>
          </div>
        </div>
      </div>

      {/* Section Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Section Controls</h2>
        <div className="space-y-4">
          <PageSettingsToggle
            label="Enable Section"
            description="Show this section on the home page"
            value={!!section.enabled}
            onChange={(v) => update('enabled', v)}
          />

          {cfg.showCoreFields && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={section.title || ''}
                  onChange={(e) => update('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={section.subtitle || ''}
                  onChange={(e) => update('subtitle', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  View All Button Text
                </label>
                <input
                  type="text"
                  value={section.viewAllText || ''}
                  onChange={(e) => update('viewAllText', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  View All Button URL
                </label>
                <input
                  type="text"
                  value={section.viewAllUrl || ''}
                  onChange={(e) => update('viewAllUrl', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Promo Banners (Special Offers) */}
      {cfg.showPromoBanners && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Promo Banners</h2>
              <p className="text-sm text-gray-600 mt-1">
                Top promotional cards. Render in the order shown.
              </p>
            </div>
            <button
              onClick={addBanner}
              className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm flex items-center gap-1"
            >
              <Plus size={16} /> Add Banner
            </button>
          </div>

          <div className="space-y-6">
            {(section.promoBanners || []).map((banner, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-800">Banner #{idx + 1}</h3>
                  <button
                    onClick={() => removeBanner(idx)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
                <PageSettingsToggle
                  label="Show This Banner"
                  description="Toggle visibility without deleting"
                  value={!!banner.enabled}
                  onChange={(v) => updateBanner(idx, 'enabled', v)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={banner.title || ''}
                      onChange={(e) => updateBanner(idx, 'title', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={banner.subtitle || ''}
                      onChange={(e) => updateBanner(idx, 'subtitle', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={banner.description || ''}
                      onChange={(e) => updateBanner(idx, 'description', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={banner.image || ''}
                      onChange={(e) => updateBanner(idx, 'image', e.target.value)}
                      placeholder="https://…"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    {banner.image && (
                      <img
                        src={banner.image}
                        alt="preview"
                        className="mt-2 h-24 w-full object-cover rounded"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Gradient
                    </label>
                    <select
                      value={banner.bgGradient || ''}
                      onChange={(e) => updateBanner(idx, 'bgGradient', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      {GRADIENT_PRESETS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                    <div
                      className={`mt-2 h-6 rounded bg-gradient-to-r ${banner.bgGradient || 'from-gray-400 to-gray-600'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Label
                    </label>
                    <input
                      type="text"
                      value={banner.discount || ''}
                      onChange={(e) => updateBanner(idx, 'discount', e.target.value)}
                      placeholder="50%"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date Text (Display)
                    </label>
                    <input
                      type="text"
                      value={banner.endDate || ''}
                      onChange={(e) => updateBanner(idx, 'endDate', e.target.value)}
                      placeholder="Aug 31"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={banner.buttonText || ''}
                      onChange={(e) => updateBanner(idx, 'buttonText', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button URL
                    </label>
                    <input
                      type="text"
                      value={banner.buttonUrl || ''}
                      onChange={(e) => updateBanner(idx, 'buttonUrl', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!section.promoBanners || section.promoBanners.length === 0) && (
              <p className="text-sm text-gray-500">No banners yet. Click "Add Banner" above.</p>
            )}
          </div>
        </div>
      )}

      {/* Single Banner (Promo Banner) */}
      {cfg.showSingleBanner && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Banner Content</h2>
          <p className="text-sm text-gray-600 mb-6">
            Full-width promotional banner shown on the home page.
          </p>
          <div className="space-y-4">
            <PageSettingsToggle
              label="Show Banner"
              description="Toggle visibility without deleting content"
              value={!!section.singleBanner?.enabled}
              onChange={(v) => update('singleBanner.enabled', v)}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label (small text on top)
                </label>
                <input
                  type="text"
                  value={section.singleBanner?.label || ''}
                  onChange={(e) => update('singleBanner.label', e.target.value)}
                  placeholder="Black Friday"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Headline (large text)
                </label>
                <input
                  type="text"
                  value={section.singleBanner?.headline || ''}
                  onChange={(e) => update('singleBanner.headline', e.target.value)}
                  placeholder="UP TO 60 % OFF"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={section.singleBanner?.description || ''}
                  onChange={(e) => update('singleBanner.description', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Image URL
                </label>
                <input
                  type="text"
                  value={section.singleBanner?.backgroundImage || ''}
                  onChange={(e) => update('singleBanner.backgroundImage', e.target.value)}
                  placeholder="https://…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                {section.singleBanner?.backgroundImage && (
                  <img
                    src={section.singleBanner.backgroundImage}
                    alt="preview"
                    className="mt-2 h-32 w-full object-cover rounded"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={section.singleBanner?.buttonText || ''}
                  onChange={(e) => update('singleBanner.buttonText', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Button URL
                </label>
                <input
                  type="text"
                  value={section.singleBanner?.buttonUrl || ''}
                  onChange={(e) => update('singleBanner.buttonUrl', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hot Deals Settings (Special Offers) */}
      {cfg.showHotDeals && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Hot Deals Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hot Deals Title
              </label>
              <input
                type="text"
                value={section.hotDealsTitle || ''}
                onChange={(e) => update('hotDealsTitle', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hot Deals Subtitle
              </label>
              <input
                type="text"
                value={section.hotDealsSubtitle || ''}
                onChange={(e) => update('hotDealsSubtitle', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Countdown Ends At
              </label>
              <input
                type="datetime-local"
                value={countdownInputValue}
                onChange={(e) =>
                  update(
                    'hotDealsCountdownEnd',
                    e.target.value ? new Date(e.target.value).toISOString() : null
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to hide the countdown.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Bar Baseline
              </label>
              <input
                type="number"
                min={1}
                value={section.hotDealsBaselineStock || 100}
                onChange={(e) =>
                  update('hotDealsBaselineStock', Number(e.target.value) || 100)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used as the denominator for the "X sold / Y left" progress bar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Product */}
      {cfg.showHero && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Featured Hero Product</h2>
          <p className="text-sm text-gray-600 mb-4">
            The large left card. Leave empty to fall back to the first auto-resolved product.
          </p>
          <select
            value={heroId || ''}
            onChange={(e) => update('heroProduct', e.target.value || null)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— None (auto) —</option>
            {allProducts.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Badges */}
      {cfg.showBadges && (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Badges</h2>
        <div className="space-y-4">
          <PageSettingsToggle
            label="Show 'New Arrival' Badge on Hero"
            description="Top-left badge on the large hero card"
            value={!!section.badges?.showNewArrival}
            onChange={(v) => update('badges.showNewArrival', v)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hero Badge Label
            </label>
            <input
              type="text"
              value={section.badges?.newArrivalLabel || ''}
              onChange={(e) => update('badges.newArrivalLabel', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <PageSettingsToggle
            label="Show 'Limited Stock' Pill"
            description="Hero card feature pill"
            value={!!section.badges?.showLimitedStock}
            onChange={(v) => update('badges.showLimitedStock', v)}
          />
          <PageSettingsToggle
            label="Show 'Free Shipping' Pill"
            description="Hero card feature pill"
            value={!!section.badges?.showFreeShipping}
            onChange={(v) => update('badges.showFreeShipping', v)}
          />
          <PageSettingsToggle
            label="Show Warranty Pill"
            description="Hero card feature pill"
            value={!!section.badges?.showWarranty}
            onChange={(v) => update('badges.showWarranty', v)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warranty Pill Label
            </label>
            <input
              type="text"
              value={section.badges?.warrantyLabel || ''}
              onChange={(e) => update('badges.warrantyLabel', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <PageSettingsToggle
            label="Show 'NEW' Badge on Grid Cards"
            description="Small badge in the top-left of each grid product"
            value={!!section.badges?.showGridNewBadge}
            onChange={(v) => update('badges.showGridNewBadge', v)}
          />
        </div>
      </div>
      )}

      {/* Product Source */}
      {cfg.showProductSource && (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {sectionKey === 'special_offers' ? 'Hot Deals Products' : 'Product Source'}
        </h2>

        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="filterType"
              checked={section.filterType === 'auto'}
              onChange={() => update('filterType', 'auto')}
            />
            <span>Auto (filters)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="filterType"
              checked={section.filterType === 'manual'}
              onChange={() => update('filterType', 'manual')}
            />
            <span>Manual selection</span>
          </label>
        </div>

        {section.filterType === 'auto' ? (
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded-lg">
                {categories.map((c) => {
                  const checked = selectedCategoryIds.some(
                    (id) => String(id) === String(c._id)
                  );
                  return (
                    <label
                      key={c._id}
                      className={`px-3 py-1 rounded-full text-sm border cursor-pointer ${
                        checked
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={checked}
                        onChange={() => toggleArrayValue('filters.categories', c._id)}
                      />
                      {c.title}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Brands</h3>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-gray-200 rounded-lg">
                {brands.map((b) => {
                  const checked = selectedBrandIds.some(
                    (id) => String(id) === String(b._id)
                  );
                  return (
                    <label
                      key={b._id}
                      className={`px-3 py-1 rounded-full text-sm border cursor-pointer ${
                        checked
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={checked}
                        onChange={() => toggleArrayValue('filters.brands', b._id)}
                      />
                      {b.title}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {(section.filters?.tags || []).map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm"
                  >
                    {t}
                    <button
                      onClick={() => removeTag(t)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Type a tag and press Enter"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Boolean filters */}
            <div className="space-y-3">
              <PageSettingsToggle
                label="On Sale Only"
                description="Only products with sale price lower than regular price"
                value={!!section.filters?.onSale}
                onChange={(v) => update('filters.onSale', v)}
              />
              <PageSettingsToggle
                label="Featured Products Only"
                description="Only products that have a Product Label assigned"
                value={!!section.filters?.featured}
                onChange={(v) => update('filters.featured', v)}
              />
              <PageSettingsToggle
                label="Latest Products Only"
                description="Only products created in the last 30 days"
                value={!!section.filters?.latest}
                onChange={(v) => update('filters.latest', v)}
              />
            </div>
          </div>
        ) : (
          <ManualSelector
            allProducts={allProducts}
            manualIds={manualIds}
            search={productSearch}
            onSearchChange={setProductSearch}
            filteredOptions={filteredProductOptions}
            onToggle={(id) => toggleArrayValue('manualProducts', id)}
            section={section}
          />
        )}

        {/* Sort + Limit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={section.sortBy}
              onChange={(e) => update('sortBy', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="latest">Newest</option>
              <option value="popularity">Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="random">Random</option>
              <option value="manual">Custom (manual order)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {sectionKey === 'special_offers' ? 'Hot Deals Product Count' : 'Grid Product Limit (excluding hero)'}
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={section.limit}
              onChange={(e) => update('limit', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      )}

      {/* Preview */}
      {cfg.showProductSource && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Preview ({previewProducts.length})
          </h2>
          {previewProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No products match the current filters. Save to refresh.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {previewProducts.map((p) => (
                <div
                  key={p._id}
                  className="border border-gray-200 rounded-lg p-2 text-center"
                >
                  <div className="aspect-square bg-gray-100 rounded mb-2 overflow-hidden">
                    {p.mainImage && (
                      <img
                        src={p.mainImage}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-700 line-clamp-2">{p.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end gap-4 sticky bottom-0 bg-gray-50 py-4 -mx-6 px-6 border-t border-gray-200">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
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

function ManualSelector({
  allProducts,
  manualIds,
  search,
  onSearchChange,
  filteredOptions,
  onToggle,
  section,
}) {
  const selected = (section.manualProducts || []).filter(
    (p) => p && (p._id || typeof p === 'string')
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-gray-900 mb-2">
          Selected Products ({selected.length})
        </h3>
        {selected.length === 0 ? (
          <p className="text-sm text-gray-500">None selected yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((p) => {
              const id = p._id || p;
              const product =
                typeof p === 'object' ? p : allProducts.find((x) => x._id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 px-2 py-1 rounded-full text-sm border border-blue-200"
                >
                  {product?.title || id}
                  <button
                    onClick={() => onToggle(id)}
                    className="text-blue-500 hover:text-blue-800"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-2">Add Products</h3>
        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
          {filteredOptions.map((p) => {
            const checked = manualIds.some((id) => String(id) === String(p._id));
            return (
              <label
                key={p._id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(p._id)}
                />
                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {p.mainImage && (
                    <img
                      src={p.mainImage}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {p.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${p.pricing?.salePrice || p.pricing?.price || 0}
                  </p>
                </div>
                {checked && (
                  <span className="text-xs text-blue-600 font-medium">Selected</span>
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
