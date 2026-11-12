import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  Eye,
  Grid3x3,
  List,
  FolderOpen,
  Plus,
  X,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import mediaService from '../services/mediaService';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('general');
  const [folderFilter, setFolderFilter] = useState('');
  const [folders, setFolders] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [deleteId, setDeleteId] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFolder, setUploadFolder] = useState('general');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const fileInputRef = useRef(null);

  const categories = ['general', 'products', 'categories', 'brands'];

  // Sync Cloudinary images
  const handleSyncCloudinary = async () => {
    setSyncing(true);
    try {
      const response = await mediaService.syncCloudinaryImages();
      toast.success(`Successfully synced ${response.totalSynced} images from Cloudinary!`);
      // Refresh media list
      fetchMedia(1);
    } catch (err) {
      toast.error(err.message || 'Failed to sync Cloudinary images');
      console.error('Error syncing Cloudinary:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Fetch media
  const fetchMedia = async (page = 1) => {
    setLoading(true);
    try {
      const response = await mediaService.getAllMedia(
        searchTerm,
        categoryFilter,
        folderFilter,
        'active',
        page,
        pagination.limit
      );
      setMedia(response.data || []);
      setPagination(response.pagination);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch media');
      console.error('Error fetching media:', err);
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

  useEffect(() => {
    fetchFolders();
  }, [categoryFilter]);

  useEffect(() => {
    fetchMedia(1);
  }, [searchTerm, categoryFilter, folderFilter]);

  // Handle file upload
  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      await mediaService.uploadMedia(
        uploadFile,
        uploadFolder,
        categoryFilter,
        uploadAltText,
        uploadDescription
      );
      toast.success('Media uploaded successfully');
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadFolder('general');
      setUploadAltText('');
      setUploadDescription('');
      fetchMedia(1);
    } catch (err) {
      toast.error(err.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = (id) => {
    setDeleteId(id);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await mediaService.deleteMedia(deleteId);
      setDeleteId(null);
      toast.success('Media deleted successfully');
      fetchMedia(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete media');
    }
  };

  // Handle download
  const handleDownload = async (media) => {
    try {
      await mediaService.incrementDownloadCount(media._id);
      const link = document.createElement('a');
      link.href = media.cloudinaryUrl;
      link.download = media.fileName;
      link.click();
    } catch (err) {
      console.error('Error downloading media:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Manage your media files and assets</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleSyncCloudinary}
            disabled={syncing}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sync existing Cloudinary images"
          >
            <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Cloudinary'}</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Upload size={20} />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4 md:space-y-0 md:flex md:gap-4 md:items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setFolderFilter('');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {folders.length > 0 && (
          <div className="min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Folder</label>
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Grid view"
          >
            <Grid3x3 size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="List view"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Media Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No media found</p>
          <p className="text-gray-500 text-sm mt-2">Upload your first media file to get started</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {media.map((item) => (
            <MediaCard
              key={item._id}
              media={item}
              onView={() => {
                setSelectedMedia(item);
                setShowViewModal(true);
              }}
              onDelete={() => handleDelete(item._id)}
              onDownload={() => handleDownload(item)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">File Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Folder</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Size</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {media.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.fileName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.fileType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.folder}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {(item.fileSize / 1024).toFixed(2)} KB
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <button
                      onClick={() => {
                        setSelectedMedia(item);
                        setShowViewModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDownload(item)}
                      className="text-green-600 hover:text-green-800"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => fetchMedia(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => fetchMedia(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          file={uploadFile}
          setFile={setUploadFile}
          folder={uploadFolder}
          setFolder={setUploadFolder}
          altText={uploadAltText}
          setAltText={setUploadAltText}
          description={uploadDescription}
          setDescription={setUploadDescription}
          category={categoryFilter}
          uploading={uploading}
          fileInputRef={fileInputRef}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedMedia && (
        <ViewModal media={selectedMedia} onClose={() => setShowViewModal(false)} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <DeleteConfirmModal
          title="Delete Media"
          message="Are you sure you want to delete this media? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

// Media Card Component
function MediaCard({ media, onView, onDelete, onDownload }) {
  const isImage = media.fileType === 'image';

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group">
      <div className="relative bg-gray-100 aspect-square overflow-hidden">
        {isImage ? (
          <img
            src={media.cloudinaryUrl}
            alt={media.altText || media.fileName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <FolderOpen size={48} className="text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <button
            onClick={onView}
            className="p-2 bg-white rounded-full hover:bg-gray-100"
            title="View"
          >
            <Eye size={20} className="text-gray-800" />
          </button>
          <button
            onClick={onDownload}
            className="p-2 bg-white rounded-full hover:bg-gray-100"
            title="Download"
          >
            <Download size={20} className="text-gray-800" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white rounded-full hover:bg-gray-100"
            title="Delete"
          >
            <Trash2 size={20} className="text-red-600" />
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">{media.fileName}</p>
        <p className="text-xs text-gray-500 mt-1">{media.folder}</p>
        <p className="text-xs text-gray-400 mt-1">{(media.fileSize / 1024).toFixed(2)} KB</p>
      </div>
    </div>
  );
}

// Upload Modal Component
function UploadModal({
  onClose,
  onUpload,
  file,
  setFile,
  folder,
  setFolder,
  altText,
  setAltText,
  description,
  setDescription,
  category,
  uploading,
  fileInputRef,
}) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)'
      }}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Upload Media</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0])}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            {file && <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>}
          </div>

          {/* Folder Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Folder</label>
            <input
              type="text"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="e.g., products, banners"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={!file || uploading}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

// View Modal Component
function ViewModal({ media, onClose }) {
  const isImage = media.fileType === 'image';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)'
      }}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">{media.fileName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isImage && (
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={media.cloudinaryUrl}
                alt={media.altText || media.fileName}
                className="w-full h-auto"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">File Type</p>
              <p className="text-sm font-medium text-gray-900">{media.fileType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">File Size</p>
              <p className="text-sm font-medium text-gray-900">{(media.fileSize / 1024).toFixed(2)} KB</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Folder</p>
              <p className="text-sm font-medium text-gray-900">{media.folder}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="text-sm font-medium text-gray-900">{media.category}</p>
            </div>
          </div>

          {media.altText && (
            <div>
              <p className="text-sm text-gray-600">Alt Text</p>
              <p className="text-sm text-gray-900">{media.altText}</p>
            </div>
          )}

          {media.description && (
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-sm text-gray-900">{media.description}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600">URL</p>
            <p className="text-xs text-blue-600 break-all">{media.cloudinaryUrl}</p>
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

