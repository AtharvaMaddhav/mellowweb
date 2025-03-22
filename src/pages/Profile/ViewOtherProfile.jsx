import React, { useState, useEffect } from "react";
import { profileService } from "../../services/profileService";
import { auth } from "../../config/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../config/firebase";

export const ViewOtherProfile = ({ userId, onClose }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const userData = await profileService.getUserProfile(userId);
        setProfileData(userData);

        // Check if current user is following this user
        if (currentUser && userData.followers) {
          setIsFollowing(userData.followers.includes(currentUser.uid));
        }

        // Get counts
        const posts = await profileService.getPostCount(userId);
        const followers = await profileService.getFollowersCount(userId);
        const following = await profileService.getFollowingCount(userId);

        setPostCount(posts);
        setFollowerCount(followers);
        setFollowingCount(following);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) return;

    try {
      // Update the other user's followers array
      const otherUserRef = doc(db, "users", userId);
      
      // Update the current user's following array
      const currentUserRef = doc(db, "users", currentUser.uid);

      if (isFollowing) {
        // Unfollow
        await updateDoc(otherUserRef, {
          followers: arrayRemove(currentUser.uid)
        });
        
        await updateDoc(currentUserRef, {
          following: arrayRemove(userId)
        });
        
        setFollowerCount(prev => prev - 1);
      } else {
        // Follow
        await updateDoc(otherUserRef, {
          followers: arrayUnion(currentUser.uid)
        });
        
        await updateDoc(currentUserRef, {
          following: arrayUnion(userId)
        });
        
        setFollowerCount(prev => prev + 1);
      }
      
      // Toggle the following state
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 text-center text-gray-200">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 text-center text-gray-200">
          <div>Profile not found</div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 rounded text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-90 overflow-y-auto text-gray-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Profile</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-2xl text-gray-400 hover:text-white focus:outline-none flex items-center justify-center w-8 h-8"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600 mb-4">
              {profileData.profilePic ? (
                <img
                  src={profileData.profilePic}
                  alt={`${profileData.name}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-12 h-12 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            <h3 className="text-xl font-bold mb-1">{profileData.name}</h3>
            
            {/* Status Indicator */}
            {profileData.isOnline !== undefined && (
              <div className="flex items-center mb-2">
                <div className={`w-2 h-2 rounded-full ${profileData.isOnline ? 'bg-green-500' : 'bg-gray-500'} mr-1`}></div>
                <span className="text-sm text-gray-400">
                  {profileData.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            )}

            {/* Bio */}
            {profileData.bio && (
              <p className="text-gray-300 text-center mb-4">{profileData.bio}</p>
            )}

            {/* Follow Button */}
            {currentUser && currentUser.uid !== userId && (
              <button
                onClick={handleFollowToggle}
                className={`cursor-pointer px-6 py-2 rounded text-sm font-semibold mb-6 transition-colors ${
                  isFollowing
                    ? 'bg-gray-700 text-gray-200 border border-gray-500 hover:bg-gray-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}

            {/* Stats */}
            <div className="w-full flex justify-between text-center mb-6 px-4">
              <div className="flex flex-col">
                <span className="text-xl font-bold">{postCount}</span>
                <span className="text-sm text-gray-400">Posts</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">{followerCount}</span>
                <span className="text-sm text-gray-400">Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">{followingCount}</span>
                <span className="text-sm text-gray-400">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};