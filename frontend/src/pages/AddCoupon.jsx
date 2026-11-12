import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import CouponForm from '../components/CouponForm';

export default function AddCoupon() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      await api.post('/coupons', formData);

      toast.success('Coupon created successfully');
      navigate('/admin/coupons');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Coupon</h1>
        <p className="text-gray-600 mt-1">Create a new discount coupon with conditions</p>
      </div>

      {/* Form */}
      <CouponForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

