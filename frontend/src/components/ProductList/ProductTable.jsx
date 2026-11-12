import React from 'react';
import ProductActions from './ProductActions';

export default function ProductTable({ products, onView, onEdit, onDelete, isLoading }) {
  console.log('ProductTable rendered - isLoading:', isLoading, 'products:', products);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-600 text-lg">No products found</p>
        <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sale</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Stock</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
              {/* Product with Image */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {product.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-xs text-gray-600">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.title}
                    </p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                  </div>
                </div>
              </td>

              {/* Product ID */}
              <td className="px-4 py-3">
                <p className="text-sm text-gray-600 font-mono font-bold">
                  #{product.productId || 'N/A'}
                </p>
              </td>

              {/* Price */}
              <td className="px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">
                  ${product.pricing?.price?.toFixed(2) || '0.00'}
                </p>
              </td>

              {/* Quantity */}
              <td className="px-4 py-3">
                <p className="text-sm text-gray-600">
                  {product.inventory?.stockQuantity || 0}
                </p>
              </td>

              {/* Sale */}
              <td className="px-4 py-3">
                {product.pricing?.salePrice ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ${product.pricing.salePrice.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </td>

              {/* Stock Status */}
              <td className="px-4 py-3">
                {product.inventory?.stockQuantity > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                )}
              </td>

              {/* Start Date */}
              <td className="px-4 py-3">
                <p className="text-sm text-gray-600">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex justify-center">
                  <ProductActions
                    productId={product._id}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

