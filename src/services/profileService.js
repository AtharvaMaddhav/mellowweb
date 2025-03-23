// import { db, storage } from "../config/firebase";
// import {
//   doc,
//   getDoc,
//   updateDoc,
//   collection,
//   query,
//   where,
//   getDocs,
// } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// export const profileService = {
//   // Fetch user profile data
//   getUserProfile: async (userId) => {
//     try {
//       const userDocRef = doc(db, "users", userId);
//       const userDoc = await getDoc(userDocRef);

//       if (userDoc.exists()) {
//         return userDoc.data();
//       } else {
//         throw new Error("User not found");
//       }
//     } catch (error) {
//       console.error("Error fetching user profile:", error);
//       throw error;
//     }
//   },

//   // Update user profile data (name and bio)
//   updateUserProfile: async (userId, userData) => {
//     try {
//       const userDocRef = doc(db, "users", userId);
//       await updateDoc(userDocRef, userData);
//       return true;
//     } catch (error) {
//       console.error("Error updating user profile:", error);
//       throw error;
//     }
//   },

//   // Upload profile picture and update user document
//   uploadProfilePicture: async (userId, file) => {
//     try {
//       // Create a reference to the storage location
//       const storageRef = ref(
//         storage,
//         `profilePictures/${userId}/${Date.now()}-${file.name}`
//       );

//       // Upload the file
//       await uploadBytes(storageRef, file);

//       // Get the download URL
//       const downloadURL = await getDownloadURL(storageRef);

//       // Update the user document with the new profile picture URL
//       const userDocRef = doc(db, "users", userId);
//       await updateDoc(userDocRef, {
//         profilePic: downloadURL,
//       });

//       return downloadURL;
//     } catch (error) {
//       console.error("Error uploading profile picture:", error);
//       throw error;
//     }
//   },

//   // Get followers count
//   getFollowersCount: async (userId) => {
//     try {
//       const userDocRef = doc(db, "users", userId);
//       const userDoc = await getDoc(userDocRef);

//       if (userDoc.exists()) {
//         const userData = userDoc.data();
//         return userData.followers ? userData.followers.length : 0;
//       }

//       return 0;
//     } catch (error) {
//       console.error("Error getting followers count:", error);
//       return 0;
//     }
//   },

//   // Get following count
//   getFollowingCount: async (userId) => {
//     try {
//       const userDocRef = doc(db, "users", userId);
//       const userDoc = await getDoc(userDocRef);

//       if (userDoc.exists()) {
//         const userData = userDoc.data();
//         return userData.following ? userData.following.length : 0;
//       }

//       return 0;
//     } catch (error) {
//       console.error("Error getting following count:", error);
//       return 0;
//     }
//   },

//   // Get post count
//   getPostCount: async (userId) => {
//     try {
//       const userDocRef = doc(db, "users", userId);
//       const userDoc = await getDoc(userDocRef);

//       if (userDoc.exists()) {
//         const userData = userDoc.data();
//         return userData.myPosts ? userData.myPosts.length : 0;
//       }

//       return 0;
//     } catch (error) {
//       console.error("Error getting post count:", error);
//       return 0;
//     }
//   },

//   // Fetch user's posts
//   getUserPosts: async (userId) => {
//     try {
//       const postsQuery = query(
//         collection(db, "posts"),
//         where("uid", "==", userId)
//       );

//       const postsSnapshot = await getDocs(postsQuery);
//       const posts = [];

//       postsSnapshot.forEach((doc) => {
//         posts.push({
//           id: doc.id,
//           ...doc.data(),
//         });
//       });

//       return posts;
//     } catch (error) {
//       console.error("Error fetching user posts:", error);
//       throw error;
//     }
//   },

//   // Fetch user's liked posts
//   getLikedPosts: async (userId) => {
//     try {
//       // First get the user's liked post IDs
//       const userDocRef = doc(db, "users", userId);
//       const userDoc = await getDoc(userDocRef);

//       if (!userDoc.exists()) {
//         return [];
//       }

//       const userData = userDoc.data();
//       const likedPostIds = userData.likedPosts || [];

//       if (likedPostIds.length === 0) {
//         return [];
//       }

//       // Fetch each post by ID
//       const likedPosts = [];
//       for (const postId of likedPostIds) {
//         const postDocRef = doc(db, "posts", postId);
//         const postDoc = await getDoc(postDocRef);

//         if (postDoc.exists()) {
//           likedPosts.push({
//             id: postDoc.id,
//             ...postDoc.data(),
//           });
//         }
//       }

//       return likedPosts;
//     } catch (error) {
//       console.error("Error fetching liked posts:", error);
//       throw error;
//     }
//   },

//   // Fetch user's saved posts
//   getSavedPosts: async (userId) => {
//     try {
//       // First get the user's saved post IDs
//       const userDocRef = doc(db, "users", userId);
//       const userDoc = await getDoc(userDocRef);

//       if (!userDoc.exists()) {
//         return [];
//       }

//       const userData = userDoc.data();
//       const savedPostIds = userData.savedPosts || [];

//       if (savedPostIds.length === 0) {
//         return [];
//       }

//       // Fetch each post by ID
//       const savedPosts = [];
//       for (const postId of savedPostIds) {
//         const postDocRef = doc(db, "posts", postId);
//         const postDoc = await getDoc(postDocRef);

//         if (postDoc.exists()) {
//           savedPosts.push({
//             id: postDoc.id,
//             ...postDoc.data(),
//           });
//         }
//       }

//       return savedPosts;
//     } catch (error) {
//       console.error("Error fetching saved posts:", error);
//       throw error;
//     }
//   },

//   // Fetch user's shared goals
//   getSharedGoals: async (userId) => {
//     try {
//       const goalsQuery = query(
//         collection(db, "goals"),
//         where("userId", "==", userId),
//         where("isPublic", "==", true)
//       );

//       const goalsSnapshot = await getDocs(goalsQuery);
//       const goals = [];

//       goalsSnapshot.forEach((doc) => {
//         goals.push({
//           id: doc.id,
//           ...doc.data(),
//         });
//       });

//       return goals;
//     } catch (error) {
//       console.error("Error fetching shared goals:", error);
//       throw error;
//     }
//   },
// };

import { db, storage } from "../config/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const profileService = {
  // Existing functions...
  getUserProfile: async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  updateUserProfile: async (userId, userData) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, userData);
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  uploadProfilePicture: async (userId, file) => {
    try {
      const storageRef = ref(
        storage,
        `profilePictures/${userId}/${Date.now()}-${file.name}`
      );
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        profilePic: downloadURL,
      });
      return downloadURL;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  },

  getFollowersCount: async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.followers ? userData.followers.length : 0;
      }
      return 0;
    } catch (error) {
      console.error("Error getting followers count:", error);
      return 0;
    }
  },

  getFollowingCount: async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.following ? userData.following.length : 0;
      }
      return 0;
    } catch (error) {
      console.error("Error getting following count:", error);
      return 0;
    }
  },

  // New functions for getting followers/following details
  getFollowersDetails: async (userId) => {
    try {
      // Get the user's followers array
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return [];
      }

      const userData = userDoc.data();
      const followerIds = userData.followers || [];

      if (followerIds.length === 0) {
        return [];
      }

      // Fetch each follower's details
      const followersDetails = [];
      for (const followerId of followerIds) {
        const followerDocRef = doc(db, "users", followerId);
        const followerDoc = await getDoc(followerDocRef);

        if (followerDoc.exists()) {
          const followerData = followerDoc.data();
          followersDetails.push({
            uid: followerId,
            name: followerData.name || "Unknown User",
            profilePic: followerData.profilePic || "",
            isOnline: followerData.isOnline || false,
            bio: followerData.bio || "",
          });
        }
      }

      return followersDetails;
    } catch (error) {
      console.error("Error fetching followers details:", error);
      throw error;
    }
  },

  getFollowingDetails: async (userId) => {
    try {
      // Get the user's following array
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return [];
      }

      const userData = userDoc.data();
      const followingIds = userData.following || [];

      if (followingIds.length === 0) {
        return [];
      }

      // Fetch each following user's details
      const followingDetails = [];
      for (const followingId of followingIds) {
        const followingDocRef = doc(db, "users", followingId);
        const followingDoc = await getDoc(followingDocRef);

        if (followingDoc.exists()) {
          const followingData = followingDoc.data();
          followingDetails.push({
            uid: followingId,
            name: followingData.name || "Unknown User",
            profilePic: followingData.profilePic || "",
            isOnline: followingData.isOnline || false,
            bio: followingData.bio || "",
          });
        }
      }

      return followingDetails;
    } catch (error) {
      console.error("Error fetching following details:", error);
      throw error;
    }
  },

  getPostCount: async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.myPosts ? userData.myPosts.length : 0;
      }
      return 0;
    } catch (error) {
      console.error("Error getting post count:", error);
      return 0;
    }
  },

  getUserPosts: async (userId) => {
    try {
      const postsQuery = query(
        collection(db, "posts"),
        where("uid", "==", userId)
      );

      const postsSnapshot = await getDocs(postsQuery);
      const posts = [];

      postsSnapshot.forEach((doc) => {
        posts.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return posts;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  },

  getLikedPosts: async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return [];
      }

      const userData = userDoc.data();
      const likedPostIds = userData.likedPosts || [];

      if (likedPostIds.length === 0) {
        return [];
      }

      const likedPosts = [];
      for (const postId of likedPostIds) {
        const postDocRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postDocRef);

        if (postDoc.exists()) {
          likedPosts.push({
            id: postDoc.id,
            ...postDoc.data(),
          });
        }
      }

      return likedPosts;
    } catch (error) {
      console.error("Error fetching liked posts:", error);
      throw error;
    }
  },

  getSavedPosts: async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        return [];
      }

      const userData = userDoc.data();
      const savedPostIds = userData.savedPosts || [];

      if (savedPostIds.length === 0) {
        return [];
      }

      const savedPosts = [];
      for (const postId of savedPostIds) {
        const postDocRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postDocRef);

        if (postDoc.exists()) {
          savedPosts.push({
            id: postDoc.id,
            ...postDoc.data(),
          });
        }
      }

      return savedPosts;
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      throw error;
    }
  },

  getSharedGoals: async (userId) => {
    try {
      const goalsQuery = query(
        collection(db, "goals"),
        where("userId", "==", userId),
        where("isPublic", "==", true)
      );

      const goalsSnapshot = await getDocs(goalsQuery);
      const goals = [];

      goalsSnapshot.forEach((doc) => {
        goals.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return goals;
    } catch (error) {
      console.error("Error fetching shared goals:", error);
      throw error;
    }
  },
};
