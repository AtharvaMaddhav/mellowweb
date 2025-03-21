import React, { useState } from "react";
import { formatCommentTime } from "../../services/commentService.js";

export const Comment = ({ 
  comment, 
  currentUser, 
  onAddReply, 
  onDeleteComment,
  onDeleteReply 
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle reply submission
  const handleSubmitReply = async () => {
    if (!replyText.trim() || !currentUser) return;
    
    setIsSubmitting(true);
    try {
      await onAddReply(comment.commentId, replyText);
      setReplyText("");
      setShowReplyForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if current user is the author of the comment
  const isAuthor = currentUser && currentUser.uid === comment.uid;
  
  return (
    <div className="pl-2 border-l-2 border-gray-200 my-2">
      {/* Comment Header */}
      <div className="flex items-center">
        <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center mr-2">
          {comment.userProfile ? (
            <img
              src={comment.userProfile}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-xs">
              {comment.userName?.charAt(0) || "U"}
            </span>
          )}
        </div>
        <span className="font-medium text-sm">{comment.userName || "Unknown User"}</span>
        <span className="text-xs text-gray-500 ml-2">
          {formatCommentTime(comment.createdAt)}
        </span>
        
        {/* Delete option if author */}
        {isAuthor && (
          <button 
            onClick={() => onDeleteComment(comment.commentId)} 
            className="ml-auto text-xs text-gray-400 hover:text-red-500"
            title="Delete comment"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Comment Content */}
      <div className="mt-1 mb-2">
        <p className="text-sm text-gray-800">{comment.commentText}</p>
      </div>
      
      {/* Reply Button */}
      {currentUser && (
        <button 
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-xs text-gray-500 hover:text-blue-500 mb-2"
        >
          {showReplyForm ? "Cancel" : "Reply"}
        </button>
      )}
      
      {/* Reply Form */}
      {showReplyForm && (
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-grow text-sm p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmitReply}
            disabled={!replyText.trim() || isSubmitting}
            className={`px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${
              !replyText.trim() || isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isSubmitting ? "..." : "Reply"}
          </button>
        </div>
      )}
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 mt-2">
          {comment.replies.map(reply => (
            <div key={reply.replyId} className="border-l-2 border-gray-100 pl-2 my-2">
              <div className="flex items-center">
                <div className="h-5 w-5 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center mr-2">
                  {reply.userProfile ? (
                    <img
                      src={reply.userProfile}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-xs">
                      {reply.userName?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <span className="font-medium text-xs">{reply.userName || "Unknown User"}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatCommentTime(reply.createdAt)}
                </span>
                
                {/* Delete option if author */}
                {currentUser && currentUser.uid === reply.uid && (
                  <button 
                    onClick={() => onDeleteReply(comment.commentId, reply.replyId)} 
                    className="ml-auto text-xs text-gray-400 hover:text-red-500"
                    title="Delete reply"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-800 mt-1">{reply.replyText}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};