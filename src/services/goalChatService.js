import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  getDocs
} from "firebase/firestore";
import { db } from "../config/firebase";

// Send a message to a goal chat
export const sendGoalChatMessage = async (goalId, userId, message, userName, userAvatar) => {
  try {
    const goalChatsRef = collection(db, "goals", goalId, "goalChats");
    
    const messageData = {
      userId,
      userName,
      userAvatar,
      message,
      timestamp: serverTimestamp(),
    };
    
    const docRef = await addDoc(goalChatsRef, messageData);
    return { id: docRef.id, ...messageData };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Listen to real-time messages from a goal chat
export const subscribeToGoalChat = (goalId, callback) => {
  try {
    const goalChatsRef = collection(db, "goals", goalId, "goalChats");
    const q = query(goalChatsRef, orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      callback(messages);
    }, (error) => {
      console.error("Error listening to chat:", error);
      callback([]);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error("Error subscribing to goal chat:", error);
    throw error;
  }
};

// Fetch initial messages from a goal chat
export const getGoalChatMessages = async (goalId) => {
  try {
    const goalChatsRef = collection(db, "goals", goalId, "goalChats");
    const q = query(goalChatsRef, orderBy("timestamp", "asc"));
    
    const snapshot = await getDocs(q);
    const messages = [];
    
    snapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return messages;
  } catch (error) {
    console.error("Error fetching goal chat messages:", error);
    return [];
  }
};

// Get a single goal's details
export const getGoalDetails = async (goalId) => {
  try {
    const goalRef = doc(db, "goals", goalId);
    const goalSnap = await getDoc(goalRef);
    
    if (goalSnap.exists()) {
      return {
        id: goalSnap.id,
        ...goalSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching goal details:", error);
    return null;
  }
};
