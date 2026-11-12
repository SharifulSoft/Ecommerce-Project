import React, { useState } from 'react';
import { Search, Calendar, X } from 'lucide-react';
import DateRangePicker from '../Common/DateRangePicker';
import { STATUS_OPTIONS } from '../../utils/orderStatus';

export default function OrderFilters({ onFilterChange, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    onFilterChange({ status, startDate, endDate });
  };

  const handleDateChange = (dates) => {
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
    onFilterChange({ status: statusFilter, startDate: dates.startDate, endDate: dates.endDate });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setShowDatePicker(false);
    onFilterChange({ status: '', startDate: '', endDate: '' });
    onSearch('');
  };

  const statusOptions = [{ value: '', label: 'All Status' }, ...STATUS_OPTIONS];

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
      {/* All Filters in One Row on Desktop, Column on Mobile */}
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        {/* Search Bar */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by order ID, customer, order status or something..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>
        {/* Date Range Filter */}
        <div className="md:w-64 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">Date Range</label>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
          >
            <Calendar size={20} className="text-gray-400" />
            <span className="text-gray-700 text-sm truncate">
              {startDate && endDate
                ? `${startDate} → ${endDate}`
                : 'Select date range'}
            </span>
          </button>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="absolute top-full left-0 mt-2 z-50">
              <DateRangePicker
                onDateChange={handleDateChange}
                onClose={() => setShowDatePicker(false)}
                mode="single"
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Button */}
        <button
          onClick={clearFilters}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          <X size={18} />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
}

