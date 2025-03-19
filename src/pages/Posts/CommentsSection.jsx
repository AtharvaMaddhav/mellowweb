import React, { useEffect, useState } from "react";
import { Comment } from "./Comment.jsx";
import { 
  getComments, 
  addComment, 
  addReply, 
  deleteComment, 
  deleteReply 
} from "../../services/commentService.js";

export const CommentsSection = ({ postId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  // Load comments
  const loadComments = async () => {
    if (!postId) return;
    
    setLoading(true);
    try {
      const fetchedComments = await getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle comments visibility
  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      loadComments();
    }
  };
  
  // Handle adding a new comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      const userData = {
        name: currentUser.name || "Anonymous",
        profilePic: currentUser.profilePic || null
      };
      
      await addComment(postId, currentUser.uid, newComment);
      setNewComment("");
      loadComments(); // Reload comments
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle adding a reply to a comment
  const handleAddReply = async (commentId, text) => {
    if (!text.trim() || !currentUser) return;
    
    try {
      const userData = {
        name: currentUser.name || "Anonymous",
        profilePic: currentUser.profilePic || null
      };
      
      await addReply(postId, commentId, currentUser.uid, text);
      loadComments(); // Reload comments
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };
  
  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(postId, commentId);
      loadComments(); // Reload comments
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };
  
  // Handle deleting a reply
  const handleDeleteReply = async (commentId, replyId) => {
    try {
      await deleteReply(postId, commentId, replyId); 
      loadComments(); // Reload comments
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };
  
  return (
    <div className="mt-2 pt-2 border-t border-gray-100">
      {/* Comments Toggle Button */}
      <button
        onClick={toggleComments}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        {showComments ? "Hide comments" : 
          comments.length > 0 ? `Show comments (${comments.length})` : "Add comment"}
      </button>
      
      {showComments && (
        <div className="mt-3">
          {/* New Comment Form */}
          {currentUser && (
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmitting}
                className={`px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${
                  !newComment.trim() || isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {isSubmitting ? "..." : "Post"}
              </button>
            </div>
          )}
          
          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-center my-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
            </div>
          )}
          
          {/* Comments List */}
          {!loading && comments.length === 0 && (
            <p className="text-sm text-gray-500 my-3">No comments yet</p>
          )}
          
          {!loading && comments.map(comment => (
            <Comment
              key={comment.commentId}
              comment={comment}
              currentUser={currentUser}
              onAddReply={handleAddReply}
              onDeleteComment={handleDeleteComment}
              onDeleteReply={handleDeleteReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};