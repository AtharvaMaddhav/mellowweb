import { cloudinaryConfig } from "../config/cloudinary.js";

export const uploadMediaToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    
    if (data.secure_url) {
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id
      };
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return {
      success: false,
      error: error.message
    };
  }
};