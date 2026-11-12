/**
 * MediaPicker Usage Examples
 * 
 * This file demonstrates various ways to use the MediaPicker components
 * in your application.
 */

import React, { useState } from 'react';
import {
  MediaPickerModal,
  SingleImagePicker,
  MultiImagePicker,
} from '../components/MediaPicker';
import { useMediaPicker } from '../hooks/useMediaPicker';

// ============================================================================
// Example 1: Category Form with Single Image
// ============================================================================
export function CategoryFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  });

  return (
    <form>
      <input
        type="text"
        placeholder="Category Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <SingleImagePicker
        label="Category Image"
        value={formData.image}
        onChange={(url) => setFormData({ ...formData, image: url })}
        required
        category="categories"
        helperText="Select a category image"
      />

      <button type="submit">Save Category</button>
    </form>
  );
}

// ============================================================================
// Example 2: Brand Form with Logo
// ============================================================================
export function BrandFormExample() {
  const [brandLogo, setBrandLogo] = useState('');

  return (
    <div>
      <SingleImagePicker
        label="Brand Logo"
        value={brandLogo}
        onChange={setBrandLogo}
        required
        category="brands"
        imageClassName="h-32 w-32"
        helperText="Upload brand logo (square recommended)"
      />
    </div>
  );
}

// ============================================================================
// Example 3: Product Form with Thumbnail and Gallery
// ============================================================================
export function ProductFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    thumbnail: '',
    gallery: [],
  });

  return (
    <form>
      <input
        type="text"
        placeholder="Product Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <SingleImagePicker
        label="Product Thumbnail"
        value={formData.thumbnail}
        onChange={(url) => setFormData({ ...formData, thumbnail: url })}
        required
        category="products"
        imageClassName="h-64 w-64"
      />

      <MultiImagePicker
        label="Product Gallery"
        value={formData.gallery}
        onChange={(urls) => setFormData({ ...formData, gallery: urls })}
        category="products"
        maxImages={10}
        helperText="Add product images"
      />

      <button type="submit">Save Product</button>
    </form>
  );
}

// ============================================================================
// Example 4: Using MediaPickerModal Directly
// ============================================================================
export function DirectModalExample() {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleSelect = (media) => {
    setSelectedImage(media.cloudinaryUrl);
    console.log('Full media object:', media);
    setShowPicker(false);
  };

  return (
    <div>
      <button onClick={() => setShowPicker(true)}>Select Banner Image</button>

      {selectedImage && <img src={selectedImage} alt="Banner" />}

      <MediaPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelect}
        multiple={false}
        category="general"
        title="Select Banner Image"
      />
    </div>
  );
}

// ============================================================================
// Example 5: Using Custom Hook for Better State Management
// ============================================================================
export function CustomHookExample() {
  const thumbnailPicker = useMediaPicker(false);
  const galleryPicker = useMediaPicker(true);

  return (
    <div>
      {/* Thumbnail */}
      <div>
        <button onClick={thumbnailPicker.open}>Select Thumbnail</button>
        {thumbnailPicker.selectedMedia && (
          <div>
            <img src={thumbnailPicker.selectedMedia} alt="Thumbnail" />
            <button onClick={thumbnailPicker.clear}>Remove</button>
          </div>
        )}
      </div>

      {/* Gallery */}
      <div>
        <button onClick={galleryPicker.open}>Add Gallery Images</button>
        <div className="grid grid-cols-4 gap-4">
          {galleryPicker.selectedMedia.map((url, index) => (
            <div key={index}>
              <img src={url} alt={`Gallery ${index}`} />
              <button onClick={() => galleryPicker.remove(index)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <MediaPickerModal
        isOpen={thumbnailPicker.isOpen}
        onClose={thumbnailPicker.close}
        onSelect={thumbnailPicker.handleSelect}
        multiple={false}
        category="products"
      />

      <MediaPickerModal
        isOpen={galleryPicker.isOpen}
        onClose={galleryPicker.close}
        onSelect={galleryPicker.handleSelect}
        multiple={true}
        category="products"
        maxSelections={10}
      />
    </div>
  );
}

// ============================================================================
// Example 6: Multiple Selection with Custom Logic
// ============================================================================
export function MultipleSelectionExample() {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState([]);

  const handleSelect = (mediaItems) => {
    // You can add custom validation or processing here
    const validImages = mediaItems.filter(
      (media) => media.fileType === 'image' && media.fileSize < 5000000 // 5MB
    );

    if (validImages.length < mediaItems.length) {
      alert('Some images were too large and were not added');
    }

    setSelectedMedia([...selectedMedia, ...validImages]);
    setShowPicker(false);
  };

  return (
    <div>
      <button onClick={() => setShowPicker(true)}>
        Add Images ({selectedMedia.length}/20)
      </button>

      <div className="grid grid-cols-3 gap-4">
        {selectedMedia.map((media, index) => (
          <div key={media._id}>
            <img src={media.cloudinaryUrl} alt={media.fileName} />
            <p>{media.fileName}</p>
            <p>{(media.fileSize / 1024).toFixed(2)} KB</p>
            <button
              onClick={() =>
                setSelectedMedia(selectedMedia.filter((_, i) => i !== index))
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <MediaPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelect}
        multiple={true}
        category="products"
        maxSelections={20 - selectedMedia.length}
        title="Select Product Images"
      />
    </div>
  );
}

// ============================================================================
// Example 7: Blog Post with Featured Image
// ============================================================================
export function BlogPostExample() {
  const [post, setPost] = useState({
    title: '',
    content: '',
    featuredImage: '',
  });

  return (
    <form>
      <input
        type="text"
        placeholder="Post Title"
        value={post.title}
        onChange={(e) => setPost({ ...post, title: e.target.value })}
      />

      <textarea
        placeholder="Post Content"
        value={post.content}
        onChange={(e) => setPost({ ...post, content: e.target.value })}
      />

      <SingleImagePicker
        label="Featured Image"
        value={post.featuredImage}
        onChange={(url) => setPost({ ...post, featuredImage: url })}
        category="general"
        imageClassName="h-48 w-full"
        helperText="Select a featured image for your blog post"
      />

      <button type="submit">Publish Post</button>
    </form>
  );
}

// ============================================================================
// Example 8: User Profile Avatar
// ============================================================================
export function UserProfileExample() {
  const [avatar, setAvatar] = useState('https://default-avatar.png');

  return (
    <div>
      <SingleImagePicker
        label="Profile Picture"
        value={avatar}
        onChange={setAvatar}
        category="general"
        imageClassName="h-32 w-32 rounded-full"
        helperText="Upload your profile picture"
      />
    </div>
  );
}
