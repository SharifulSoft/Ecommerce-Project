const PageSettings = require('../models/PageSettings');

// Get all page settings
exports.getAllPageSettings = async (req, res, next) => {
  try {
    const pageSettings = await PageSettings.find();
    res.status(200).json({
      success: true,
      data: pageSettings,
      message: 'Page settings fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get page settings by pageId
exports.getPageSettingsByPageId = async (req, res, next) => {
  try {
    const { pageId } = req.params;

    const pageSettings = await PageSettings.findOne({ pageId });

    if (!pageSettings) {
      return res.status(404).json({
        success: false,
        message: 'Page settings not found',
      });
    }

    res.status(200).json({
      success: true,
      data: pageSettings,
      message: 'Page settings fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Create page settings
exports.createPageSettings = async (req, res, next) => {
  try {
    const { pageId, pageName, description, ...settings } = req.body;

    // Check if page settings already exists
    const existingSettings = await PageSettings.findOne({ pageId });
    if (existingSettings) {
      return res.status(400).json({
        success: false,
        message: 'Page settings already exists for this page',
      });
    }

    const pageSettings = await PageSettings.create({
      pageId,
      pageName,
      description,
      ...settings,
      createdBy: req.user?.email || 'admin',
    });

    res.status(201).json({
      success: true,
      data: pageSettings,
      message: 'Page settings created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update page settings
exports.updatePageSettings = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { pageName, description, ...settings } = req.body;

    let pageSettings = await PageSettings.findOne({ pageId });

    if (!pageSettings) {
      return res.status(404).json({
        success: false,
        message: 'Page settings not found',
      });
    }

    // Update fields
    if (pageName) pageSettings.pageName = pageName;
    if (description) pageSettings.description = description;

    // Update nested settings
    Object.keys(settings).forEach((key) => {
      if (pageSettings[key] && typeof pageSettings[key] === 'object') {
        pageSettings[key] = { ...pageSettings[key], ...settings[key] };
      } else {
        pageSettings[key] = settings[key];
      }
    });

    pageSettings.updatedBy = req.user?.email || 'admin';
    await pageSettings.save();

    res.status(200).json({
      success: true,
      data: pageSettings,
      message: 'Page settings updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Update specific page setting toggle
exports.updatePageSettingToggle = async (req, res, next) => {
  try {
    const { pageId } = req.params;
    const { settingPath, value } = req.body;

    const pageSettings = await PageSettings.findOne({ pageId });

    if (!pageSettings) {
      return res.status(404).json({
        success: false,
        message: 'Page settings not found',
      });
    }

    // Handle nested path like "cartPageSettings.showCouponSection"
    const keys = settingPath.split('.');
    let obj = pageSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;
    pageSettings.updatedBy = req.user?.email || 'admin';
    await pageSettings.save();

    res.status(200).json({
      success: true,
      data: pageSettings,
      message: 'Page setting updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Initialize default page settings
exports.initializeDefaultSettings = async (req, res, next) => {
  try {
    const defaultPages = [
      {
        pageId: 'home',
        pageName: 'Home Page',
        description: 'Settings for the home page',
      },
      {
        pageId: 'cart',
        pageName: 'Cart Page',
        description: 'Settings for the shopping cart page',
      },
      {
        pageId: 'checkout',
        pageName: 'Checkout Page',
        description: 'Settings for the checkout page',
      },
      {
        pageId: 'product-detail',
        pageName: 'Product Detail Page',
        description: 'Settings for the product detail page',
      },
      {
        pageId: 'category',
        pageName: 'Category Page',
        description: 'Settings for the category page',
      },
      {
        pageId: 'search',
        pageName: 'Search Page',
        description: 'Settings for the search page',
      },
    ];

    const createdSettings = [];

    for (const page of defaultPages) {
      const existing = await PageSettings.findOne({ pageId: page.pageId });
      if (!existing) {
        const newSettings = await PageSettings.create({
          ...page,
          createdBy: req.user?.email || 'admin',
        });
        createdSettings.push(newSettings);
      }
    }

    res.status(201).json({
      success: true,
      data: createdSettings,
      message: `${createdSettings.length} default page settings initialized`,
    });
  } catch (error) {
    next(error);
  }
};

