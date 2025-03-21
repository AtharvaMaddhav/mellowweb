import {
  toggleLike,
  reportPost,
  addPost,
  deleteExpiredPost,
  deleteReportedPost,
  checkReportThreshold,
  fetchPosts,
  fetchUserData,
  savePost,
  unsavePost,
} from "../../services/postService.js";

// Report threshold configuration
const REPORT_THRESHOLD = 3; // Post will be deleted after 3 reports

export const usePostHandlers = (currentUser, setPosts, posts) => {
  // Like/unlike a post
  const handleLike = async (postId) => {
    if (!currentUser) return;

    const success = await toggleLike(postId, currentUser.uid);
    if (success) {
      // Update UI
      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            const isLiked = post.likes?.includes(currentUser.uid);
            return {
              ...post,
              likes: isLiked
                ? post.likes.filter((id) => id !== currentUser.uid)
                : [...(post.likes || []), currentUser.uid],
            };
          }
          return post;
        })
      );
    }
  };

  // Save/unsave a post
  const handleSavePost = async (postId) => {
    if (!currentUser) return;

    try {
      // Get the post to check if it's permanent
      const post = posts.find((post) => post.id === postId);

      // Only allow saving permanent posts
      if (!post.isPermanent) {
        alert("Only permanent posts can be saved.");
        return;
      }

      // Get current user data to check if post is already saved
      const userData = await fetchUserData(currentUser.uid);
      const savedPosts = userData.savedPosts || [];
      const isSaved = savedPosts.includes(postId);

      let success;
      if (isSaved) {
        // Unsave the post
        success = await unsavePost(postId, currentUser.uid);
      } else {
        // Save the post
        success = await savePost(postId, currentUser.uid);
      }

      if (success) {
        // Update the posts array with the new saved status
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p.id === postId) {
              // Update both the flag and the savedBy array for consistency
              const savedBy = p.savedBy || [];
              return {
                ...p,
                isSavedByCurrentUser: !isSaved,
                savedBy: isSaved
                  ? savedBy.filter((id) => id !== currentUser.uid)
                  : [...savedBy, currentUser.uid],
              };
            }
            return p;
          })
        );

        // Provide feedback
        // alert(isSaved ? "Post removed from saved items" : "Post saved successfully");
      }
    } catch (error) {
      console.error("Error saving/unsaving post:", error);
      alert("Failed to save post. Please try again.");
    }
  };

  // Report a post
  const handleReport = async (postId) => {
    if (!currentUser) return;

    if (window.confirm("Are you sure you want to report this post?")) {
      const result = await reportPost(postId, currentUser.uid);

      if (result.success) {
        // Update the UI to show the report was added
        setPosts(
          posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                reports: [...(post.reports || []), currentUser.uid],
              };
            }
            return post;
          })
        );

        // Check if this report pushes the post over threshold
        if (result.reachedThreshold) {
          // Delete from database
          await deleteReportedPost(postId);

          // Remove from UI
          setPosts((prevPosts) =>
            prevPosts.filter((post) => post.id !== postId)
          );

          alert("This post has been removed due to multiple reports.");
        } else {
          alert("Post reported successfully");
        }
      }
    }
  };

  const handleAddPost = async (
    newPostText,
    mediaFiles,
    isPermanent,
    uploadMediaFiles,
    resetForm
  ) => {
    if (!currentUser || !newPostText.trim()) return { success: false };

    try {
      // Upload media files
      const mediaUploads = await uploadMediaFiles();

      // Send to backend
      const result = await addPost(currentUser.uid, {
        description: newPostText,
        mediaUrls: mediaUploads,
        isPermanent,
      });

      if (result.success) {
        // Get user data for the new post
        const userData = await fetchUserData(currentUser.uid);

        // Calculate expiration time if not permanent
        const expiresAt = !isPermanent
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : null;

        // Create temporary post object for UI
        const newPost = {
          id: result.postId,
          description: newPostText,
          mediaUrls: mediaUploads,
          isPermanent,
          expiresAt,
          uid: currentUser.uid,
          likes: [],
          reports: [],
          createdAt: {
            seconds: Math.floor(Date.now() / 1000),
            nanoseconds: 0,
          },
          userData,
        };

        // Add to existing posts
        setPosts((prevPosts) => [newPost, ...prevPosts]);

        return { success: true };
      } else {
        alert("Failed to create post. Please try again.");
        return { success: false };
      }
    } catch (error) {
      console.error("Error adding post:", error);
      alert("An error occurred while creating your post.");
      return { success: false, error };
    }
  };

  // Check for expired posts and reported posts
  const checkAndDeleteExpiredAndReportedPosts = async () => {
    const currentTime = new Date();

    // Find posts that are expired and need to be deleted from database
    const postsToDelete = posts.filter((post) => {
      // Skip permanent posts
      if (post.isPermanent) return false;

      // Check if post has expiration time
      if (!post.expiresAt) return false;

      // Convert expiration time to Date if it's not already
      let expiryTime;
      if (post.expiresAt instanceof Date) {
        expiryTime = post.expiresAt;
      } else if (typeof post.expiresAt === "object" && post.expiresAt.seconds) {
        expiryTime = new Date(post.expiresAt.seconds * 1000);
      } else {
        expiryTime = new Date(post.expiresAt);
      }

      // Return true if post is expired
      return expiryTime <= currentTime;
    });

    // Process posts that need to be deleted from database
    if (postsToDelete.length > 0) {
      console.log(
        `Deleting ${postsToDelete.length} expired posts from database`
      );

      // Delete from database
      for (const post of postsToDelete) {
        await deleteExpiredPost(post.id);
      }

      // Remove these posts from UI
      const deletedIds = postsToDelete.map((post) => post.id);
      setPosts((prevPosts) =>
        prevPosts.filter((post) => !deletedIds.includes(post.id))
      );
    }

    // Also check for posts that exceed report threshold
    const reportedPostsToDelete = posts.filter((post) =>
      checkReportThreshold(post, REPORT_THRESHOLD)
    );

    if (reportedPostsToDelete.length > 0) {
      console.log(
        `Deleting ${reportedPostsToDelete.length} posts that exceed report threshold`
      );

      // Delete from database
      for (const post of reportedPostsToDelete) {
        await deleteReportedPost(post.id);
      }

      // Remove these posts from UI
      const deletedIds = reportedPostsToDelete.map((post) => post.id);
      setPosts((prevPosts) =>
        prevPosts.filter((post) => !deletedIds.includes(post.id))
      );
    }
  };

  // Load initial posts
  const loadPosts = async (setLoading, setLastVisible, setHasMore) => {
    setLoading(true);
    try {
      const { posts: newPosts, lastVisible: newLastVisible } =
        await fetchPosts();

      // Get current user data including savedPosts
      const currentUserData = currentUser
        ? await fetchUserData(currentUser.uid)
        : null;
      const savedPostIds = currentUserData?.savedPosts || [];

      // Add user data to each post and check if it's saved by current user
      const postsWithUserData = await Promise.all(
        newPosts.map(async (post) => {
          const userData = await fetchUserData(post.uid);
          return {
            ...post,
            userData,
            isSavedByCurrentUser: savedPostIds.includes(post.id),
          };
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
  const loadMorePosts = async (
    lastVisible,
    setLoading,
    setLastVisible,
    setHasMore,
    loading,
    hasMore
  ) => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const { posts: newPosts, lastVisible: newLastVisible } = await fetchPosts(
        lastVisible
      );

      // Get current user data including savedPosts
      const currentUserData = currentUser
        ? await fetchUserData(currentUser.uid)
        : null;
      const savedPostIds = currentUserData?.savedPosts || [];

      // Add user data to each post and check if it's saved by current user
      const postsWithUserData = await Promise.all(
        newPosts.map(async (post) => {
          const userData = await fetchUserData(post.uid);
          return {
            ...post,
            userData,
            isSavedByCurrentUser: savedPostIds.includes(post.id),
          };
        })
      );

      setPosts((prevPosts) => [...prevPosts, ...postsWithUserData]);
      setLastVisible(newLastVisible);
      setHasMore(newPosts.length > 0);
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }

    return new Date(timestamp).toLocaleString();
  };

  return {
    handleLike,
    handleReport,
    handleSavePost,
    handleAddPost,
    checkAndDeleteExpiredAndReportedPosts,
    loadPosts,
    loadMorePosts,
    formatTime,
    REPORT_THRESHOLD,
  };
};
