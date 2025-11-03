import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

// Helper function to add a post to a community
export const addCommunityPost = async (communityId, postData) => {
    try {
      const communityRef = doc(db, "Communities", communityId);
      const postsRef = collection(communityRef, "Posts");
      
      const newPost = {
        ...postData,
        timestamp: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0
      };
      
      return await addDoc(postsRef, newPost);
    } catch (error) {
      console.error("Error adding post to community:", error);
      throw error;
    }
  };
  
  // Helper function to fetch community posts
  export const fetchCommunityPosts = async (communityId) => {
    try {
      const communityRef = doc(db, "Communities", communityId);
      const postsRef = collection(communityRef, "Posts");
      
      const q = query(postsRef, orderBy("timestamp", "desc"));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error fetching community posts:", error);
      throw error;
    }
  };