import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import ProductListItem from './ProductListItem';

export default function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);



  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productService.getAllProducts({ status: 'active' });
      const productsData = response.data || [];
      // Get only first 4 products for "New Arrivals"
      setProducts(productsData.slice(0, 4));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">New Arrivals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">New Arrivals</h2>
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">New Arrivals</h2>
        <div className="text-center text-gray-600">No products available</div>
      </div>
    );
  }

  return (
    <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">New Arrivals</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductListItem
            key={product._id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}

