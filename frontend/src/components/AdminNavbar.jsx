import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAdminSidebar } from '../context/AdminSidebarContext';

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isExpanded } = useAdminSidebar();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 bg-white text-gray-800 shadow-md z-30 h-16 transition-all duration-300 ease-in-out print:hidden ${
      isExpanded ? 'pl-56' : 'pl-20'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Search Bar - Centered */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
            <input
              type="text"
              placeholder="Search Fastkart..."
              className="bg-transparent outline-none text-sm w-full"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded ml-2">
              🔍
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Theme Toggle */}
            <button className="p-2 text-gray-600 hover:text-gray-900">
              🌙
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName || user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-semibold">
                  {(user?.firstName || user?.username || 'A')[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 px-3 py-2 rounded text-white text-sm"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
