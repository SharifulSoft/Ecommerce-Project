import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { useAdminSidebar } from '../context/AdminSidebarContext';

export default function AdminLayout({ children }) {
  const { isExpanded } = useAdminSidebar();

  return (
    <div className="pt-6 flex">
      <AdminSidebar />
      <main
        className={`flex-1 mt-16 transition-all duration-300 ease-in-out bg-gray-50 min-h-[calc(100vh-64px)] print:ml-0 print:mt-0 ${
          isExpanded ? 'ml-56' : 'ml-20'
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

