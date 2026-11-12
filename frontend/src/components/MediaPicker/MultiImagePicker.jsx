import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { MediaPickerModal } from '../MediaPicker';

/**
 * Reusable Multiple Images Picker Component
 * Can be used for product galleries, portfolio items, etc.
 */
export default function MultiImagePicker({
  label = 'Images',
  value = [],
  onChange,
  category = 'general',
  maxImages = 20,
  helperText = 'Select multiple images',
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [previewImages, setPreviewImages] = useState(value);

  const handleSelect = (mediaItems) => {
    const newUrls = mediaItems.map((item) => item.cloudinaryUrl);
    const updatedImages = [...previewImages, ...newUrls].slice(0, maxImages);
    setPreviewImages(updatedImages);
    onChange(updatedImages);
    setShowPicker(false);
  };

  const handleRemove = (index) => {
    const updatedImages = previewImages.filter((_, i) => i !== index);
    setPreviewImages(updatedImages);
    onChange(updatedImages);
  };

  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          {label}
        </label>

        {previewImages.length > 0 && (
          <p className="text-sm text-gray-600 mb-3 font-medium">
            {previewImages.length} image{previewImages.length !== 1 ? 's' : ''} added
            {maxImages && ` (max ${maxImages})`}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Display selected images */}
          {previewImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 shadow-md transition"
              >
                <X size={16} />
              </button>
              <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded font-medium">
                {index + 1}
              </span>
            </div>
          ))}

          {/* Add more button */}
          {(!maxImages || previewImages.length < maxImages) && (
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex items-center justify-center h-40 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition bg-gray-50"
            >
              <div className="text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-purple-400 mb-1" />
                <p className="text-xs font-medium text-gray-700">Select Images</p>
                <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>
              </div>
            </button>
          )}
        </div>
      </div>

      <MediaPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelect}
        multiple={true}
        category={category}
        maxSelections={maxImages - previewImages.length}
        title={`Select ${label}`}
      />
    </>
  );
}

/**
 * Example Usage in Product Form:
 * 
 * function ProductForm() {
 *   const [formData, setFormData] = useState({
 *     name: '',
 *     gallery: [],
 *   });
 * 
 *   return (
 *     <form>
 *       <input
 *         value={formData.name}
 *         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 *       />
 * 
 *       <MultiImagePicker
 *         label="Product Gallery"
 *         value={formData.gallery}
 *         onChange={(urls) => setFormData({ ...formData, gallery: urls })}
 *         category="products"
 *         maxImages={10}
 *       />
 *     </form>
 *   );
 * }
 */
