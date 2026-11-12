import React, { useState, useEffect } from 'react';
import { Play, X, AlertCircle } from 'lucide-react';

export default function VideoSection({ formData, handleNestedChange }) {
  const [videoPreview, setVideoPreview] = useState('');
  const [videoError, setVideoError] = useState('');

  const videoTypes = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'vimeo', label: 'Vimeo' },
    { value: 'dailymotion', label: 'Dailymotion' },
  ];

  // Extract video ID from URL
  const extractVideoId = (url, type) => {
    if (!url) return '';

    try {
      if (type === 'youtube') {
        // Handle various YouTube URL formats
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
        const match = url.match(youtubeRegex);
        return match ? match[1] : '';
      } else if (type === 'vimeo') {
        // Handle Vimeo URL
        const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
        const match = url.match(vimeoRegex);
        return match ? match[1] : '';
      } else if (type === 'dailymotion') {
        // Handle Dailymotion URL
        const dailymotionRegex = /(?:dailymotion\.com\/video\/)([^_]+)/;
        const match = url.match(dailymotionRegex);
        return match ? match[1] : '';
      }
    } catch (error) {
      console.error('Error extracting video ID:', error);
    }
    return '';
  };

  // Generate embed URL
  const getEmbedUrl = (url, type) => {
    if (!url) return '';

    const videoId = extractVideoId(url, type);
    if (!videoId) return '';

    if (type === 'youtube') {
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (type === 'vimeo') {
      return `https://player.vimeo.com/video/${videoId}`;
    } else if (type === 'dailymotion') {
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    }
    return '';
  };

  // Update preview when URL or type changes
  useEffect(() => {
    if (formData.video?.enabled && formData.video?.url) {
      const embedUrl = getEmbedUrl(formData.video.url, formData.video.type);
      if (embedUrl) {
        setVideoPreview(embedUrl);
        setVideoError('');
      } else {
        setVideoPreview('');
        setVideoError('Invalid video URL for the selected platform');
      }
    } else {
      setVideoPreview('');
      setVideoError('');
    }
  }, [formData.video?.url, formData.video?.type, formData.video?.enabled]);

  const handleVideoTypeChange = (e) => {
    handleNestedChange('video', 'type', e.target.value);
  };

  const handleVideoUrlChange = (e) => {
    handleNestedChange('video', 'url', e.target.value);
  };

  const handleVideoToggle = (e) => {
    handleNestedChange('video', 'enabled', e.target.checked);
  };

  const handleRemoveVideo = () => {
    handleNestedChange('video', 'url', '');
    handleNestedChange('video', 'enabled', false);
    setVideoPreview('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Enable Video Toggle */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <input
          type="checkbox"
          id="enableVideo"
          checked={formData.video?.enabled || false}
          onChange={handleVideoToggle}
          className="w-5 h-5 text-teal-600 rounded cursor-pointer"
        />
        <label htmlFor="enableVideo" className="flex-1 cursor-pointer">
          <p className="font-semibold text-gray-900">Enable Product Video</p>
          <p className="text-sm text-gray-600">Add a video to showcase your product</p>
        </label>
      </div>

      {/* Video Configuration */}
      {formData.video?.enabled && (
        <div className="space-y-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
          {/* Video Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Video Platform <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {videoTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                    formData.video?.type === type.value
                      ? 'border-teal-600 bg-teal-100'
                      : 'border-gray-200 bg-white hover:border-teal-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="videoType"
                    value={type.value}
                    checked={formData.video?.type === type.value}
                    onChange={handleVideoTypeChange}
                    className="w-4 h-4 text-teal-600 cursor-pointer"
                  />
                  <span className="font-medium text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Video URL Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Video URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.video?.url || ''}
              onChange={handleVideoUrlChange}
              placeholder={
                formData.video?.type === 'youtube'
                  ? 'https://www.youtube.com/watch?v=...'
                  : formData.video?.type === 'vimeo'
                  ? 'https://vimeo.com/...'
                  : 'https://www.dailymotion.com/video/...'
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-600 mt-2">
              {formData.video?.type === 'youtube' && 'Paste the full YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)'}
              {formData.video?.type === 'vimeo' && 'Paste the full Vimeo URL (e.g., https://vimeo.com/123456789)'}
              {formData.video?.type === 'dailymotion' && 'Paste the full Dailymotion URL (e.g., https://www.dailymotion.com/video/x123456)'}
            </p>
          </div>

          {/* Error Message */}
          {videoError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-700">{videoError}</p>
            </div>
          )}

          {/* Video Preview */}
          {videoPreview && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Preview</p>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="315"
                  src={videoPreview}
                  title="Product Video Preview"
                  style={{ border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={handleRemoveVideo}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>💡 Tips:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use high-quality videos for better engagement</li>
                <li>Keep videos under 5 minutes for optimal viewing</li>
                <li>Ensure the video URL is publicly accessible</li>
                <li>Videos will be displayed on the product detail page</li>
              </ul>
            </p>
          </div>
        </div>
      )}

      {/* Disabled State Info */}
      {!formData.video?.enabled && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>ℹ️ Note:</strong> Video is currently disabled. Enable it above to add a product video.
          </p>
        </div>
      )}
    </div>
  );
}

