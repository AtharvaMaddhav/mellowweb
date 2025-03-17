import { db } from "../../src/config/firebase.js";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";

// Add a new comment to a post
export const addComment = async (postId, uid, text, userData) => {
  try {
    // Create a reference to the comments subcollection of the specific post
    const commentsRef = collection(db, "posts", postId, "comments");
    
    const commentData = {
      uid,
      text,
      userData,
      createdAt: serverTimestamp(),
      parentId: null, // null means it's a top-level comment
    };
    
    const docRef = await addDoc(commentsRef, commentData);
    return { id: docRef.id, ...commentData };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Add a reply to a comment
export const addReply = async (postId, uid, text, userData, parentId) => {
  try {
    // Create a reference to the comments subcollection of the specific post
    const commentsRef = collection(db, "posts", postId, "comments");
    
    const replyData = {
      uid,
      text,
      userData,
      createdAt: serverTimestamp(),
      parentId, // Reference to parent comment
    };
    
    const docRef = await addDoc(commentsRef, replyData);
    return { id: docRef.id, ...replyData };
  } catch (error) {
    console.error("Error adding reply:", error);
    throw error;
  }
};

// Get all comments for a post
export const getComments = async (postId) => {
  try {
    // Create a reference to the comments subcollection of the specific post
    const commentsRef = collection(db, "posts", postId, "comments");
    
    const q = query(
      commentsRef,
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const comments = [];
    
    querySnapshot.forEach((doc) => {
      comments.push({ id: doc.id, ...doc.data() });
    });
    
    return comments;
  } catch (error) {
    console.error("Error getting comments:", error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (postId, commentId) => {
  try {
    // Create a reference to the specific comment document in the subcollection
    const commentDocRef = doc(db, "posts", postId, "comments", commentId);
    await deleteDoc(commentDocRef);
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// Format timestring for comments
export const formatCommentTime = (timestamp) => {
  if (!timestamp) return "Just now";
  
  const now = new Date();
  const commentDate = timestamp.toDate();
  const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return commentDate.toLocaleDateString();
};