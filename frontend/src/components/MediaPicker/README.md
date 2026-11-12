# MediaPicker Component

A reusable media picker component that integrates with Cloudinary for media management.

## Features

- Browse and select from existing media library
- Upload new files directly to Cloudinary
- Support for single or multiple selection
- Filter by folder and search functionality
- Grid and list view modes
- Category-based organization
- Pagination support

## Usage

### Basic Single Selection

```jsx
import { MediaPickerModal } from '../components/MediaPicker';

function MyComponent() {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const handleSelect = (media) => {
    setSelectedImage(media.cloudinaryUrl);
    console.log('Selected media:', media);
  };

  return (
    <>
      <button onClick={() => setShowPicker(true)}>
        Select Image
      </button>

      <MediaPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelect}
        multiple={false}
        category="products"
        title="Select Product Image"
      />
    </>
  );
}
```

### Multiple Selection

```jsx
import { MediaPickerModal } from '../components/MediaPicker';

function GalleryComponent() {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const handleSelect = (mediaItems) => {
    const urls = mediaItems.map(item => item.cloudinaryUrl);
    setSelectedImages([...selectedImages, ...urls]);
  };

  return (
    <>
      <button onClick={() => setShowPicker(true)}>
        Add Gallery Images
      </button>

      <MediaPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelect}
        multiple={true}
        category="products"
        maxSelections={20}
        title="Select Gallery Images"
      />
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | required | Controls modal visibility |
| `onClose` | function | required | Callback when modal is closed |
| `onSelect` | function | required | Callback when media is selected. Receives selected media object(s) |
| `multiple` | boolean | `false` | Allow multiple selection |
| `category` | string | `'general'` | Filter media by category (products, categories, brands, general) |
| `maxSelections` | number | `10` | Maximum number of items that can be selected (only for multiple mode) |
| `title` | string | `'Select Media'` | Modal title |

## Media Object Structure

When media is selected, you'll receive an object (or array of objects) with the following structure:

```javascript
{
  _id: "mongodb_id",
  mediaId: 123,
  fileName: "product-image.jpg",
  fileType: "image",
  mimeType: "image/jpeg",
  fileSize: 125432,
  cloudinaryUrl: "https://res.cloudinary.com/...",
  publicId: "ecommerce/media/products/...",
  folder: "products",
  category: "products",
  width: 1920,
  height: 1080,
  altText: "Product description",
  description: "Additional details",
  status: "active",
  uploadedBy: "admin",
  createdAt: "2026-01-15T...",
  updatedAt: "2026-01-15T..."
}
```

## Categories

Available categories:
- `general` - General purpose media
- `products` - Product images
- `categories` - Category images
- `brands` - Brand logos and images

## Integration with Forms

The component is already integrated in:
- Product form (`ProductForm/MediaSection.jsx`)

You can use the same pattern for:
- Category images
- Brand logos
- Banner images
- User avatars
- Any other media selection needs

## Example: Category Image Selection

```jsx
import { MediaPickerModal } from '../components/MediaPicker';

function CategoryForm() {
  const [categoryImage, setCategoryImage] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div>
      <label>Category Image</label>
      
      {categoryImage ? (
        <img src={categoryImage} alt="Category" />
      ) : (
        <button onClick={() => setShowPicker(true)}>
          Select Image
        </button>
      )}

      <MediaPickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(media) => setCategoryImage(media.cloudinaryUrl)}
        category="categories"
        title="Select Category Image"
      />
    </div>
  );
}
```

## Notes

- All uploads are automatically sent to Cloudinary
- Media is organized in the database for easy management
- The component uses the existing `mediaService` API
- Toast notifications are shown for upload/error feedback
- Images are lazy-loaded for better performance
