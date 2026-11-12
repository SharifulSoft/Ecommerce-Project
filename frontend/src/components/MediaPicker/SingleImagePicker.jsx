import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { MediaPickerModal } from '../MediaPicker';

/**
 * Reusable Single Image Picker Component
 * Can be used for category images, brand logos, banners, etc.
 */
export default function SingleImagePicker({
  label = 'Image',
  value = '',
  onChange,
  required = false,
  category = 'general',
  imageClassName = 'h-48 w-48',
  helperText = 'PNG, JPG, GIF up to 10MB',
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [previewImage, setPreviewImage] = useState(value);

  const handleSelect = (media) => {
    const imageUrl = media.cloudinaryUrl;
    setPreviewImage(imageUrl);
    onChange(imageUrl);
    setShowPicker(false);
  };

  const handleRemove = () => {
    setPreviewImage('');
    onChange('');
  };

  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {previewImage ? (
          <div className="relative inline-block">
            <img
              src={previewImage}
              alt={label}
              className={`${imageClassName} object-cover rounded-lg border-2 border-teal-300 shadow-md`}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className={`${imageClassName} flex items-center justify-center border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition bg-gray-50`}
          >
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-purple-500 mb-2" />
              <p className="text-sm font-medium text-gray-700">Select Image</p>
              <p className="text-xs text-gray-500 mt-1">{helperText}</p>
            </div>
          </button>
        )}
      </div>

      <MediaPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelect}
        multiple={false}
        category={category}
        title={`Select ${label}`}
      />
    </>
  );
}

/**
 * Example Usage in Category Form:
 * 
 * function CategoryForm() {
 *   const [formData, setFormData] = useState({
 *     name: '',
 *     image: '',
 *   });
 * 
 *   return (
 *     <form>
 *       <input
 *         value={formData.name}
 *         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 *       />
 * 
 *       <SingleImagePicker
 *         label="Category Image"
 *         value={formData.image}
 *         onChange={(url) => setFormData({ ...formData, image: url })}
 *         required
 *         category="categories"
 *       />
 *     </form>
 *   );
 * }
 */
