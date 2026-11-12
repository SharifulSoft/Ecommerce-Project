import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  ProfileSidebar,
  ProfilePersonalInfo,
  ProfileAddresses,
  ProfileOrders,
  ProfileReturns,
  ProfileReviews,
  ProfileWishlist,
  ProfilePayment,
  ProfileChangePassword,
} from '../components/Profile';

const VALID_SECTIONS = [
  'personal-info',
  'addresses',
  'orders',
  'returns',
  'reviews',
  'wishlist',
  'payment',
  'password',
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionFromUrl = searchParams.get('section');
  const initialSection = VALID_SECTIONS.includes(sectionFromUrl) ? sectionFromUrl : 'personal-info';
  const [activeSection, setActiveSection] = useState(initialSection);

  // Keep state in sync if the URL changes (e.g. back/forward navigation)
  useEffect(() => {
    if (sectionFromUrl && VALID_SECTIONS.includes(sectionFromUrl) && sectionFromUrl !== activeSection) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSectionChange = (next) => {
    setActiveSection(next);
    if (next === 'personal-info') {
      searchParams.delete('section');
    } else {
      searchParams.set('section', next);
    }
    setSearchParams(searchParams, { replace: true });
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No profile available</h2>
          <p className="text-gray-600">Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'personal-info':
        return <ProfilePersonalInfo />;
      case 'addresses':
        return <ProfileAddresses />;
      case 'orders':
        return <ProfileOrders />;
      case 'returns':
        return <ProfileReturns />;
      case 'reviews':
        return <ProfileReviews />;
      case 'wishlist':
        return <ProfileWishlist />;
      case 'payment':
        return <ProfilePayment />;
      case 'password':
        return <ProfileChangePassword />;
      default:
        return <ProfilePersonalInfo />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="max-w-[85rem] mx-auto px-4 md:px-6">
        {/* Header */}
        {/* <div className="mb-6 md:mb-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
          <button
            onClick={logout}
            className="px-3 md:px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm md:text-base transition-colors"
          >
            Logout
          </button>
        </div> */}

        {/* Main Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <ProfileSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              onLogout={logout}
            />
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
