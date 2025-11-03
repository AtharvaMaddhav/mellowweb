// import React, { useState, useRef } from "react";
// import { uploadMediaToCloudinary } from "../../services/mediaService.js"; // Adjust path as needed

// export const EditProfile = ({ profileData, onClose, onSave }) => {
//   const [name, setName] = useState(profileData.name || "");
//   const [bio, setBio] = useState(profileData.bio || "");
//   const [photoFile, setPhotoFile] = useState(null); // File object for upload
//   const [profilePic, setProfilePic] = useState(profileData.profilePic || null); // URL from Cloudinary
//   const [previewUrl, setPreviewUrl] = useState(profileData.profilePic || null); // For UI display
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [uploadingPhoto, setUploadingPhoto] = useState(false);
//   const fileInputRef = useRef(null);

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Check file type
//     const validTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (!validTypes.includes(file.type)) {
//       alert("Please select a valid image file (JPEG, PNG, or GIF)");
//       return;
//     }

//     // Check file size (limit to 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       alert("Image file size must be less than 5MB");
//       return;
//     }

//     setPhotoFile(file);

//     // Create preview URL
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setPreviewUrl(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current.click();
//   };

//   const removePhoto = () => {
//     setPhotoFile(null);
//     setProfilePic(null);
//     setPreviewUrl(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!name.trim()) {
//       alert("Name is required");
//       return;
//     }

//     try {
//       setIsSubmitting(true);

//       let finalProfilePic = profilePic;

//       // If there's a new photo file, upload it to Cloudinary first
//       if (photoFile) {
//         setUploadingPhoto(true);
//         try {
//           // Use the uploadMediaToCloudinary function from mediaService
//           const uploadResult = await uploadMediaToCloudinary(photoFile);

//           if (uploadResult.success) {
//             finalProfilePic = uploadResult.url;
//           } else {
//             throw new Error(
//               uploadResult.error || "Failed to upload profile photo"
//             );
//           }
//         } catch (error) {
//           console.error("Error uploading image to Cloudinary:", error);
//           alert("Failed to upload profile photo");
//           setIsSubmitting(false);
//           setUploadingPhoto(false);
//           return;
//         }
//         setUploadingPhoto(false);
//       }

//       const updatedData = {
//         name: name.trim(),
//         bio: bio.trim(),
//         profilePic: finalProfilePic,
//       };

//       await onSave(updatedData);
//     } catch (error) {
//       console.error("Error saving profile:", error);
//       alert("Failed to save profile changes");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
//       <div className="bg-gray-800 rounded-lg w-full max-w-lg max-h-90 overflow-y-auto text-gray-200">
//         <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
//           <h2 className="text-lg font-semibold">Edit Profile</h2>
//           <button
//             onClick={onClose}
//             className="cursor-pointer text-2xl text-gray-400 hover:text-white focus:outline-none flex items-center justify-center w-8 h-8"
//           >
//             ×
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6">
//           {/* Profile Photo Section */}
//           <div className="mb-6">
//             <label className="block mb-1 text-sm text-gray-400">
//               Profile Photo
//             </label>
//             <div className="flex items-center">
//               <div className="relative">
//                 <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
//                   {previewUrl ? (
//                     <img
//                       src={previewUrl}
//                       alt="Profile preview"
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <svg
//                       className="w-12 h-12 text-gray-500"
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   )}
//                 </div>
//                 <input
//                   type="file"
//                   ref={fileInputRef}
//                   accept="image/jpeg, image/png, image/gif"
//                   onChange={handlePhotoChange}
//                   className="hidden"
//                 />
//               </div>
//               <div className="ml-4 space-y-2">
//                 <button
//                   type="button"
//                   onClick={triggerFileInput}
//                   className="cursor-pointer block px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 hover:bg-gray-600 focus:outline-none"
//                 >
//                   Upload Photo
//                 </button>
//                 {previewUrl && (
//                   <button
//                     type="button"
//                     onClick={removePhoto}
//                     className="cursor-pointer block px-3 py-1.5 border border-gray-600 rounded text-sm text-gray-400 hover:text-red-400 hover:border-red-400 focus:outline-none"
//                   >
//                     Remove
//                   </button>
//                 )}
//                 <p className="text-xs text-gray-400">
//                   JPEG, PNG or GIF (max. 5MB)
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="mb-6">
//             <label htmlFor="name" className="block mb-1 text-sm text-gray-400">
//               Name
//             </label>
//             <input
//               type="text"
//               id="name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Your name"
//               maxLength={50}
//               required
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
//             />
//           </div>

//           <div className="mb-6">
//             <label htmlFor="bio" className="block mb-1 text-sm text-gray-400">
//               Bio
//             </label>
//             <textarea
//               id="bio"
//               value={bio}
//               onChange={(e) => setBio(e.target.value)}
//               placeholder="Tell us about yourself"
//               maxLength={150}
//               rows={4}
//               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500 resize-none"
//             />
//             <div className="mt-1 text-right text-xs text-gray-400">
//               {bio.length}/150
//             </div>
//           </div>

//           <div className="flex justify-end pt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={isSubmitting}
//               className="cursor-pointer px-4 py-2 mr-2 border border-gray-600 rounded text-sm font-semibold text-gray-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting || uploadingPhoto}
//               className="cursor-pointer px-4 py-2 bg-blue-500 rounded text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               {isSubmitting
//                 ? "Saving..."
//                 : uploadingPhoto
//                 ? "Uploading Photo..."
//                 : "Save Changes"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

import React, { useState, useRef } from "react";
import { uploadMediaToCloudinary } from "../../services/mediaService.js";

export const EditProfile = ({ profileData, onClose, onSave }) => {
  const [name, setName] = useState(profileData.name || "");
  const [bio, setBio] = useState(profileData.bio || "");
  const [interests, setInterests] = useState(profileData.interests || []);
  const [newInterest, setNewInterest] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [profilePic, setProfilePic] = useState(profileData.profilePic || null);
  const [previewUrl, setPreviewUrl] = useState(profileData.profilePic || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // Suggested interest tags
  const suggestedInterests = [
    "Mindfulness",
    "Journaling",
    "Fitness",
    "Reading",
    "Music",
    "Meditation",
    "Art",
    "Self-care",
    "Gratitude",
    "Cooking",
  ];

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or GIF)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image file size must be less than 5MB");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => fileInputRef.current.click();
  const removePhoto = () => {
    setPhotoFile(null);
    setProfilePic(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
    }
    setNewInterest("");
  };

  const removeInterest = (interest) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const toggleSuggestedInterest = (interest) => {
    if (interests.includes(interest)) {
      removeInterest(interest);
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    try {
      setIsSubmitting(true);
      let finalProfilePic = profilePic;

      if (photoFile) {
        setUploadingPhoto(true);
        try {
          const uploadResult = await uploadMediaToCloudinary(photoFile);
          if (uploadResult.success) {
            finalProfilePic = uploadResult.url;
          } else {
            throw new Error(uploadResult.error || "Failed to upload profile photo");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
          alert("Failed to upload profile photo");
          setIsSubmitting(false);
          setUploadingPhoto(false);
          return;
        }
        setUploadingPhoto(false);
      }

      const updatedData = {
        name: name.trim(),
        bio: bio.trim(),
        profilePic: finalProfilePic,
        interests,
      };

      await onSave(updatedData);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg max-h-90 overflow-y-auto text-gray-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-2xl text-gray-400 hover:text-white focus:outline-none flex items-center justify-center w-8 h-8"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Profile Photo */}
          <div className="mb-6">
            <label className="block mb-1 text-sm text-gray-400">Profile Photo</label>
            <div className="flex items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg, image/png, image/gif"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              <div className="ml-4 space-y-2">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="cursor-pointer block px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 hover:bg-gray-600"
                >
                  Upload Photo
                </button>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="cursor-pointer block px-3 py-1.5 border border-gray-600 rounded text-sm text-gray-400 hover:text-red-400 hover:border-red-400"
                  >
                    Remove
                  </button>
                )}
                <p className="text-xs text-gray-400">JPEG, PNG or GIF (max. 5MB)</p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="mb-6">
            <label htmlFor="name" className="block mb-1 text-sm text-gray-400">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label htmlFor="bio" className="block mb-1 text-sm text-gray-400">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              maxLength={150}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="mt-1 text-right text-xs text-gray-400">
              {bio.length}/150
            </div>
          </div>

          {/* Interests */}
          <div className="mb-6">
            <label className="block mb-1 text-sm text-gray-400">Interests</label>
            <div className="flex mb-3">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add a new interest..."
                className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-l text-gray-200 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addInterest}
                className="cursor-pointer px-3 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {interests.map((interest, idx) => (
                <span
                  key={idx}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="text-xs text-white bg-transparent hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-2">Suggested interests:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedInterests.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleSuggestedInterest(item)}
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      interests.includes(item)
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer px-4 py-2 mr-2 border border-gray-600 rounded text-sm font-semibold text-gray-200 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingPhoto}
              className="cursor-pointer px-4 py-2 bg-blue-500 rounded text-sm font-semibold text-white hover:bg-blue-600"
            >
              {isSubmitting
                ? "Saving..."
                : uploadingPhoto
                ? "Uploading Photo..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
