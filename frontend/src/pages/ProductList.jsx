import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import ProductSearch from '../components/ProductList/ProductSearch';
import ProductTable from '../components/ProductList/ProductTable';
import ProductPagination from '../components/ProductList/ProductPagination';
import DeleteProductModal from '../components/ProductList/DeleteProductModal';
import ProductImportExport from '../components/ProductList/ProductImportExport';
import api from '../services/api';

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: '',
    isDeleting: false,
  });

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching products from API...');
      const response = await api.get('/products');
      console.log('Products response:', response.data);
      const productsData = response.data.data || [];
      console.log('Products data:', productsData);
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch products';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);

    if (!term.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      const searchLower = term.toLowerCase();
      return (
        product.title?.toLowerCase().includes(searchLower) ||
        product.sku?.toLowerCase().includes(searchLower) ||
        product._id?.toLowerCase().includes(searchLower) ||
        product.productId?.toString().includes(searchLower)
      );
    });

    setFilteredProducts(filtered);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    setFilteredProducts(products);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle view product
  const handleViewProduct = (productId) => {
    navigate(`/admin/products/view/${productId}`);
  };

  // Handle edit product
  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  // Handle delete product
  const handleDeleteClick = (productId, productName) => {
    setDeleteModal({
      isOpen: true,
      productId,
      productName,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
      await api.delete(`/products/${deleteModal.productId}`);

      // Remove from local state
      setProducts((prev) => prev.filter((p) => p._id !== deleteModal.productId));
      setFilteredProducts((prev) => prev.filter((p) => p._id !== deleteModal.productId));

      setDeleteModal({ isOpen: false, productId: null, productName: '', isDeleting: false });

      // Show success message
      toast.success('Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error(err.response?.data?.message || 'Failed to delete product');
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, productId: null, productName: '', isDeleting: false });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          {/* Import/Export Buttons */}
          <ProductImportExport products={products} onImportSuccess={fetchProducts} />
        </div>
      </div>

      {/* Search Section with Add New button on the right */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <ProductSearch
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
              onClear={handleClearSearch}
            />
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={() => navigate('/admin/products/add')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition w-full sm:w-auto justify-center sm:justify-end"
            >
              <Plus size={20} />
              Add New Product
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <ProductTable
          products={paginatedProducts}
          onView={handleViewProduct}
          onEdit={handleEditProduct}
          onDelete={handleDeleteClick}
          isLoading={isLoading}
        />
      </div>

      {/* Pagination */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="mt-6">
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newItemsPerPage) => {
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
            totalItems={filteredProducts.length}
          />
        </div>
      )}

      {/* Delete Modal */}
      <DeleteProductModal
        isOpen={deleteModal.isOpen}
        productName={deleteModal.productName}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteModal.isDeleting}
      />
    </div>
  );
}

