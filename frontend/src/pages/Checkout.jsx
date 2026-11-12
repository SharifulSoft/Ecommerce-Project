import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { clearCart } from '../store/cartSlice';
import { ROUTES } from '../routes/routeConstants';
import api from '../services/api';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const cartState = useSelector((state) => state.cart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    shippingMethod: 'standard',
    paymentMethod: 'cod',
  });

  const [errors, setErrors] = useState({});

  // Check if user is logged in
  useEffect(() => {
    if (!auth.user || !auth.token) {
      toast.error('Please log in to proceed with checkout');
      navigate(ROUTES.LOGIN, { state: { from: ROUTES.CHECKOUT } });
    }
  }, [auth.user, auth.token, navigate]);

  // Check if cart is empty
  useEffect(() => {
    if (cartState.items.length === 0) {
      toast.error('Your cart is empty');
      navigate(ROUTES.CART);
    }
  }, [cartState.items, navigate]);

  // Load default shipping address from user profile
  useEffect(() => {
    if (auth.user && auth.user.addresses && auth.user.addresses.length > 0) {
      // Find the default shipping address
      const defaultShippingAddress = auth.user.addresses.find(
        (addr) => addr.addressType === 'Shipping' && addr.isDefault === true
      );

      if (defaultShippingAddress) {
        // Pre-fill form with default shipping address
        setFormData((prev) => ({
          ...prev,
          firstName: defaultShippingAddress.firstName || '',
          lastName: defaultShippingAddress.lastName || '',
          email: defaultShippingAddress.email || auth.user.email || '',
          phoneNumber: defaultShippingAddress.phoneNumber || auth.user.phoneNumber || '',
          street: defaultShippingAddress.street || '',
          city: defaultShippingAddress.city || '',
          state: defaultShippingAddress.state || '',
          zipCode: defaultShippingAddress.zipCode || '',
          country: defaultShippingAddress.country || '',
        }));
      } else {
        // If no default shipping address, use user's basic info
        setFormData((prev) => ({
          ...prev,
          firstName: auth.user.firstName || '',
          lastName: auth.user.lastName || '',
          email: auth.user.email || '',
          phoneNumber: auth.user.phoneNumber || '',
        }));
      }
    }
  }, [auth.user]);

  // Calculate totals
  const subtotal = cartState.totalAmount;
  const discount = cartState.discount || 0;
  const shippingCost = formData.shippingMethod === 'express' ? 100 : 0;
  const total = subtotal - discount + shippingCost;

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      // Map cart items to order items format with productId
      const orderItems = cartState.items.map((item) => ({
        productId: item._id, // Map _id to productId
        variantId: item.variation?._id || null,
        title: item.title,
        thumbnail: item.image,
        sku: item.sku,
        attributes: item.variation || null,
        quantity: item.quantity,
        price: item.price,
        salePrice: item.price, // Use same price as salePrice for now
        totalPrice: item.totalPrice,
      }));

      // Prepare order data
      const orderData = {
        items: orderItems,
        cartSubtotal: subtotal,
        shippingCharge: shippingCost,
        discount: discount,
        grandTotal: total,
        shipping: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          shippingMethod: formData.shippingMethod,
        },
        paymentMethod: formData.paymentMethod,
      };

      // Call API to create order using configured api service
      const response = await api.post('/checkout/create-order', orderData);

      toast.success('Order placed successfully!');
      dispatch(clearCart());

      // Redirect to order success page
      setTimeout(() => {
        navigate(`/order-success/${response.data.data._id}`);
      }, 1500);
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!auth.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[85rem] mx-auto">
        {/* Breadcrumb */}
        <div className="mb-8">
          <p className="text-sm text-gray-600">
            <Link to={ROUTES.HOME} className="hover:text-gray-900">
              Home
            </Link>
            {' / '}
            <Link to={ROUTES.CART} className="hover:text-gray-900">
              Cart
            </Link>
            {' / '}
            <span className="text-gray-900">Checkout</span>
          </p>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Form */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 000-0000"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      errors.street ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.street}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="New York"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="NY"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10001"
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="United States"
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Method</h2>
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="standard"
                    checked={formData.shippingMethod === 'standard'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-gray-900">Standard Shipping</p>
                    <p className="text-sm text-gray-600">Free - Delivery in 5-7 business days</p>
                  </div>
                  <span className="font-semibold text-gray-900">Free</span>
                </label>

                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="express"
                    checked={formData.shippingMethod === 'express'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <div className="ml-4 flex-1">
                    <p className="font-semibold text-gray-900">Express Shipping</p>
                    <p className="text-sm text-gray-600">Delivery in 1-2 business days</p>
                  </div>
                  <span className="font-semibold text-gray-900">$100</span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
              <div className="space-y-4">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Cash On Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-20 space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

              {/* Cart Items Preview */}
              <div className="max-h-64 overflow-y-auto border-b border-gray-200 pb-4">
                {cartState.items.map((item) => (
                  <div key={item._id || item.cartItemId} className="flex justify-between mb-3 text-sm">
                    <span className="text-gray-600">
                      {item.title} x {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${(item.totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="flex justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="flex justify-between pb-4 border-b border-gray-200">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-green-600">-${discount.toFixed(2)}</span>
                </div>
              )}

              {/* Shipping */}
              <div className="flex justify-between pb-4 border-b border-gray-200">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-gray-900">
                  {shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">${total.toFixed(2)}</span>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-gray-900 text-white py-3 rounded font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>

              {/* Info */}
              <p className="text-xs text-gray-600 text-center">
                Your order is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

