import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit2, Trash2, Plus, ChevronLeft, ChevronRight, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import userService from '../services/userService';
import UserModal from '../components/UserModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

// Helper function to generate avatar with initials
const AvatarWithFallback = ({ avatar, email, name }) => {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }

  const initial = email?.charAt(0).toUpperCase() || '?';
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
  const colorIndex = email?.charCodeAt(0) % colors.length || 0;

  return (
    <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm`}>
      {initial}
    </div>
  );
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [itemsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'view', 'edit', 'add'
  const [deleteUserId, setDeleteUserId] = useState(null);

  // Fetch users
  const fetchUsers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers(page, itemsPerPage, search);
      setUsers(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalUsers(response.total || 0);
      setCurrentPage(page);
    } catch (err) {
      const errorMsg = err.error || err.message || 'Failed to fetch users';
      toast.error(errorMsg);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, searchTerm);
  }, [itemsPerPage]);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    fetchUsers(1, value);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchUsers(page, searchTerm);
    }
  };

  // Handle view user
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalMode('view');
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
  };

  // Handle add user
  const handleAddUser = () => {
    setSelectedUser(null);
    setModalMode('add');
  };

  // Handle delete user
  const handleDeleteUser = (userId) => {
    setDeleteUserId(userId);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await userService.deleteUser(deleteUserId);
      setDeleteUserId(null);
      toast.success('User deleted successfully');
      fetchUsers(currentPage, searchTerm);
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  // Handle ban user from reviews
  const handleBanUser = async (userId) => {
    try {
      const response = await userService.banUserFromReviews(userId, 'Banned by admin');

      // Update local state with the response from server
      if (response.user) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId
              ? {
                  ...user,
                  isReviewBanned: response.user.isReviewBanned,
                  reviewBanReason: response.user.reviewBanReason,
                }
              : user
          )
        );
      }

      toast.success('User banned from submitting reviews');
    } catch (err) {
      console.error('Error banning user:', err);
      toast.error(err.message || 'Failed to ban user');
      // Refresh to ensure UI is in sync with server on error
      fetchUsers(currentPage, searchTerm);
    }
  };

  // Handle permit user for reviews
  const handlePermitUser = async (userId) => {
    try {
      const response = await userService.permitUserForReviews(userId);

      // Update local state with the response from server
      if (response.user) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId
              ? {
                  ...user,
                  isReviewBanned: response.user.isReviewBanned,
                  reviewBanReason: response.user.reviewBanReason,
                }
              : user
          )
        );
      }

      toast.success('User permitted to submit reviews');
    } catch (err) {
      console.error('Error permitting user:', err);
      toast.error(err.message || 'Failed to permit user');
      // Refresh to ensure UI is in sync with server on error
      fetchUsers(currentPage, searchTerm);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  // Handle user save
  const handleUserSave = async (userData) => {
    try {
      if (modalMode === 'add') {
        await userService.createUser(userData);
      } else if (modalMode === 'edit') {
        await userService.updateUser(selectedUser.id, userData);
      }
      handleModalClose();
      fetchUsers(currentPage, searchTerm);
    } catch (err) {
      setError(err.message || 'Failed to save user');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 text-sm mt-1">Manage all users in your system</p>
        </div>

        {/* Search + Add button row */}
        <div className="flex items-center justify-between w-full gap-4">
          <div className="w-full md:w-2/3 lg:w-1/2">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <button
              onClick={handleAddUser}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors w-full md:w-auto justify-center"
            >
              <Plus size={20} />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Search moved into header above */}

      {/* Users Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Review Ban</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <AvatarWithFallback avatar={user.avatar} email={user.email} name={user.name} />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 text-gray-700">{user.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.role === 'admin'
                        ? 'bg-red-100 text-red-700'
                        : user.role === 'vendor'
                        ? 'bg-green-100 text-green-700'
                        : user.role === 'moderator'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.isReviewBanned ? (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                        Banned
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        Allowed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      {user.isReviewBanned ? (
                        <button
                          onClick={() => handlePermitUser(user.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Permit Reviews"
                        >
                          <CheckCircle size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBanUser(user.id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          title="Ban from Reviews"
                        >
                          <Ban size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No users found</div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12">
                  <AvatarWithFallback avatar={user.avatar} email={user.email} name={user.name} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.username}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <p className="text-gray-700"><span className="font-medium">Email:</span> {user.email}</p>
                <p className="text-gray-700"><span className="font-medium">Phone:</span> {user.phone || '-'}</p>
                <p className="text-gray-700">
                  <span className="font-medium">Role:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-red-100 text-red-700'
                      : user.role === 'vendor'
                      ? 'bg-green-100 text-green-700'
                      : user.role === 'moderator'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Review Ban:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    user.isReviewBanned
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {user.isReviewBanned ? 'Banned' : 'Allowed'}
                  </span>
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleViewUser(user)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors text-sm"
                >
                  <Eye size={16} /> View
                </button>
                <button
                  onClick={() => handleEditUser(user)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors text-sm"
                >
                  <Edit2 size={16} /> Edit
                </button>
                {user.isReviewBanned ? (
                  <button
                    onClick={() => handlePermitUser(user.id)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors text-sm"
                  >
                    <CheckCircle size={16} /> Permit
                  </button>
                ) : (
                  <button
                    onClick={() => handleBanUser(user.id)}
                    className="flex-1 flex items-center justify-center gap-2 p-2 text-orange-600 bg-orange-50 rounded hover:bg-orange-100 transition-colors text-sm"
                  >
                    <Ban size={16} /> Ban
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="flex-1 flex items-center justify-center gap-2 p-2 text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors text-sm"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {users.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-teal-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modalMode && (
        <UserModal
          mode={modalMode}
          user={selectedUser}
          onClose={handleModalClose}
          onSave={handleUserSave}
        />
      )}

      {deleteUserId && (
        <DeleteConfirmModal
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteUserId(null)}
        />
      )}
    </div>
  );
}

