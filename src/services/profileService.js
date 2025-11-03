// import { db, storage } from "../config/firebase";
// import {
//   doc,
//   getDoc,
//   updateDoc,
//   collection,
//   query,
//   where,
//   getDocs,
//   orderBy,
//   Timestamp
// } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// export const profileService = {
//   // Existing functions...
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

//   // FIXED: Using v9+ syntax
//   getUserDataOverview: async (userId) => {
//     try {
//       // Query for user data overview - you might need to adjust collection names
//       // based on your actual database structure
//       const overviewQuery = query(
//         collection(db, 'userDataOverview'),
//         where('userId', '==', userId)
//       );
      
//       const overviewSnapshot = await getDocs(overviewQuery);
      
//       return overviewSnapshot.docs.map(doc => ({
//         id: doc.id,
//         month: doc.data().month,
//         year: doc.data().year,
//         count: doc.data().count,
//         ...doc.data()
//       }));
//     } catch (error) {
//       console.error('Error fetching user data overview:', error);
//       return [];
//     }
//   },

//   // FIXED: Using v9+ syntax
//   getUserPostsInDateRange: async (userId, startDate, endDate) => {
//     try {
//       // Convert dates to Firestore Timestamps
//       const startTimestamp = Timestamp.fromDate(startDate);
//       const endTimestamp = Timestamp.fromDate(endDate);

//       const postsQuery = query(
//         collection(db, 'posts'),
//         where('uid', '==', userId), // Note: using 'uid' to match your existing getUserPosts function
//         where('createdAt', '>=', startTimestamp),
//         where('createdAt', '<=', endTimestamp),
//         orderBy('createdAt', 'desc')
//       );

//       const postsSnapshot = await getDocs(postsQuery);

//       return postsSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
//       }));
//     } catch (error) {
//       console.error('Error fetching posts in date range:', error);
//       return [];
//     }
//   },

//   // FIXED: Using v9+ syntax
//   getUserMoodDataInDateRange: async (userId, startDate, endDate) => {
//     try {
//       const startTimestamp = Timestamp.fromDate(startDate);
//       const endTimestamp = Timestamp.fromDate(endDate);

//       const moodQuery = query(
//         collection(db, 'userMoods'),
//         where('userId', '==', userId),
//         where('createdAt', '>=', startTimestamp),
//         where('createdAt', '<=', endTimestamp),
//         orderBy('createdAt', 'desc')
//       );

//       const moodSnapshot = await getDocs(moodQuery);

//       return moodSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
//       }));
//     } catch (error) {
//       console.error('Error fetching mood data in date range:', error);
//       return [];
//     }
//   },

//   // FIXED: Using v9+ syntax
//   getUserActivitiesInDateRange: async (userId, startDate, endDate) => {
//     try {
//       const startTimestamp = Timestamp.fromDate(startDate);
//       const endTimestamp = Timestamp.fromDate(endDate);

//       const activitiesQuery = query(
//         collection(db, 'userActivities'),
//         where('userId', '==', userId),
//         where('createdAt', '>=', startTimestamp),
//         where('createdAt', '<=', endTimestamp),
//         orderBy('createdAt', 'desc')
//       );

//       const activitiesSnapshot = await getDocs(activitiesQuery);

//       return activitiesSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
//       }));
//     } catch (error) {
//       console.error('Error fetching activities in date range:', error);
//       return [];
//     }
//   },

//   // FIXED: Using v9+ syntax
//   getUserGoalsInDateRange: async (userId, startDate, endDate) => {
//     try {
//       const startTimestamp = Timestamp.fromDate(startDate);
//       const endTimestamp = Timestamp.fromDate(endDate);

//       const goalsQuery = query(
//         collection(db, 'goals'), // Using 'goals' to match your existing getSharedGoals function
//         where('userId', '==', userId),
//         where('createdAt', '>=', startTimestamp),
//         where('createdAt', '<=', endTimestamp),
//         orderBy('createdAt', 'desc')
//       );

//       const goalsSnapshot = await getDocs(goalsQuery);

//       return goalsSnapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
//       }));
//     } catch (error) {
//       console.error('Error fetching goals in date range:', error);
//       return [];
//     }
//   },

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

//   uploadProfilePicture: async (userId, file) => {
//     try {
//       const storageRef = ref(
//         storage,
//         `profilePictures/${userId}/${Date.now()}-${file.name}`
//       );
//       await uploadBytes(storageRef, file);
//       const downloadURL = await getDownloadURL(storageRef);
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

//   // New functions for getting followers/following details
//   getFollowersDetails: async (userId) => {
//     try {
//       // Get the user's followers array
//       const userDocRef = doc(db, "users", userId);
//       const userDoc = await getDoc(userDocRef);

//       if (!userDoc.exists()) {
//         return [];
//       }

//       const userData = userDoc.data();
//       const followerIds = userData.followers || [];

//       if (followerIds.length === 0) {
//         return [];
//       }

//       // Fetch each follower's details
//       const followersDetails = [];
//       for (const followerId of followerIds) {
//         const followerDocRef = doc(db, "users", followerId);
//         const followerDoc = await getDoc(followerDocRef);

//         if (followerDoc.exists()) {
//           const followerData = followerDoc.data();
//           followersDetails.push({
//             uid: followerId,
//             name: followerData.name || "Unknown User",
//             profilePic: followerData.profilePic || "",
//             isOnline: followerData.isOnline || false,
//             bio: followerData.bio || "",
//           });
//         }
//       }

//       return followersDetails;
//     } catch (error) {
//       console.error("Error fetching followers details:", error);
//       throw error;
//     }
//   },

//   getFollowingDetails: async (userId) => {
//     try {
//       // Get the user's following array
//       const userDocRef = doc(db, "users", userId);
//       const userDoc = await getDoc(userDocRef);

//       if (!userDoc.exists()) {
//         return [];
//       }

//       const userData = userDoc.data();
//       const followingIds = userData.following || [];

//       if (followingIds.length === 0) {
//         return [];
//       }

//       // Fetch each following user's details
//       const followingDetails = [];
//       for (const followingId of followingIds) {
//         const followingDocRef = doc(db, "users", followingId);
//         const followingDoc = await getDoc(followingDocRef);

//         if (followingDoc.exists()) {
//           const followingData = followingDoc.data();
//           followingDetails.push({
//             uid: followingId,
//             name: followingData.name || "Unknown User",
//             profilePic: followingData.profilePic || "",
//             isOnline: followingData.isOnline || false,
//             bio: followingData.bio || "",
//           });
//         }
//       }

//       return followingDetails;
//     } catch (error) {
//       console.error("Error fetching following details:", error);
//       throw error;
//     }
//   },

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

//   getLikedPosts: async (userId) => {
//     try {
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

//   getSavedPosts: async (userId) => {
//     try {
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
  orderBy,
  Timestamp
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

  // Get feelings data from user's feelings subcollection
  getUserFeelingsInDateRange: async (userId, startDate, endDate) => {
    try {
      console.log('Fetching feelings for user:', userId, 'from', startDate, 'to', endDate);
      
      // Query the feelings subcollection within the user document
      const feelingsRef = collection(db, "users", userId, "feelings");
      const feelingsSnapshot = await getDocs(feelingsRef);
      
      const allFeelings = [];
      
      feelingsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('Processing feeling document:', doc.id, data);
        
        // Handle different possible date field names and formats
        let feelingDate;
        if (data.timestamp) {
          // Handle timestamp field (as shown in your screenshot)
          feelingDate = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
        } else if (data.createdAt) {
          feelingDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        } else {
          // Use document ID as date if it's in date format (like "2025-07-27")
          const dateFromId = new Date(doc.id);
          if (!isNaN(dateFromId.getTime())) {
            feelingDate = dateFromId;
          } else {
            console.warn('No valid date found for feeling:', doc.id);
            return; // Skip this document
          }
        }

        allFeelings.push({
          id: doc.id,
          ...data,
          createdAt: feelingDate
        });
      });

      console.log('All feelings before filtering:', allFeelings);

      // Filter by date range in JavaScript (client-side filtering)
      const filteredFeelings = allFeelings.filter(feeling => {
        const feelingDate = feeling.createdAt;
        const isInRange = feelingDate >= startDate && feelingDate <= endDate;
        console.log('Feeling date:', feelingDate, 'In range:', isInRange);
        return isInRange;
      });

      console.log('Filtered feelings:', filteredFeelings);
      return filteredFeelings.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error fetching feelings in date range:', error);
      return [];
    }
  },

  // Updated: Get posts in date range without complex indexing
  getUserPostsInDateRange: async (userId, startDate, endDate) => {
    try {
      // Get all user posts first (this works with existing single-field index)
      const postsQuery = query(
        collection(db, 'posts'),
        where('uid', '==', userId)
      );

      const postsSnapshot = await getDocs(postsQuery);
      const allPosts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));

      // Filter by date range in JavaScript (client-side filtering)
      const filteredPosts = allPosts.filter(post => {
        const postDate = post.createdAt;
        return postDate >= startDate && postDate <= endDate;
      });

      return filteredPosts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error fetching posts in date range:', error);
      return [];
    }
  },

  // Fixed: Use feelings data instead of mood data - removed 'this' reference
  getUserMoodDataInDateRange: async (userId, startDate, endDate) => {
    try {
      // Call the function directly without 'this'
      return await profileService.getUserFeelingsInDateRange(userId, startDate, endDate);
    } catch (error) {
      console.error('Error fetching mood data in date range:', error);
      return [];
    }
  },

  // Simplified: Return empty for now (can be implemented later if needed)
  getUserActivitiesInDateRange: async (userId, startDate, endDate) => {
    try {
      // Return empty array for now since userActivities collection might not exist
      // You can implement this when you have activity tracking features  
      return [];
    } catch (error) {
      console.error('Error fetching activities in date range:', error);
      return [];
    }
  },

  // Updated: Get goals in date range without complex indexing
  getUserGoalsInDateRange: async (userId, startDate, endDate) => {
    try {
      // Get all user goals first (this works with existing single-field index)
      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', userId)
      );

      const goalsSnapshot = await getDocs(goalsQuery);
      const allGoals = goalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
      }));

      // Filter by date range in JavaScript (client-side filtering)
      const filteredGoals = allGoals.filter(goal => {
        const goalDate = goal.createdAt;
        return goalDate >= startDate && goalDate <= endDate;
      });

      return filteredGoals.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error fetching goals in date range:', error);
      return [];
    }
  },

  // Get all feelings for a user (helper function)
  getUserAllFeelings: async (userId) => {
    try {
      const feelingsRef = collection(db, "users", userId, "feelings");
      const feelingsSnapshot = await getDocs(feelingsRef);
      
      const feelings = [];
      
      feelingsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // Handle different possible date field names and formats
        let feelingDate;
        if (data.timestamp) {
          feelingDate = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
        } else if (data.createdAt) {
          feelingDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        } else {
          // Use document ID as date if it's in date format
          const dateFromId = new Date(doc.id);
          if (!isNaN(dateFromId.getTime())) {
            feelingDate = dateFromId;
          } else {
            return; // Skip this document
          }
        }

        feelings.push({
          id: doc.id,
          ...data,
          createdAt: feelingDate
        });
      });

      return feelings.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error fetching all feelings:', error);
      return [];
    }
  },

  // Get feelings summary for a user
  getFeelingSummary: async (userId) => {
    try {
      const feelings = await profileService.getUserAllFeelings(userId);
      
      if (feelings.length === 0) {
        return {
          totalEntries: 0,
          averageMood: 0,
          moodTrends: {},
          recentEntry: null
        };
      }

      // Calculate average mood if mood scores are available
      const moodsWithScores = feelings.filter(f => f.moodIndex !== undefined);
      const averageMood = moodsWithScores.length > 0 ? 
        moodsWithScores.reduce((sum, f) => sum + f.moodIndex, 0) / moodsWithScores.length : 0;

      // Count mood types
      const moodTrends = {};
      feelings.forEach(feeling => {
        const moodType = feeling.moodLabel || feeling.mood || feeling.type || 'unknown';
        moodTrends[moodType] = (moodTrends[moodType] || 0) + 1;
      });

      return {
        totalEntries: feelings.length,
        averageMood: Math.round(averageMood * 10) / 10,
        moodTrends,
        recentEntry: feelings[0] // Most recent entry
      };
    } catch (error) {
      console.error('Error getting feeling summary:', error);
      return {
        totalEntries: 0,
        averageMood: 0,
        moodTrends: {},
        recentEntry: null
      };
    }
  },

  // All other existing functions remain the same...
  updateUserProfile: async (userId, userData) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const updatePayload = {
      ...userData,
      updatedAt: new Date(),
    };

    // ensure interests is always an array
    if (userData.interests && !Array.isArray(userData.interests)) {
      updatePayload.interests = [userData.interests];
    }

    await updateDoc(userDocRef, updatePayload);
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

  getFollowersDetails: async (userId) => {
    try {
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