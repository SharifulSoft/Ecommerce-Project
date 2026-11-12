import React, { createContext, useContext, useState } from 'react';

const AdminSidebarContext = createContext();

export function AdminSidebarProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <AdminSidebarContext.Provider value={{ isExpanded, toggleSidebar }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error('useAdminSidebar must be used within AdminSidebarProvider');
  }
  return context;
}

