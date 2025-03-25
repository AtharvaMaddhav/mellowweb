import React, { useEffect, useState, useRef } from "react";
import { auth } from "../../config/firebase.js";
import { useMediaHandling } from "./MediaUtils.jsx";
import { usePostHandlers } from "./PostHandlers.jsx";
import { CommentsSection } from "./CommentsSection.jsx";
import { ViewOtherProfile } from "../Profile/ViewOtherProfile.jsx";
import SideBar from '../SideBar/SideBar.jsx';
import { Plus, MessageCircle } from "lucide-react";

export default function PostSection() {
  // State management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Add state to track the profile being viewed
  const [viewingProfileId, setViewingProfileId] = useState(null);

  // Post creation state
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [addingPost, setAddingPost] = useState(false);

  // Import media handling functionality
  const {
    mediaFiles,
    fileInputRef,
    MediaViewerModal,
    handleFileSelect,
    resetMediaState,
    uploadMediaFiles,
    renderMedia,
  } = useMediaHandling(posts);

  // Import post handling functionality
  const {
    handleLike,
    handleReport,
    handleSavePost,
    handleAddPost,
    checkAndDeleteExpiredAndReportedPosts,
    loadPosts: loadPostsHandler,
    loadMorePosts: loadMorePostsHandler,
    formatTime,
    REPORT_THRESHOLD,
  } = usePostHandlers(currentUser, setPosts, posts);

  // Refs
  const observer = useRef();

  // Load data on component mount
  useEffect(() => {
    // Track authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    // Load initial posts
    loadPosts();

    return () => unsubscribe();
  }, []);

  // Load initial posts
  const loadPosts = () => {
    loadPostsHandler(setLoading, setLastVisible, setHasMore);
  };

  // Load more posts (pagination)
  const loadMorePosts = () => {
    loadMorePostsHandler(
      lastVisible,
      setLoading,
      setLastVisible,
      setHasMore,
      loading,
      hasMore
    );
  };

  // Check for expired posts periodically
  useEffect(() => {
    const runCheck = () => checkAndDeleteExpiredAndReportedPosts();

    // Set up interval to check every 1 hour
    const interval = setInterval(runCheck, 60 * 60 * 1000);

    // Run once immediately
    runCheck();

    return () => clearInterval(interval);
  }, [posts]);

  // Handle adding a new post
  const submitNewPost = async () => {
    if (!currentUser || !newPostText.trim()) return;

    setAddingPost(true);
    try {
      const result = await handleAddPost(
        newPostText,
        mediaFiles,
        isPermanent,
        uploadMediaFiles,
        resetForm
      );

      if (result.success) {
        resetForm();
      }
    } finally {
      setAddingPost(false);
    }
  };

  // Reset post form
  const resetForm = () => {
    setNewPostText("");
    resetMediaState();
    setIsPermanent(false);
    setShowAddPost(false);
  };

  // Handle opening a user profile
  const handleOpenProfile = (userId) => {
    setViewingProfileId(userId);
  };

  // Handle closing the profile view
  const handleCloseProfile = () => {
    setViewingProfileId(null);
  };

  // Set up intersection observer for infinite scrolling
  const lastPostElementRef = (node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });

    if (node) observer.current.observe(node);
  };

  // Loading indicator component
  const renderLoading = () => (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar - Fixed position with proper width */}
      <div className="w-72 h-full bg-black flex items-center justify-center p-3">
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden h-screen">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MessageCircle size={24} className="text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Feed</h1>
          </div>
          
          {currentUser && (
            <button 
              onClick={() => setShowAddPost(!showAddPost)}
              className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-all shadow-lg"
            >
              <Plus size={18} />
              Create Post
            </button>
          )}
        </div>

        {/* Add Post Form */}
        {showAddPost && currentUser && (
          <div className="bg-[#252525] rounded-xl p-6 mb-6 shadow-xl border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-white">Create a New Post</h3>
            
            {/* Description Field */}
            <div className="mb-4">
              <label
                className="block text-gray-300 text-sm font-bold mb-2"
                htmlFor="description"
              >
                What's on your mind?
              </label>
              <textarea
                id="description"
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-[#333] text-white border-gray-700"
                rows={4}
                required
              ></textarea>
            </div>

            {/* Media Upload */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Add Media
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="hidden"
                multiple
              />
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-4 py-2 bg-[#333] text-gray-300 rounded-lg hover:bg-[#444] transition flex items-center cursor-pointer border border-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
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
                  Add Photo/Video
                </button>
                {mediaFiles.length > 0 && (
                  <span className="ml-3 text-sm text-gray-400">
                    {mediaFiles.length}{" "}
                    {mediaFiles.length === 1 ? "file" : "files"} selected
                  </span>
                )}
              </div>
            </div>

            {/* Permanent Post Option */}
            <div className="mb-4 flex items-center">
              <input
                id="isPermanent"
                type="checkbox"
                checked={isPermanent}
                onChange={(e) => setIsPermanent(e.target.checked)}
                className="h-4 w-4 text-purple-600 border-gray-700 rounded cursor-pointer bg-[#333]"
              />
              <label
                htmlFor="isPermanent"
                className="ml-2 block text-sm text-gray-300"
              >
                Make this post permanent (otherwise it will disappear after 24
                hours)
              </label>
            </div>

            {/* Form Buttons */}
            <div className="flex justify-end mt-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 mr-2 bg-[#333] text-gray-300 rounded-lg hover:bg-[#444] transition cursor-pointer border border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={submitNewPost}
                disabled={!newPostText.trim() || addingPost}
                className={`px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center ${
                  !newPostText.trim() || addingPost
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {addingPost ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        )}

        {/* Post List */}
        <div className="space-y-6">
          {loading && !posts.length ? renderLoading() : (
            posts.map((post, index) => {
              const isLastPost = index === posts.length - 1;
              const isLiked = post.likes?.includes(currentUser?.uid);
              const isSaved = post.savedBy?.includes(currentUser?.uid);
              const reportCount = post.reports?.length || 0;

              return (
                <div
                  key={post.id}
                  ref={isLastPost ? lastPostElementRef : null}
                  className="bg-[#252525] rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-purple-500 transition-all"
                >
                  {/* Post Header */}
                  <div className="flex items-center p-4 border-b border-gray-700">
                    {/* User Avatar */}
                    <div 
                      className="h-12 w-12 rounded-lg bg-[#333] overflow-hidden flex items-center justify-center cursor-pointer shadow-sm border border-gray-700"
                      onClick={() => post.uid && handleOpenProfile(post.uid)}
                    >
                      {post.userData?.profilePic ? (
                        <img
                          src={post.userData.profilePic}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-lg font-bold">
                          {post.userData?.name?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>

                    {/* User Info - Make the name clickable */}
                    <div className="ml-3 flex-grow">
                      <p className="font-bold text-white">
                        <span 
                          className="cursor-pointer hover:text-purple-400 transition"
                          onClick={() => post.uid && handleOpenProfile(post.uid)}
                        >
                          {post.userData?.name || "Unknown User"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(post.createdAt)}
                      </p>
                    </div>

                    {/* Post Type Badge */}
                    {!post.isPermanent ? (
                      <div className="text-xs px-2 py-1 bg-yellow-900/30 text-yellow-300 rounded-md font-medium">
                        Temporary
                      </div>
                    ) : (
                      <div className="text-xs px-2 py-1 bg-green-900/30 text-green-300 rounded-md font-medium">
                        Permanent
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="p-4">
                    <p className="text-white whitespace-pre-line mb-4">
                      {post.description}
                    </p>
                    <div className="rounded-lg overflow-hidden mb-4 bg-[#333] border border-gray-700">
                      {renderMedia(post.mediaUrls)}
                    </div>

                    {/* Like, Save & Report */}
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-700">
                      <div className="flex items-center space-x-4">
                        {/* Like Button */}
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-1 ${
                            isLiked ? "text-purple-400" : "text-gray-400"
                          } hover:text-purple-500 transition cursor-pointer`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill={isLiked ? "currentColor" : "none"}
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          <span>{post.likes?.length || 0}</span>
                        </button>

                        {/* Save Button */}
                        {currentUser && (
                          <button
                            onClick={() => handleSavePost(post.id)}
                            className={`flex items-center space-x-1 ${
                              isSaved
                                ? "text-green-400"
                                : post.isPermanent
                                ? "text-gray-400"
                                : "text-gray-600"
                            } hover:${
                              post.isPermanent ? "text-green-500" : "text-gray-600"
                            } transition ${
                              post.isPermanent
                                ? "cursor-pointer"
                                : "cursor-not-allowed"
                            }`}
                            disabled={!post.isPermanent && !isSaved}
                            title={
                              post.isPermanent
                                ? "Save post"
                                : "Only permanent posts can be saved"
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill={isSaved ? "currentColor" : "none"}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                              />
                            </svg>
                            <span>{isSaved ? "Saved" : "Save"}</span>
                          </button>
                        )}
                      </div>

                      {/* Report Button */}
                      <div className="flex items-center">
                        <button
                          onClick={() => handleReport(post.id)}
                          className={`text-gray-400 hover:text-red-500 transition text-sm cursor-pointer ${
                            post.reports?.includes(currentUser?.uid)
                              ? "text-gray-600"
                              : ""
                          }`}
                          disabled={post.reports?.includes(currentUser?.uid)}
                        >
                          {post.reports?.includes(currentUser?.uid)
                            ? "Reported"
                            : "Report"}
                        </button>
                      </div>
                    </div>
                    
                    {/* Comments Section */}
                    <CommentsSection postId={post.id} currentUser={currentUser} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Loading Indicator */}
        {loading && posts.length > 0 && (
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* End of Posts Message */}
        {!loading && !hasMore && posts.length > 0 && (
          <p className="text-center text-gray-400 my-6 p-4 bg-[#252525] rounded-lg shadow-sm border border-gray-700">No more posts to show</p>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-[#252525] rounded-xl shadow-xl border border-gray-700">
            <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
              <MessageCircle size={32} className="text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
            <p className="text-gray-400 max-w-md">
              Posts from people you follow will appear here. Start by following some users or creating your first post!
            </p>
            {currentUser && (
              <button 
                onClick={() => setShowAddPost(true)}
                className="mt-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition flex items-center gap-2 shadow-lg"
              >
                <Plus size={16} />
                Create Your First Post
              </button>
            )}
          </div>
        )}

        {/* Media Viewer Modal */}
        <MediaViewerModal />

        {/* Profile Viewer Modal */}
        {viewingProfileId && (
          <ViewOtherProfile 
            userId={viewingProfileId} 
            onClose={handleCloseProfile} 
          />
        )}
      </div>
    </div>
  );
}