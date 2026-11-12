import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import CouponForm from '../components/CouponForm';

export default function EditCoupon() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCoupon();
  }, [id]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Format: YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fetchCoupon = async () => {
    try {
      const response = await api.get(`/coupons/${id}`);
      const couponData = response.data.data;

      // Format dates for datetime-local input
      if (couponData.validityPeriod) {
        couponData.validityPeriod.startDate = formatDateForInput(couponData.validityPeriod.startDate);
        couponData.validityPeriod.endDate = formatDateForInput(couponData.validityPeriod.endDate);
      }

      setCoupon(couponData);
    } catch (error) {
      toast.error('Failed to fetch coupon');
      navigate('/admin/coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await api.put(`/coupons/${id}`, formData);

      toast.success('Coupon updated successfully');
      navigate('/admin/coupons');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update coupon');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading coupon...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Coupon</h1>
        <p className="text-gray-600 mt-1">Update coupon details and conditions</p>
      </div>

      {/* Form */}
      {coupon && <CouponForm initialData={coupon} onSubmit={handleSubmit} loading={submitting} />}
    </div>
  );
}

