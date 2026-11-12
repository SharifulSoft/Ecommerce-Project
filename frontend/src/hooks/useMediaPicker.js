import { useState } from 'react';

/**
 * Custom hook to manage media picker state
 * @param {boolean} multiple - Whether to allow multiple selections
 * @param {string} initialValue - Initial value (URL or array of URLs)
 * @returns {Object} - Hook state and methods
 */
export function useMediaPicker(multiple = false, initialValue = null) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(initialValue || (multiple ? [] : ''));

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const handleSelect = (media) => {
    if (multiple) {
      const urls = media.map((item) => item.cloudinaryUrl);
      setSelectedMedia([...selectedMedia, ...urls]);
    } else {
      setSelectedMedia(media.cloudinaryUrl);
    }
    close();
  };

  const clear = () => {
    setSelectedMedia(multiple ? [] : '');
  };

  const remove = (index) => {
    if (multiple && Array.isArray(selectedMedia)) {
      setSelectedMedia(selectedMedia.filter((_, i) => i !== index));
    }
  };

  return {
    isOpen,
    open,
    close,
    selectedMedia,
    setSelectedMedia,
    handleSelect,
    clear,
    remove,
  };
}

/**
 * Example usage:
 * 
 * function MyComponent() {
 *   const thumbnailPicker = useMediaPicker(false);
 *   const galleryPicker = useMediaPicker(true);
 * 
 *   return (
 *     <>
 *       <button onClick={thumbnailPicker.open}>Select Thumbnail</button>
 *       <button onClick={galleryPicker.open}>Select Gallery</button>
 * 
 *       <MediaPickerModal
 *         isOpen={thumbnailPicker.isOpen}
 *         onClose={thumbnailPicker.close}
 *         onSelect={thumbnailPicker.handleSelect}
 *         multiple={false}
 *       />
 * 
 *       <MediaPickerModal
 *         isOpen={galleryPicker.isOpen}
 *         onClose={galleryPicker.close}
 *         onSelect={galleryPicker.handleSelect}
 *         multiple={true}
 *       />
 *     </>
 *   );
 * }
 */
