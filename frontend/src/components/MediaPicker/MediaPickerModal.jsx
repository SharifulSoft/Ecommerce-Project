import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Search,
  Grid3x3,
  List,
  Check,
  Loader2,
  Image as ImageIcon,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import mediaService from '../../services/mediaService';

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  category = '', // Empty by default to show all categories
  maxSelections = 10,
  title = 'Select Media',
}) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(''); // User-controlled category filter
  const [folderFilter, setFolderFilter] = useState('');
  const [folders, setFolders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFolder, setUploadFolder] = useState('general');
  const [uploadCategory, setUploadCategory] = useState(category || 'general');
  const [uploading, setUploading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0, pages: 0 });
  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'upload'
  const fileInputRef = useRef(null);

  // Fetch media
  const fetchMedia = async (page = 1) => {
    setLoading(true);
    try {
      console.log('🔍 Fetching media with params:', {
        searchTerm,
        categoryFilter,
        folderFilter,
        status: 'active',
        page,
        limit: pagination.limit
      });
      
      const response = await mediaService.getAllMedia(
        searchTerm,
        categoryFilter, // Use the user-controlled filter instead of prop
        folderFilter,
        'active',
        page,
        pagination.limit
      );
      
      console.log('✅ Media API Response:', response);
      console.log('📦 Media data:', response.data);
      console.log('📊 Pagination:', response.pagination);
      
      setMedia(response.data || []);
      setPagination(response.pagination || { page: 1, limit: 24, total: 0, pages: 0 });
    } catch (err) {
      console.error('❌ Error fetching media:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      toast.error(err.message || 'Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  // Fetch folders
  const fetchFolders = async () => {
    try {
      const response = await mediaService.getFolders(categoryFilter);
      setFolders(response.data || []);
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await mediaService.getAllMedia('', '', '', 'active', 1, 1000);
      if (response.data) {
        const uniqueCategories = [...new Set(response.data.map(m => m.category))].filter(Boolean);
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchMedia(1);
    }
  }, [isOpen]); // Only refetch when modal opens
  
  // Fetch folders when category filter changes
  useEffect(() => {
    if (isOpen) {
      fetchFolders();
    }
  }, [isOpen, categoryFilter]);
  
  // Separate effect for search and filter changes
  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        fetchMedia(1);
      }, 300); // Debounce search
      
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, categoryFilter, folderFilter]);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedMedia = [];

      for (let i = 0; i < files.length; i++) {
        const response = await mediaService.uploadMedia(
          files[i],
          uploadFolder,
          uploadCategory, // Use the selected category for upload
          '',
          ''
        );
        uploadedMedia.push(response.data);
      }

      toast.success(`Successfully uploaded ${uploadedMedia.length} file(s)`);
      
      // Refresh media list
      await fetchMedia(1);
      
      // Switch to library tab
      setActiveTab('library');
      
      // Auto-select newly uploaded items if in multiple mode
      if (multiple) {
        setSelectedItems([...selectedItems, ...uploadedMedia]);
      } else if (uploadedMedia.length > 0) {
        setSelectedItems([uploadedMedia[0]]);
      }
      
      // Reset upload form
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload media');
      console.error('Error uploading media:', err);
    } finally {
      setUploading(false);
    }
  };

  // Handle media selection
  const handleMediaSelect = (item) => {
    if (multiple) {
      const isSelected = selectedItems.some((m) => m._id === item._id);
      if (isSelected) {
        setSelectedItems(selectedItems.filter((m) => m._id !== item._id));
      } else {
        if (selectedItems.length < maxSelections) {
          setSelectedItems([...selectedItems, item]);
        } else {
          toast.warning(`Maximum ${maxSelections} items can be selected`);
        }
      }
    } else {
      setSelectedItems([item]);
    }
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select at least one media item');
      return;
    }

    if (multiple) {
      onSelect(selectedItems);
    } else {
      onSelect(selectedItems[0]);
    }
    
    handleClose();
  };

  // Handle close
  const handleClose = () => {
    setSelectedItems([]);
    setSearchTerm('');
    setFolderFilter('');
    setActiveTab('library');
    onClose();
  };

  // Check if item is selected
  const isItemSelected = (item) => {
    return selectedItems.some((m) => m._id === item._id);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden"
      onClick={(e) => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            {selectedItems.length > 0 && (
              <p className="text-sm text-teal-600 mt-1">
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`px-6 py-3 font-medium transition border-b-2 ${
                activeTab === 'library'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon size={18} />
                <span>Media Library</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 font-medium transition border-b-2 ${
                activeTab === 'upload'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Upload size={18} />
                <span>Upload New</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'library' ? (
            <div className="h-full flex flex-col">
              {/* Filters */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search media..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  {/* Category Filter */}
                  {categories.length > 0 && (
                    <div className="relative min-w-[180px]">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Folder Filter */}
                  {folders.length > 0 && (
                    <div className="relative">
                      <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        value={folderFilter}
                        onChange={(e) => setFolderFilter(e.target.value)}
                        className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
                      >
                        <option value="">All Folders</option>
                        {folders.map((folder) => (
                          <option key={folder} value={folder}>
                            {folder}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* View Mode */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition ${
                        viewMode === 'grid'
                          ? 'bg-teal-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Grid3x3 size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition ${
                        viewMode === 'list'
                          ? 'bg-teal-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <List size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => fetchMedia(pagination.page)}
                      disabled={loading}
                      className="p-2 bg-white text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Media Grid/List */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-teal-500" size={48} />
                  </div>
                ) : media.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <ImageIcon size={64} />
                    <p className="mt-4 text-lg">No media found</p>
                    <p className="text-sm">Try adjusting your filters or upload new media</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {media.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleMediaSelect(item)}
                        className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          isItemSelected(item)
                            ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-50'
                            : 'border-gray-200 hover:border-teal-300'
                        }`}
                      >
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          {item.fileType === 'image' ? (
                            <img
                              src={item.cloudinaryUrl}
                              alt={item.fileName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center text-gray-400">
                              <ImageIcon size={48} />
                              <span className="text-xs mt-2">{item.fileType}</span>
                            </div>
                          )}
                        </div>
                        {isItemSelected(item) && (
                          <div className="absolute inset-0 bg-teal-500 bg-opacity-20 flex items-center justify-center">
                            <div className="bg-teal-500 text-white rounded-full p-2">
                              <Check size={24} />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs truncate">{item.fileName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {media.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleMediaSelect(item)}
                        className={`flex items-center gap-4 p-3 rounded-lg border-2 cursor-pointer transition ${
                          isItemSelected(item)
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          {item.fileType === 'image' ? (
                            <img
                              src={item.cloudinaryUrl}
                              alt={item.fileName}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <ImageIcon size={32} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.fileName}</p>
                          <p className="text-sm text-gray-500">
                            {item.folder} • {(item.fileSize / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        {isItemSelected(item) && (
                          <div className="bg-teal-500 text-white rounded-full p-1 flex-shrink-0">
                            <Check size={20} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-6 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fetchMedia(pagination.page - 1)}
                      disabled={pagination.page === 1 || loading}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 bg-gray-100 rounded-lg">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      type="button"
                      onClick={() => fetchMedia(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages || loading}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 h-full overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Category
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="products">Products</option>
                      <option value="categories">Categories</option>
                      <option value="brands">Brands</option>
                      <option value="banners">Banners</option>
                      <option value="blog">Blog</option>
                      {categories.filter(c => !['general', 'products', 'categories', 'brands', 'banners', 'blog'].includes(c)).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Folder
                    </label>
                    <select
                      value={uploadFolder}
                      onChange={(e) => setUploadFolder(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      {folders.map((folder) => (
                        <option key={folder} value={folder}>
                          {folder}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin text-teal-500 mb-4" size={48} />
                      <p className="text-gray-600">Uploading...</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-16 w-16 text-teal-500 mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Click to upload {multiple ? 'files' : 'a file'}
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, GIF up to 10MB
                        {multiple && ' (Multiple files supported)'}
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple={multiple}
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>

                {uploading && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      Please wait while we upload your files to Cloudinary...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {multiple
              ? `${selectedItems.length} / ${maxSelections} items selected`
              : selectedItems.length > 0
              ? '1 item selected'
              : 'No items selected'}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedItems.length === 0}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Select {selectedItems.length > 0 && `(${selectedItems.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
