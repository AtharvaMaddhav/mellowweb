import React, { useEffect, useState, useRef } from "react";
import { fetchPosts, fetchUserData, toggleLike, reportPost, addPost } from "../../services/postService.js";
import { auth } from "../../config/firebase.js";

export default function PostSection() {
  // State management
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Post creation state
  const [showAddPost, setShowAddPost] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [addingPost, setAddingPost] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const observer = useRef();

  // Load data on component mount
  useEffect(() => {
    // Track authentication state
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    // Load initial posts
    loadPosts();

    return () => unsubscribe();
  }, []);

  // Load initial posts
  const loadPosts = async () => {
    setLoading(true);
    try {
      const { posts: newPosts, lastVisible: newLastVisible } = await fetchPosts();
      
      // Add user data to each post
      const postsWithUserData = await Promise.all(
        newPosts.map(async (post) => {
          const userData = await fetchUserData(post.userid);
          return { ...post, userData };
        })
      );
      
      setPosts(postsWithUserData);
      setLastVisible(newLastVisible);
      setHasMore(newPosts.length > 0);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load more posts (pagination)
  const loadMorePosts = async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      const { posts: newPosts, lastVisible: newLastVisible } = await fetchPosts(lastVisible);
      
      // Add user data to each post
      const postsWithUserData = await Promise.all(
        newPosts.map(async (post) => {
          const userData = await fetchUserData(post.userid);
          return { ...post, userData };
        })
      );
      
      setPosts(prevPosts => [...prevPosts, ...postsWithUserData]);
      setLastVisible(newLastVisible);
      setHasMore(newPosts.length > 0);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Like/unlike a post
  const handleLike = async (postId) => {
    if (!currentUser) return;
    
    const success = await toggleLike(postId, currentUser.uid);
    if (success) {
      // Update UI
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const isLiked = post.likes?.includes(currentUser.uid);
          return {
            ...post,
            likes: isLiked 
              ? post.likes.filter(id => id !== currentUser.uid)
              : [...(post.likes || []), currentUser.uid]
          };
        }
        return post;
      }));
    }
  };

  // Report a post
  const handleReport = async (postId) => {
    if (!currentUser) return;
    
    if (window.confirm("Are you sure you want to report this post?")) {
      const success = await reportPost(postId, currentUser.uid);
      if (success) {
        alert("Post reported successfully");
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  // Create a new post
  const handleAddPost = async () => {
    if (!currentUser || !newPostText.trim()) return;

    setAddingPost(true);
    try {
      // Create mock URLs (in a real app, you'd upload to storage)
      const mediaUrls = mediaFiles.map(file => 
        `https://example.com/media/${file.name}`
      );

      // Send to backend
      const result = await addPost(currentUser.uid, { 
        description: newPostText,
        mediaUrls,
        isPermanent
      });
      
      if (result.success) {
        // Get user data for the new post
        const userData = await fetchUserData(currentUser.uid);
        
        // Calculate expiration time if not permanent
        const expiresAt = !isPermanent ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null;
        
        // Create temporary post object for UI
        const newPost = {
          id: result.postId,
          description: newPostText,
          mediaUrls,
          isPermanent,
          expiresAt,
          userid: currentUser.uid,
          likes: [],
          reports: [],
          createdAt: {
            seconds: Math.floor(Date.now() / 1000),
            nanoseconds: 0
          },
          userData
        };
        
        // Add to existing posts
        setPosts(prevPosts => [newPost, ...prevPosts]);
        
        // Reset form
        resetForm();
      } else {
        alert("Failed to create post. Please try again.");
      }
    } catch (error) {
      console.error("Error adding post:", error);
      alert("An error occurred while creating your post.");
    } finally {
      setAddingPost(false);
    }
  };

  // Reset post form
  const resetForm = () => {
    setNewPostText('');
    setMediaFiles([]);
    setIsPermanent(false);
    setShowAddPost(false);
  };

  // Set up intersection observer for infinite scrolling
  const lastPostElementRef = (node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    
    if (node) observer.current.observe(node);
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    
    return new Date(timestamp).toLocaleString();
  };

  // Render media content (images/videos)
  const renderMedia = (mediaUrls) => {
    if (!mediaUrls?.length) return null;
    
    return (
      <div className="mt-3 rounded-lg overflow-hidden">
        {mediaUrls.map((url, index) => {
          const isVideo = url.includes("video");
          
          return isVideo ? (
            <video key={index} className="w-full h-auto rounded-lg" controls>
              <source src={url} type="video/mp4" />
              Your browser does not support videos.
            </video>
          ) : (
            <img key={index} src={url} alt="Post content" className="w-full h-auto rounded-lg" />
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Feed</h1>
        
        {/* Add Post Button */}
        {currentUser && (
          <button 
            onClick={() => setShowAddPost(!showAddPost)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Post
          </button>
        )}
      </div>
      
      {/* Add Post Form */}
      {showAddPost && currentUser && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          {/* Description Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description *
            </label>
            <textarea
              id="description"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            ></textarea>
          </div>
          
          {/* Media Upload */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Media (Optional)
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
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add Photo/Video
              </button>
              {mediaFiles.length > 0 && (
                <span className="ml-3 text-sm text-gray-600">
                  {mediaFiles.length} {mediaFiles.length === 1 ? 'file' : 'files'} selected
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
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isPermanent" className="ml-2 block text-sm text-gray-700">
              Make this post permanent (otherwise it will disappear after 24 hours)
            </label>
          </div>
          
          {/* Form Buttons */}
          <div className="flex justify-end mt-3">
            <button
              onClick={resetForm}
              className="px-4 py-2 mr-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPost}
              disabled={!newPostText.trim() || addingPost}
              className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center ${(!newPostText.trim() || addingPost) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {addingPost ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Post List */}
      <div className="space-y-6">
        {posts.map((post, index) => {
          const isLastPost = index === posts.length - 1;
          const isLiked = post.likes?.includes(currentUser?.uid);
          
          return (
            <div 
              key={post.id} 
              ref={isLastPost ? lastPostElementRef : null}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Post Header */}
              <div className="flex items-center p-4 border-b">
                {/* User Avatar */}
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {post.userData?.profilePic ? (
                    <img src={post.userData.profilePic} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-gray-500">{post.userData?.name?.charAt(0) || "U"}</span>
                  )}
                </div>
                
                {/* User Info */}
                <div className="ml-3 flex-grow">
                  <p className="font-medium text-gray-800">{post.userData?.name || "Unknown User"}</p>
                  <p className="text-xs text-gray-500">{formatTime(post.createdAt)}</p>
                </div>
                
                {/* Post Type Badge */}
                {!post.isPermanent && (
                  <div className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    Temporary
                  </div>
                )}
              </div>
              
              {/* Post Content */}
              <div className="p-4">
                <p className="text-gray-800 whitespace-pre-line">{post.description}</p>
                {renderMedia(post.mediaUrls)}
                
                {/* Like & Report */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 ${isLiked ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-600 transition`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  
                  <button 
                    onClick={() => handleReport(post.id)}
                    className="text-gray-500 hover:text-red-500 transition text-sm"
                  >
                    Report
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Loading Indicator */}
      {loading && !addingPost && (
        <div className="flex justify-center my-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
        </div>
      )}
      
      {/* End of Posts Message */}
      {!loading && !hasMore && posts.length > 0 && (
        <p className="text-center text-gray-500 my-6">No more posts to show</p>
      )}
      
      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-lg font-medium text-gray-800">No posts yet</p>
          <p className="text-gray-500 mt-1">Posts from people you follow will appear here</p>
        </div>
      )}
    </div>
  );
}