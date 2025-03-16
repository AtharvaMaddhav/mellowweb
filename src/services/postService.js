import { db } from "../config/firebase.js";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  limit,
  startAfter,
  getDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

// Fetch posts with pagination
export const fetchPosts = async (lastVisible = null, limitCount = 10) => {
  try {
    // Create query based on whether we're loading initial posts or more posts
    let postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    
    // Add startAfter if we're paginating
    if (lastVisible) {
      postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(limitCount)
      );
    }

    // Get posts
    const querySnapshot = await getDocs(postsQuery);
    
    // Convert to array with IDs
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get last document for pagination
    const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    
    return { posts, lastVisible: lastVisibleDoc };
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    return { posts: [], lastVisible: null };
  }
};

// Get user data for a post
export const fetchUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    return null;
  }
};

// Toggle like on a post
export const toggleLike = async (postId, userId) => {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      return false;
    }
    
    const isLiked = postSnap.data().likes?.includes(userId);
    
    // Add or remove like based on current state
    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
    
    return true;
  } catch (error) {
    console.error("Error toggling like:", error.message);
    return false;
  }
};

// Report a post
export const reportPost = async (postId, userId) => {
  try {
    await updateDoc(doc(db, "posts", postId), {
      reports: arrayUnion(userId)
    });
    return true;
  } catch (error) {
    console.error("Error reporting post:", error.message);
    return false;
  }
};

// Add a new post
export const addPost = async (userId, postData) => {
  try {
    // Calculate expiration time if not permanent (24 hours from now)
    const expiresAt = postData.isPermanent ? null : new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Create post object
    const newPost = {
      userid: userId,
      description: postData.description,
      mediaUrls: postData.mediaUrls || [],
      isPermanent: postData.isPermanent || false,
      expiresAt,
      likes: [],
      reports: [],
      createdAt: serverTimestamp()
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, "posts"), newPost);
    
    return {
      success: true,
      postId: docRef.id
    };
  } catch (error) {
    console.error("Error adding post:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};