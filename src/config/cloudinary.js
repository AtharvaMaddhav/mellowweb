// cloudinary.js
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
};

// Helper function for direct client-side uploads
export const getCloudinaryUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
};

// Helper function to format image URLs with transformations if needed
export const formatCloudinaryUrl = (url, transformations = '') => {
  if (!url) return '';
  
  // If already a Cloudinary URL, you can add transformations
  if (url.includes('cloudinary.com')) {
    // Parse the URL to insert transformations if needed
    const parts = url.split('/upload/');
    if (transformations && parts.length === 2) {
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }
  }
  
  return url;
};