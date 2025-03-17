import React, { useState } from "react";
import { X, Calendar, Image } from "lucide-react";
import { storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let imageUrl = "";
      
      // Upload image to Firebase Storage if exists
      if (goalData.image) {
        const storageRef = ref(storage, `goalImages/${Date.now()}_${goalData.image.name}`);
        const snapshot = await uploadBytes(storageRef, goalData.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      // Create goal data with image URL
      const finalGoalData = {
        ...goalData,
        image: imageUrl || "" // Use URL or empty string if no image
      };
      
      // Submit data to parent component
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
      alert("Failed to create goal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
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