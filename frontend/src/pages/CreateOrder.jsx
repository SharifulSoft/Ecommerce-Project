import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import orderService from '../services/orderService';

export default function CreateOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingCharge, setShippingCharge] = useState(0);

  useEffect(() => {
    // Fetch users and products
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchUsers = async () => {
    try {
      // This would call your user API
      // const response = await userService.getAllUsers();
      // setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      // This would call your product API
      // const response = await productService.getAllProducts();
      // setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!selectedUser) {
        toast.error('Please select a customer');
        setLoading(false);
        return;
      }

      if (selectedProducts.length === 0) {
        toast.error('Please select at least one product');
        setLoading(false);
        return;
      }

      const orderData = {
        userId: selectedUser,
        items: selectedProducts,
        shippingAddress,
        paymentMethod,
        shippingCharge: parseFloat(shippingCharge),
      };

      await orderService.createOrder(orderData);
      toast.success('Order created successfully');
      navigate('/admin/orders');
    } catch (error) {
      toast.error(error.message || 'Failed to create order');
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
        <p className="text-gray-600 mt-1">Create a new order for a customer</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Customer <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          >
            <option value="">Choose a customer...</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Products Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Products <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4">
            {products.map((product) => (
              <label key={product._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={product._id}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedProducts([...selectedProducts, product._id]);
                    } else {
                      setSelectedProducts(selectedProducts.filter((id) => id !== product._id));
                    }
                  }}
                  className="w-4 h-4 text-teal-600 rounded"
                />
                <span className="text-gray-700">{product.title}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={shippingAddress.firstName}
              onChange={handleAddressChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={shippingAddress.lastName}
              onChange={handleAddressChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Order'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="flex-1 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

