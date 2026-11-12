const HomeSection = require('../models/HomeSection');
const Product = require('../models/Product');

const SECTION_DEFAULTS = {
  new_arrivals_grid: {
    sectionName: 'New Arrivals (Hero + Grid)',
    title: 'New Arrivals',
    subtitle: 'Fresh products just landed',
    viewAllText: 'View All',
    viewAllUrl: '/shop',
    sortBy: 'latest',
    limit: 6,
  },
  special_offers: {
    sectionName: 'Special Offers & Hot Deals',
    title: '',
    subtitle: '',
    viewAllText: '',
    viewAllUrl: '',
    sortBy: 'latest',
    limit: 4,
    hotDealsTitle: 'Hot Deals',
    hotDealsSubtitle: 'Limited quantity, hurry up!',
    hotDealsBaselineStock: 100,
  },
  promo_banner: {
    sectionName: 'Promo Banner (2-Card Grid)',
    title: '',
    subtitle: '',
    viewAllText: '',
    viewAllUrl: '',
    sortBy: 'latest',
    limit: 0,
    promoBanners: [
      {
        enabled: true,
        title: 'Summer Sale',
        subtitle: 'Up to 50% OFF',
        description: 'Refresh your style with summer essentials',
        image:
          'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop',
        bgGradient: 'from-orange-500 to-pink-500',
        discount: '50%',
        endDate: 'Aug 31',
        buttonText: 'Shop Now',
        buttonUrl: '/shop',
      },
      {
        enabled: true,
        title: 'Tech Week',
        subtitle: 'Best Deals on Electronics',
        description: 'Save big on the latest gadgets',
        image:
          'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&h=600&fit=crop',
        bgGradient: 'from-blue-500 to-cyan-500',
        discount: '40%',
        endDate: 'Limited Time',
        buttonText: 'Shop Now',
        buttonUrl: '/shop',
      },
    ],
  },
};

const buildAutoQuery = (section) => {
  const query = { status: 'active' };
  const f = section.filters || {};

  if (f.categories?.length) query.category = { $in: f.categories };
  if (f.brands?.length) query.brand = { $in: f.brands };
  if (f.tags?.length) query.tags = { $in: f.tags };
  if (f.featured) query.label = { $ne: null };
  if (f.latest) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query.createdAt = { $gte: thirtyDaysAgo };
  }
  if (f.onSale) {
    query.$expr = {
      $and: [
        { $gt: ['$pricing.salePrice', 0] },
        { $lt: ['$pricing.salePrice', '$pricing.price'] },
      ],
    };
  }

  return query;
};

const buildSort = (sortBy) => {
  switch (sortBy) {
    case 'popularity':
      return { 'rating.count': -1, 'rating.average': -1 };
    case 'price-low':
      return { 'pricing.salePrice': 1 };
    case 'price-high':
      return { 'pricing.salePrice': -1 };
    case 'latest':
    default:
      return { createdAt: -1 };
  }
};

const resolveProducts = async (section) => {
  const limit = section.limit ?? 6;
  if (limit <= 0) return [];
  const heroId = section.heroProduct?._id || section.heroProduct;

  if (section.filterType === 'manual' || section.sortBy === 'manual') {
    const ids = (section.manualProducts || []).filter(Boolean);
    if (!ids.length) return [];
    const products = await Product.find({ _id: { $in: ids }, status: 'active' })
      .populate('category', 'title')
      .populate('brand', 'title');
    const byId = new Map(products.map((p) => [String(p._id), p]));
    return ids
      .map((id) => byId.get(String(id._id || id)))
      .filter(Boolean)
      .filter((p) => !heroId || String(p._id) !== String(heroId))
      .slice(0, limit);
  }

  const query = buildAutoQuery(section);
  if (heroId) query._id = { $ne: heroId };

  if (section.sortBy === 'random') {
    const sampled = await Product.aggregate([
      { $match: query },
      { $sample: { size: limit } },
    ]);
    return Product.populate(sampled, [
      { path: 'category', select: 'title' },
      { path: 'brand', select: 'title' },
    ]);
  }

  return Product.find(query)
    .populate('category', 'title')
    .populate('brand', 'title')
    .sort(buildSort(section.sortBy))
    .limit(limit);
};

const findOrCreateByKey = async (sectionKey, actor) => {
  let section = await HomeSection.findOne({ sectionKey });
  if (section) return section;

  const defaults = SECTION_DEFAULTS[sectionKey] || {};
  section = await HomeSection.create({
    sectionKey,
    sectionName: defaults.sectionName || sectionKey,
    title: defaults.title ?? '',
    subtitle: defaults.subtitle ?? '',
    viewAllText: defaults.viewAllText ?? 'View All',
    viewAllUrl: defaults.viewAllUrl ?? '/shop',
    sortBy: defaults.sortBy || 'latest',
    limit: defaults.limit ?? 6,
    promoBanners: defaults.promoBanners || [],
    hotDealsTitle: defaults.hotDealsTitle || 'Hot Deals',
    hotDealsSubtitle: defaults.hotDealsSubtitle || 'Limited quantity, hurry up!',
    hotDealsBaselineStock: defaults.hotDealsBaselineStock || 100,
    singleBanner: defaults.singleBanner || {},
    createdBy: actor || 'admin',
  });
  return section;
};

const populateForResponse = (queryOrDoc) =>
  queryOrDoc
    .populate('heroProduct')
    .populate('filters.categories', 'title')
    .populate('filters.brands', 'title')
    .populate('manualProducts', 'title mainImage pricing slug status');

exports.getAllHomeSections = async (req, res, next) => {
  try {
    const sections = await HomeSection.find().sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      data: sections,
      message: 'Home sections fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getHomeSectionByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const actor = req.user?.email || 'admin';

    let section = await HomeSection.findOne({ sectionKey: key });
    if (!section) {
      section = await findOrCreateByKey(key, actor);
    }
    section = await populateForResponse(HomeSection.findById(section._id));

    const products = await resolveProducts(section);

    res.status(200).json({
      success: true,
      data: { section, products },
      message: 'Home section fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.upsertHomeSection = async (req, res, next) => {
  try {
    const { key } = req.params;
    const actor = req.user?.email || 'admin';
    const payload = req.body || {};

    let section = await HomeSection.findOne({ sectionKey: key });
    if (!section) {
      section = await findOrCreateByKey(key, actor);
    }

    const allowed = [
      'sectionName',
      'enabled',
      'title',
      'subtitle',
      'viewAllText',
      'viewAllUrl',
      'heroProduct',
      'filterType',
      'manualProducts',
      'sortBy',
      'limit',
      'promoBanners',
      'hotDealsTitle',
      'hotDealsSubtitle',
      'hotDealsCountdownEnd',
      'hotDealsBaselineStock',
    ];
    allowed.forEach((field) => {
      if (payload[field] !== undefined) section[field] = payload[field];
    });

    if (payload.singleBanner && typeof payload.singleBanner === 'object') {
      section.singleBanner = {
        ...(section.singleBanner?.toObject?.() ?? section.singleBanner ?? {}),
        ...payload.singleBanner,
      };
    }

    if (payload.filters && typeof payload.filters === 'object') {
      section.filters = { ...section.filters?.toObject?.() ?? section.filters, ...payload.filters };
    }
    if (payload.badges && typeof payload.badges === 'object') {
      section.badges = { ...section.badges?.toObject?.() ?? section.badges, ...payload.badges };
    }

    section.updatedBy = actor;
    await section.save();

    section = await populateForResponse(HomeSection.findById(section._id));
    const products = await resolveProducts(section);

    res.status(200).json({
      success: true,
      data: { section, products },
      message: 'Home section updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteHomeSection = async (req, res, next) => {
  try {
    const { key } = req.params;
    const deleted = await HomeSection.findOneAndDelete({ sectionKey: key });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    res.status(200).json({
      success: true,
      data: deleted,
      message: 'Home section deleted',
    });
  } catch (error) {
    next(error);
  }
};
