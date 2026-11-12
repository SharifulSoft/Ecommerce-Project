import React, { createContext, useContext, useState } from 'react';

const CategoryMenuContext = createContext();

export function CategoryMenuProvider({ children }) {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  const toggleCategoryMenu = () => {
    setIsCategoryMenuOpen((prev) => !prev);
  };

  const closeCategoryMenu = () => {
    setIsCategoryMenuOpen(false);
  };

  const openCategoryMenu = () => {
    setIsCategoryMenuOpen(true);
  };

  return (
    <CategoryMenuContext.Provider
      value={{
        isCategoryMenuOpen,
        toggleCategoryMenu,
        closeCategoryMenu,
        openCategoryMenu,
      }}
    >
      {children}
    </CategoryMenuContext.Provider>
  );
}

export function useCategoryMenu() {
  const context = useContext(CategoryMenuContext);
  if (!context) {
    throw new Error('useCategoryMenu must be used within CategoryMenuProvider');
  }
  return context;
}

