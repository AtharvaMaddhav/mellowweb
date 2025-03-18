import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from "../../config/firebase";
import { db, storage } from "../../config/firebase"; // Added storage import
import { X, ImagePlus, Users } from 'lucide-react'; // Added Lucide icons

const CreateCommunity = ({ onCreateCommunity, onCancel }) => {
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    tagline: '',
    description: '',
    image: null,
    category: 'General' // Added default category
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCommunity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCommunity(prev => ({
        ...prev,
        image: file
      }));
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to create a community');
      }
      
      let imageUrl = null;
      
      // Upload image to Firebase Storage if provided
      if (newCommunity.image) {
        const imageRef = ref(storage, `community-images/${Date.now()}-${newCommunity.image.name}`);
        await uploadBytes(imageRef, newCommunity.image);
        imageUrl = await getDownloadURL(imageRef);
      }
      
      // Prepare community data
      const communityData = {
        name: newCommunity.name,
        tagline: newCommunity.tagline,
        description: newCommunity.description,
        image: imageUrl,
        category: newCommunity.category,
        createdBy: {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Anonymous',
          email: currentUser.email
        },
        members: [currentUser.uid], // Creator is the first member
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add document to Firestore
      const docRef = await addDoc(collection(db, 'communities'), communityData);
      
      // Return the created community with ID
      const createdCommunity = {
        id: docRef.id,
        ...communityData,
        createdAt: new Date(), // Convert serverTimestamp to Date for immediate display
        updatedAt: new Date()
      };
      
      // Pass the created community back to parent component
      onCreateCommunity(createdCommunity);
      
    } catch (err) {
      console.error('Error creating community:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full bg-[#111] rounded-xl p-6 shadow-xl border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Create New Community</h2>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-[#333] transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Community Name*
            </label>
            <input
              type="text"
              name="name"
              value={newCommunity.name}
              onChange={handleInputChange}
              className="w-full bg-[#222] text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Tagline*
            </label>
            <input
              type="text"
              name="tagline"
              value={newCommunity.tagline}
              onChange={handleInputChange}
              className="w-full bg-[#222] text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="A short slogan for your community"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Description*
            </label>
            <textarea
              name="description"
              value={newCommunity.description}
              onChange={handleInputChange}
              className="w-full bg-[#222] text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors"
              rows="4"
              placeholder="Tell people what your community is about"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Category
            </label>
            <select
              name="category"
              value={newCommunity.category}
              onChange={handleInputChange}
              className="w-full bg-[#222] text-white border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-purple-500 transition-colors"
            >
              <option value="General">General</option>
              <option value="Fitness">Fitness</option>
              <option value="Reading">Reading</option>
              <option value="Wellness">Wellness</option>
              <option value="Education">Education</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Community Image
            </label>
            <div className="flex items-center space-x-4">
              <div 
                className="w-24 h-24 bg-[#252525] border border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={() => document.getElementById('community-image').click()}
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Community preview" 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <ImagePlus size={24} className="text-gray-500" />
                )}
              </div>
              <div className="flex-1">
                <input
                  id="community-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('community-image').click()}
                  className="px-4 py-2 bg-[#333] hover:bg-[#444] text-gray-300 rounded-lg transition-colors text-sm"
                >
                  Choose Image
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="bg-[#333] hover:bg-[#444] text-gray-300 px-5 py-2.5 rounded-lg font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Community'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunity;