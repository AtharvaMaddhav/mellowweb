import React, { useState } from "react";
import { X, Calendar, Image } from "lucide-react";
import axios from "axios";
import { cloudinaryConfig } from "../../config/cloudinary.js"; // Update this path
import { doc, setDoc, collection } from "firebase/firestore";
import { db, auth } from "../../config/firebase"; // Update this path to where your Firebase config is

const CreateGoal = ({ isOpen, onClose, onCreateGoal }) => {
  const [goalData, setGoalData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    image: null,
    isPublic: true
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGoalData({
      ...goalData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGoalData({
        ...goalData,
        image: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
      
      const response = await axios.post(uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });
      
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      let imageUrl = "";
      
      // Upload image to Cloudinary if exists
      if (goalData.image) {
        imageUrl = await uploadImageToCloudinary(goalData.image);
      }
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User is not authenticated");
      }

      const finalGoalData = {
        title: goalData.title,
        description: goalData.description,
        startDate: goalData.startDate,
        endDate: goalData.endDate,
        goalImage: imageUrl || "", // Consistent field name
        goalType: goalData.isPublic ? "Public" : "Private",
        completedBy: [], // Empty array to track users who completed the goal
        userId: user.uid, // Use the authenticated user's ID
        members: goalData.isPublic ? [user.uid] : [] // Add current user to members if public
      };
      
      // Get a new document reference with auto-generated ID
      const newGoalRef = doc(collection(db, "goals"));
      
      // Set the document data using the finalGoalData object directly
      await setDoc(newGoalRef, finalGoalData);
      
      // Submit data to parent component if needed
      await onCreateGoal(finalGoalData);
      
      // Reset form
      setGoalData({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        image: null,
        isPublic: true
      });
      setPreviewImage(null);
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error("Error creating goal:", error);
      alert(`Failed to create goal: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // The rest of your component remains the same
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      {/* Your existing JSX... */}
      <div className="bg-[#1A1A1A] rounded-xl p-6 max-w-md w-full border border-gray-800 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Create New Goal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Goal Image
            </label>
            <div 
              className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => document.getElementById("image-upload").click()}
            >
              {previewImage ? (
                <div className="relative">
                  <img 
                    src={previewImage} 
                    alt="Goal preview" 
                    className="h-40 mx-auto object-cover rounded-lg"
                  />
                  <button 
                    type="button"
                    className="absolute top-2 right-2 bg-black bg-opacity-70 p-1 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(null);
                      setGoalData({...goalData, image: null});
                    }}
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <Image size={40} className="text-gray-500 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload an image</p>
                </div>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Show upload progress when submitting */}
          {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-purple-600 h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-gray-400 mt-1">Uploading image: {uploadProgress}%</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={goalData.title}
              onChange={handleChange}
              required
              className="w-full p-3 bg-[#333] text-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Enter goal title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={goalData.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 bg-[#333] text-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Describe your goal"
            ></textarea>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-400 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Start Date</span>
                </div>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={goalData.startDate}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#333] text-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-400 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>End Date</span>
                </div>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={goalData.endDate}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#333] text-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={goalData.isPublic}
              onChange={handleChange}
              className="h-4 w-4 rounded bg-[#333] border-gray-700 text-purple-500 focus:ring-purple-400"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-400">
              Make this goal public
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGoal;