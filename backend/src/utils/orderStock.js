const Product = require('../models/Product');
const ProductVariation = require('../models/ProductVariation');

// Atomically decrement stock for a single order item. Honors trackStock
// (skip when false) and allowBackorder (skip the >= quantity guard).
// Returns { ok: true } on success, { ok: false, message } on failure.
const decrementOne = async (item) => {
  const qty = Number(item.quantity || 0);
  if (qty <= 0) return { ok: true };

  if (item.variantId) {
    const variant = await ProductVariation.findById(item.variantId).select('inventory');
    if (!variant) return { ok: true };
    if (variant.inventory?.trackStock === false) return { ok: true };

    const allowBackorder = variant.inventory?.allowBackorder === true;
    const filter = {
      _id: item.variantId,
      ...(allowBackorder ? {} : { 'inventory.quantity': { $gte: qty } }),
    };
    const result = await ProductVariation.updateOne(filter, {
      $inc: { 'inventory.quantity': -qty },
    });

    if (result.matchedCount === 0) {
      return { ok: false, message: `Insufficient stock for "${item.title || 'variant item'}"` };
    }
    return { ok: true };
  }

  const product = await Product.findById(item.productId).select('inventory adminControls title');
  if (!product) return { ok: true };
  if (product.adminControls?.enableStock === false) return { ok: true };
  if (product.inventory?.trackStock === false) return { ok: true };

  const allowBackorder = product.inventory?.allowBackorder === true;
  const filter = {
    _id: item.productId,
    ...(allowBackorder ? {} : { 'inventory.stockQuantity': { $gte: qty } }),
  };
  const result = await Product.updateOne(filter, {
    $inc: { 'inventory.stockQuantity': -qty },
  });

  if (result.matchedCount === 0) {
    return {
      ok: false,
      message: `Insufficient stock for "${item.title || product.title || 'product'}"`,
    };
  }
  return { ok: true };
};

// Increment stock back for a single item (used when an order is cancelled/returned).
const incrementOne = async (item) => {
  const qty = Number(item.quantity || 0);
  if (qty <= 0) return;

  if (item.variantId) {
    await ProductVariation.updateOne(
      { _id: item.variantId },
      { $inc: { 'inventory.quantity': qty } }
    );
    return;
  }
  if (item.productId) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { 'inventory.stockQuantity': qty } }
    );
  }
};

// Decrement stock for every item in an order. If any item fails (insufficient
// stock), already-decremented items are rolled back so the operation is
// effectively atomic from the caller's perspective.
const decrementStockForOrder = async (items = []) => {
  const decremented = [];
  for (const item of items) {
    const res = await decrementOne(item);
    if (!res.ok) {
      for (const prev of decremented) {
        // Best-effort rollback; ignore individual failures here.
        // eslint-disable-next-line no-await-in-loop
        await incrementOne(prev).catch(() => {});
      }
      return { ok: false, message: res.message };
    }
    decremented.push(item);
  }
  return { ok: true };
};

// Restore stock for every item in an order.
const restoreStockForOrder = async (items = []) => {
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    await incrementOne(item).catch(() => {});
  }
};

module.exports = {
  decrementStockForOrder,
  restoreStockForOrder,
};
