import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { profileService } from "../../services/profileService.js";
import { EditProfile } from "./EditProfile.jsx";

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeSection, setActiveSection] = useState("posts");
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });

  // Posts state
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [sharedGoals, setSharedGoals] = useState([]);

  // Loading states for each section
  const [postsLoading, setPostsLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [likedLoading, setLikedLoading] = useState(false);
  const [goalsLoading, setGoalsLoading] = useState(false);

  // Determine if this is the current user's profile
  const isCurrentUserProfile = userId ? user?.uid === userId : true;
  const fileInputRef = useRef(null);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const targetUserId = userId || user?.uid;

      if (!targetUserId) {
        throw new Error("No user ID available");
      }

      const userData = await profileService.getUserProfile(targetUserId);
      setProfileData(userData);

      // Fetch stats
      const postCount = await profileService.getPostCount(targetUserId);
      const followerCount = await profileService.getFollowersCount(
        targetUserId
      );
      const followingCount = await profileService.getFollowingCount(
        targetUserId
      );

      setStats({
        posts: postCount,
        followers: followerCount,
        following: followingCount,
      });

      // Load initial section (posts)
      loadSectionData("posts", targetUserId);
    } catch (err) {
      console.error("Failed to load profile data:", err);
      setError("Failed to load profile data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSectionData = async (section, targetUserId) => {
    const userId = targetUserId || user?.uid;

    if (!userId) {
      return;
    }

    switch (section) {
      case "posts":
        try {
          setPostsLoading(true);
          const posts = await profileService.getUserPosts(userId);
          setUserPosts(posts);
        } catch (err) {
          console.error("Failed to load posts:", err);
        } finally {
          setPostsLoading(false);
        }
        break;

      case "saved":
        try {
          setSavedLoading(true);
          const saved = await profileService.getSavedPosts(userId);
          setSavedPosts(saved);
        } catch (err) {
          console.error("Failed to load saved posts:", err);
        } finally {
          setSavedLoading(false);
        }
        break;

      case "liked":
        try {
          setLikedLoading(true);
          const liked = await profileService.getLikedPosts(userId);
          setLikedPosts(liked);
        } catch (err) {
          console.error("Failed to load liked posts:", err);
        } finally {
          setLikedLoading(false);
        }
        break;

      case "goals":
        try {
          setGoalsLoading(true);
          const goals = await profileService.getSharedGoals(userId);
          setSharedGoals(goals);
        } catch (err) {
          console.error("Failed to load goals:", err);
        } finally {
          setGoalsLoading(false);
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [userId, user]);

  // Load section data when tab changes
  useEffect(() => {
    if (profileData) {
      const targetUserId = userId || user?.uid;
      loadSectionData(activeSection, targetUserId);
    }
  }, [activeSection]);

  const handleProfilePictureChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const downloadURL = await profileService.uploadProfilePicture(
          user.uid,
          file
        );
        setProfileData({
          ...profileData,
          profilePic: downloadURL,
        });
      } catch (err) {
        console.error("Failed to upload profile picture:", err);
        alert("Failed to upload profile picture. Please try again.");
      }
    }
  };

  const handleEditProfileClick = () => {
    setShowEditModal(true);
  };

  const handleEditProfileClose = () => {
    setShowEditModal(false);
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      await profileService.updateUserProfile(user.uid, updatedData);
      setProfileData({
        ...profileData,
        ...updatedData,
      });
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile. Please try again.");
    }
  };

  const renderPostGrid = (posts, loading) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="w-10 h-10 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!posts || posts.length === 0) {
      return (
        <div className="col-span-3 flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-xl text-gray-200 mb-2">No Posts Yet</h3>
          {isCurrentUserProfile && activeSection === "posts" && (
            <p className="text-gray-400">
              Share your first moment with the community
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors"
          >
            {/* Post description */}
            <div className="p-4">
              <p className="text-gray-200 whitespace-pre-wrap break-words">
                {post.description}
              </p>
              <div className="text-gray-400 text-xs mt-2">
                {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>

            {/* Media display */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div
                className={`grid ${
                  post.mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
                } gap-1`}
              >
                {post.mediaUrls.map((mediaUrl, index) => {
                  const isVideo =
                    mediaUrl.toLowerCase().endsWith(".mp4") ||
                    mediaUrl.toLowerCase().endsWith(".mov") ||
                    mediaUrl.toLowerCase().includes("video");

                  return isVideo ? (
                    <div className="aspect-square" key={index}>
                      <video
                        src={mediaUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square" key={index}>
                      <img
                        src={mediaUrl}
                        alt={`Media ${index + 1} for post`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Like/save info */}
            <div className="p-3 flex items-center gap-3 border-t border-gray-700">
              <div className="flex items-center text-pink-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {post.likes ? post.likes.length : 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGoalGrid = (goals, loading) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="w-10 h-10 border-4 border-t-green-500 border-green-200 rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!goals || goals.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-40 py-12 text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl text-gray-200 mb-2">No Shared Goals</h3>
          {isCurrentUserProfile && (
            <p className="text-gray-400">
              Track your journey with the community
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">
              {goal.title}
            </h3>
            <div className="flex items-center mb-2">
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${goal.progress || 0}%` }}
                ></div>
              </div>
              <span className="ml-2 text-gray-300 text-sm">
                {goal.progress || 0}%
              </span>
            </div>
            <p className="text-gray-300 text-sm">{goal.description}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderInterestContent = () => {
    switch (activeSection) {
      case "posts":
        return renderPostGrid(userPosts, postsLoading);
      case "saved":
        return renderPostGrid(savedPosts, savedLoading);
      case "liked":
        return renderPostGrid(likedPosts, likedLoading);
      case "goals":
        return renderGoalGrid(sharedGoals, goalsLoading);
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="bg-red-900 bg-opacity-20 p-6 rounded-lg border border-red-700">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-lg">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-900 min-h-screen text-gray-200">
      {/* Header with gradient */}
      <div className="h-32 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-t-lg mb-16 relative"></div>

      <div className="relative -mt-24 mb-10">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-900 shadow-lg mb-4">
            <img
              src={profileData.profilePic || "/default-profile.png"}
              alt={`${profileData.name}'s profile`}
              className="w-full h-full object-cover"
            />
          </div>
          {isCurrentUserProfile && (
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
              accept="image/*"
              className="hidden"
            />
          )}

          <h1 className="text-2xl font-medium text-white mb-1">
            {profileData.name}
          </h1>

          <div className="flex items-center mb-4">
            {profileData.isOnline && (
              <span className="flex items-center text-xs text-green-400 mr-2">
                <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span>
                Online
              </span>
            )}
          </div>

          <div className="max-w-md text-center mb-6">
            <p className="text-gray-300 whitespace-pre-wrap break-words leading-relaxed">
              {profileData.bio || "No bio yet"}
            </p>
          </div>

          {isCurrentUserProfile && (
            <button
              onClick={handleEditProfileClick}
              className="px-6 py-2 bg-indigo-600 rounded-full text-sm font-semibold cursor-pointer text-white hover:bg-indigo-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-lg p-6 mt-8">
          <div className="flex flex-col items-center">
            <span className="font-bold text-2xl text-white">{stats.posts}</span>
            <span className="text-gray-400 text-sm">Posts</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-2xl text-white">
              {stats.followers}
            </span>
            <span className="text-gray-400 text-sm">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-2xl text-white">
              {stats.following}
            </span>
            <span className="text-gray-400 text-sm">Following</span>
          </div>
        </div>
      </div>

      {/* Your Interests Section */}
      <div className="bg-gray-800 rounded-lg mt-8 overflow-hidden">
        <h2 className="text-xl font-medium px-6 py-4 border-b border-gray-700">
          Your Interests
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-6">
          <button
            onClick={() => setActiveSection("posts")}
            className={`flex flex-col items-center p-4 rounded-lg transition-colors cursor-pointer ${
              activeSection === "posts"
                ? "bg-indigo-800 bg-opacity-50"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-sm">My Posts</span>
          </button>

          <button
            onClick={() => setActiveSection("liked")}
            className={`flex flex-col items-center p-4 rounded-lg transition-colors cursor-pointer ${
              activeSection === "liked"
                ? "bg-pink-800 bg-opacity-50"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-sm">Liked Posts</span>
          </button>

          <button
            onClick={() => setActiveSection("saved")}
            className={`flex flex-col items-center p-4 rounded-lg transition-colors cursor-pointer ${
              activeSection === "saved"
                ? "bg-purple-800 bg-opacity-50"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
            <span className="text-sm">Saved Posts</span>
          </button>

          <button
            onClick={() => setActiveSection("goals")}
            className={`flex flex-col items-center p-4 rounded-lg transition-colors cursor-pointer ${
              activeSection === "goals"
                ? "bg-green-800 bg-opacity-50"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-sm">Shared Goals</span>
          </button>
        </div>

        {/* Content based on selected section */}
        <div className="p-6 pt-0">{renderInterestContent()}</div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfile
          profileData={profileData}
          onClose={handleEditProfileClose}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default Profile;
