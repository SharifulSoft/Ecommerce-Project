import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';

export default function ProfileAddresses() {
  const { user: initialUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    addressType: 'Shipping',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    email: '',
    phoneNumber: '',
    isDefault: false,
  });

  useEffect(() => {
    if (initialUser?.addresses) {
      setAddresses(initialUser.addresses);
    }
  }, [initialUser]);

  // Pre-fill name, email and phone from user profile when adding new address
  useEffect(() => {
    if (initialUser && !editingId) {
      setFormData((prev) => ({
        ...prev,
        firstName: initialUser.firstName || '',
        lastName: initialUser.lastName || '',
        email: initialUser.email || '',
        phoneNumber: initialUser.phoneNumber || '',
      }));
    }
  }, [initialUser, isAdding, editingId]);

  const resetForm = () => {
    setFormData({
      addressType: 'Shipping',
      firstName: initialUser?.firstName || '',
      lastName: initialUser?.lastName || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      email: initialUser?.email || '',
      phoneNumber: initialUser?.phoneNumber || '',
      isDefault: false,
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await authService.updateAddress(editingId, formData);
        toast.success('Address updated successfully!');
      } else {
        await authService.addAddress(formData);
        toast.success('Address added successfully!');
      }
      resetForm();
      // Refresh user data
      const updatedUser = await authService.getProfile();
      setAddresses(updatedUser.addresses || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address._id);
    setIsAdding(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await authService.deleteAddress(addressId);
        toast.success('Address deleted successfully!');
        const updatedUser = await authService.getProfile();
        setAddresses(updatedUser.addresses || []);
      } catch (error) {
        toast.error('Failed to delete address');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">My Addresses</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium text-sm md:text-base"
          >
            + Add Address
          </button>
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 mb-6 p-4 md:p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
              <select
                name="addressType"
                value={formData.addressType}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Shipping">Shipping</option>
                <option value="Billing">Billing</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mailing Address</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label className="text-sm text-gray-700">Set as default address</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 md:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium text-sm md:text-base"
            >
              {loading ? 'Saving...' : editingId ? 'Update Address' : 'Add Address'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm md:text-base"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {addresses.length === 0 ? (
        <div className="text-center py-8 md:py-12">
          <p className="text-gray-500 text-sm md:text-base mb-4">No addresses added yet</p>
          <button
            onClick={() => setIsAdding(true)}
            className="text-blue-500 hover:text-blue-600 font-medium text-sm md:text-base"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {addresses.map((address) => (
            <div key={address._id} className="border border-gray-200 rounded-lg p-4 md:p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{address.addressType}</h3>
                  {address.isDefault && (
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      Default
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-1">{address.firstName} {address.lastName}</p>
              <p className="text-sm text-gray-600 mb-1">{address.street}</p>
              <p className="text-sm text-gray-600 mb-1">
                {address.city}, {address.state} {address.zipCode}
              </p>
              <p className="text-sm text-gray-600 mb-3">{address.country}</p>
              {address.email && <p className="text-sm text-gray-600 mb-1">{address.email}</p>}
              {address.phoneNumber && <p className="text-sm text-gray-600 mb-3">{address.phoneNumber}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(address)}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address._id)}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

