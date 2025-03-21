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
  serverTimestamp,
  Timestamp,
  getDoc,
  updateDoc
} from "firebase/firestore";

// Add a new comment to a post
export const addComment = async (postId, uid, commentText) => {
  try {
    // Create a reference to the comments subcollection of the specific post
    const commentsRef = collection(db, "posts", postId, "comments");
    
    const commentData = {
      uid,
      commentText,
      createdAt: Date.now(), // Using a number timestamp
      postId
    };
    
    // Add the document to get the ID
    const docRef = await addDoc(commentsRef, commentData);
    
    // Now update the document to include its own ID
    const commentId = docRef.id;
    await updateDoc(doc(db, "posts", postId, "comments", commentId), {
      commentId: commentId // Add the comment ID to the document data
    });
    
    return { 
      commentId, 
      ...commentData 
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Add a reply to a comment
export const addReply = async (postId, commentId, uid, replyText) => {
  try {
    // Create a reference to the replies subcollection of the specific comment
    const repliesRef = collection(db, "posts", postId, "comments", commentId, "replies");
    
    const replyData = {
      uid,
      replyText,
      createdAt: serverTimestamp(), // Using Firestore timestamp
      postId,
      commentId,
      replyId: Date.now().toString() // Using current timestamp as replyId
    };
    
    const docRef = await addDoc(repliesRef, replyData);
    return { ...replyData };
  } catch (error) {
    console.error("Error adding reply:", error);
    throw error;
  }
};

// Get user data by uid
const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

// Get all comments for a post with their replies
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
    
    // Fetch comments and their replies
    for (const docSnapshot of querySnapshot.docs) {
      const commentData = docSnapshot.data();
      
      // Get user data for this comment
      const userData = await getUserData(commentData.uid);
      
      const comment = { 
        commentId: docSnapshot.id, 
        commentText: commentData.commentText,
        createdAt: commentData.createdAt,
        postId: commentData.postId,
        uid: commentData.uid,
        // Add user information as additional fields
        userName: userData?.name || "Unknown User",
        userProfile: userData?.profilePic || null,
        replies: [] // Initialize empty replies array
      };
      
      // Fetch replies for this comment
      const repliesRef = collection(db, "posts", postId, "comments", docSnapshot.id, "replies");
      const repliesQuery = query(repliesRef, orderBy("createdAt", "asc"));
      const repliesSnapshot = await getDocs(repliesQuery);
      
      for (const replyDoc of repliesSnapshot.docs) {
        const replyData = replyDoc.data();
        
        // Get user data for this reply
        const replyUserData = await getUserData(replyData.uid);
        
        comment.replies.push({ 
          commentId: replyData.commentId,
          createdAt: replyData.createdAt,
          postId: replyData.postId,
          replyId: replyData.replyId || replyDoc.id, // Use custom replyId if available, otherwise use Firestore ID
          replyText: replyData.replyText,
          uid: replyData.uid,
          // Add user information as additional fields
          userName: replyUserData?.name || "Unknown User",
          userProfile: replyUserData?.profilePic || null
        });
      }
      
      comments.push(comment);
    }
    
    return comments;
  } catch (error) {
    console.error("Error getting comments:", error);
    throw error;
  }
};

// Delete a comment and all its replies
export const deleteComment = async (postId, commentId) => {
  try {
    // First, get all replies to delete them
    const repliesRef = collection(db, "posts", postId, "comments", commentId, "replies");
    const repliesSnapshot = await getDocs(repliesRef);
    
    // Delete all replies
    const deleteRepliesPromises = repliesSnapshot.docs.map(replyDoc => 
      deleteDoc(doc(db, "posts", postId, "comments", commentId, "replies", replyDoc.id)) 
    );
    
    await Promise.all(deleteRepliesPromises);
    
    // Then delete the comment itself
    await deleteDoc(doc(db, "posts", postId, "comments", commentId));
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// Delete a reply
export const deleteReply = async (postId, commentId, replyId) => {
  try {
    // First need to find the document with the matching replyId field
    const repliesRef = collection(db, "posts", postId, "comments", commentId, "replies");
    const q = query(repliesRef, where("replyId", "==", replyId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      await deleteDoc(doc(db, "posts", postId, "comments", commentId, "replies", querySnapshot.docs[0].id));
    } else {
      // Fallback to try deleting by document ID if replyId field doesn't match
      await deleteDoc(doc(db, "posts", postId, "comments", commentId, "replies", replyId));
    }
    return true;
  } catch (error) {
    console.error("Error deleting reply:", error);
    throw error;
  }
};

// Format timestring for comments
export const formatCommentTime = (timestamp) => {
  if (!timestamp) return "Just now";
  
  let commentDate;
  
  // Handle different timestamp formats
  if (timestamp instanceof Timestamp) {
    commentDate = timestamp.toDate();
  } else if (typeof timestamp === 'number') {
    commentDate = new Date(timestamp);
  } else {
    return "Just now";
  }
  
  const now = new Date();
  const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return commentDate.toLocaleDateString();
};