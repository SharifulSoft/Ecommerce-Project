import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { User, MapPin, Heart, Package, LogOut, Settings, Star, CreditCard, Cloud } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProfileSidebar({ activeSection, onSectionChange, onLogout }) {
  const { user } = useAuth();
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user?.profilePictureUrl || null);
  const [imageError, setImageError] = useState(false);

  // Update profile picture when user changes
  useEffect(() => {
    if (user?.profilePictureUrl) {
      setProfilePicture(user.profilePictureUrl);
      setImageError(false);
    }
  }, [user?.profilePictureUrl]);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    try {
      const result = await authService.uploadProfilePicture(file);
      setProfilePicture(result.url);
      setImageError(false);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  const menuItems = [
    {
      id: 'personal-info',
      label: 'My Profile',
      icon: User,
      description: 'Personal information',
    },
    {
      id: 'addresses',
      label: 'Address',
      icon: MapPin,
      description: 'Manage addresses',
    },
    {
      id: 'wishlist',
      label: 'My List',
      icon: Heart,
      description: 'Saved items',
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: Package,
      description: 'Order history',
    },
    // {
    //   id: 'reviews',
    //   label: 'My Rating & Reviews',
    //   icon: Star,
    //   description: 'Your reviews',
    // },
    {
      id: 'payment',
      label: 'Payment',
      icon: CreditCard,
      description: 'Payment methods',
    },
    {
      id: 'password',
      label: 'Change Password',
      icon: Settings,
      description: 'Security',
    },
  ];

  return (
    <div className="w-full md:w-72 bg-white rounded-lg shadow-md overflow-hidden">
      {/* Profile Header Section */}
      <div className="bg-white from-gray-50 to-gray-100 p-6 md:p-4 text-center border-b border-gray-200">
        <div className="flex justify-center mb-4">
          <label className="relative cursor-pointer group">
            {profilePicture && !imageError ? (
              <div className="relative">
                <img
                  src={profilePicture}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  onError={() => setImageError(true)}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-lg transition-opacity duration-200 group-hover:opacity-75"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-full bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <Cloud size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl md:text-5xl font-bold shadow-lg border-4 border-white transition-opacity duration-200 group-hover:opacity-75">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <Cloud size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              disabled={uploadingPicture}
              className="hidden"
            />
          </label>
        </div>
        <h3 className="font-bold text-lg md:text-xl text-gray-900 mt-4 truncate">
          {user?.firstName} {user?.lastName}
        </h3>
        {/* <p className="text-sm text-gray-600 truncate mt-1">{user?.email}</p> */}
      </div>

      {/* Menu Items */}
      <nav className="py-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full px-4 md:px-6 py-3 md:py-4 text-left transition-all duration-200 flex items-center gap-4 relative group cursor-pointer ${
                activeSection === item.id
                  ? 'bg-red-50 text-red-600 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {/* Active indicator bar */}
              {activeSection === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
              )}

              <IconComponent
                size={20}
                className={`flex-shrink-0 ${
                  activeSection === item.id ? 'text-red-500' : 'text-gray-600 group-hover:text-gray-900'
                }`}
              />
              <span className="text-sm md:text-base font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full px-4 md:px-6 py-3 md:py-4 text-left transition-all duration-200 flex items-center gap-4 text-gray-700 hover:bg-gray-50 border-t border-gray-200 mt-2"
        >
          <LogOut size={20} className="flex-shrink-0 text-gray-600" />
          <span className="text-sm md:text-base font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
}

