import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { MediaPickerModal } from '../MediaPicker';
import mediaService from '../../services/mediaService';

export default function MediaSection({ formData, setFormData }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewMain, setPreviewMain] = useState(formData.mainImage);
  const [previewGallery, setPreviewGallery] = useState(formData.gallery);
  const [showMainImagePicker, setShowMainImagePicker] = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);

  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      // Use mediaService to upload and save to Media collection
      const response = await mediaService.uploadMedia(
        file,
        'products',
        'products',
        '',
        ''
      );

      const imageUrl = response.data.cloudinaryUrl;
      setFormData((prev) => ({
        ...prev,
        mainImage: imageUrl,
      }));
      setPreviewMain(imageUrl);
    } catch (error) {
      setUploadError('Failed to upload main image');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Handle main image selection from media library
  const handleMainImageSelect = (media) => {
    const imageUrl = media.cloudinaryUrl;
    setFormData((prev) => ({
      ...prev,
      mainImage: imageUrl,
    }));
    setPreviewMain(imageUrl);
    setShowMainImagePicker(false);
  };

  const handleGalleryUpload = async (e) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    setUploadError('');

    try {
      const uploadedUrls = [];

      for (let i = 0; i < files.length; i++) {
        // Use mediaService to upload and save to Media collection
        const response = await mediaService.uploadMedia(
          files[i],
          'products',
          'products',
          '',
          ''
        );

        uploadedUrls.push(response.data.cloudinaryUrl);
      }

      const newGallery = [...previewGallery, ...uploadedUrls];
      setFormData((prev) => ({
        ...prev,
        gallery: newGallery,
      }));
      setPreviewGallery(newGallery);
    } catch (error) {
      setUploadError('Failed to upload gallery images');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Handle gallery selection from media library
  const handleGallerySelect = (mediaItems) => {
    const newUrls = mediaItems.map(item => item.cloudinaryUrl);
    const newGallery = [...previewGallery, ...newUrls];
    setFormData((prev) => ({
      ...prev,
      gallery: newGallery,
    }));
    setPreviewGallery(newGallery);
    setShowGalleryPicker(false);
  };

  const removeGalleryImage = (index) => {
    const newGallery = previewGallery.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      gallery: newGallery,
    }));
    setPreviewGallery(newGallery);
  };

  return (
    <>
      <div className="p-6 space-y-6">
        {uploadError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {uploadError}
          </div>
        )}

        {/* Thumbnail Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Product Thumbnail <span className="text-red-500">*</span>
          </label>

          {previewMain ? (
            <div className="relative inline-block">
              <img
                src={previewMain}
                alt="Product thumbnail"
                className="h-64 w-64 object-cover rounded-lg border-2 border-teal-300 shadow-md"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, mainImage: '' }));
                  setPreviewMain('');
                }}
                className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              {/* Upload from Device */}
              {/* <label className="flex-1 flex items-center justify-center w-64 h-64 border-2 border-dashed border-teal-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition bg-gray-50">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-teal-500 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    {uploading ? 'Uploading...' : 'Upload from Device'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label> */}
              
              <button
                type="button"
                onClick={() => setShowMainImagePicker(true)}
                className="flex-1 flex items-center justify-center w-64 h-64 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition bg-gray-50"
              >
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-purple-500 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Select from Library
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Choose existing media</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Gallery Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Product Gallery
          </label>

          {previewGallery.length > 0 && (
            <p className="text-sm text-gray-600 mb-3 font-medium">
              {previewGallery.length} image{previewGallery.length !== 1 ? 's' : ''} added
            </p>
          )}

          {/* Gallery Grid with Upload Area */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Gallery Images */}
            {previewGallery.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 shadow-md transition"
                >
                  <X size={16} />
                </button>
                <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded font-medium">
                  {index + 1}
                </span>
              </div>
            ))}

            {/* Upload Area - Same size as gallery images */}
            {/* <label className="flex items-center justify-center h-40 border-2 border-dashed border-teal-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition bg-gray-50">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-teal-400 mb-1" />
                <p className="text-xs font-medium text-gray-700">
                  {uploading ? 'Uploading...' : 'Upload Files'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Multiple files</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleGalleryUpload}
                disabled={uploading}
                className="hidden"
              />
            </label> */}

            {/* Select from Library */}
            <button
              type="button"
              onClick={() => setShowGalleryPicker(true)}
              className="flex items-center justify-center h-40 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition bg-gray-50"
            >
              <div className="text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-purple-400 mb-1" />
                <p className="text-xs font-medium text-gray-700">
                  Select from Library
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Choose existing</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Media Picker Modals */}
      <MediaPickerModal
        isOpen={showMainImagePicker}
        onClose={() => setShowMainImagePicker(false)}
        onSelect={handleMainImageSelect}
        multiple={false}
        title="Select Product Thumbnail"
      />

      <MediaPickerModal
        isOpen={showGalleryPicker}
        onClose={() => setShowGalleryPicker(false)}
        onSelect={handleGallerySelect}
        multiple={true}
        maxSelections={20}
        title="Select Gallery Images"
      />
    </>
  );
}

