import React from 'react';
import { ShoppingCart, Clock, Truck, Package, XCircle } from 'lucide-react';

export default function OrderStats({ stats }) {
  const statItems = [
    {
      icon: ShoppingCart,
      label: 'NEW ORDERS',
      value: stats?.newOrders || 0,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200',
    },
    {
      icon: Clock,
      label: 'PENDING ORDERS',
      value: stats?.pendingOrders || 0,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
      borderColor: 'border-yellow-200',
    },
    {
      icon: Truck,
      label: 'DELIVERED ORDERS',
      value: stats?.deliveredOrders || 0,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500',
      borderColor: 'border-green-200',
    },
    {
      icon: Package,
      label: 'PICKUPS ORDERS',
      value: stats?.pickupOrders || 0,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-200',
    },
    {
      icon: XCircle,
      label: 'CANCELLED ORDERS',
      value: stats?.cancelledOrders || 0,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} border ${stat.borderColor} rounded-lg p-4 flex items-center gap-4`}
          >
            <div className={`${stat.iconColor} p-3 bg-white rounded-lg`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

