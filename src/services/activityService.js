// services/activityService.js
import { db } from "../config/firebase.js";
import { collection, addDoc, getDocs, query, orderBy, limit, where, Timestamp } from "firebase/firestore";
import { dailyActivities } from "../data/dailyActivities";
import { funActivities } from "../data/funActivities";

// Collection references
const ACTIVITIES_COLLECTION = "activities";
const USER_ACTIVITIES_COLLECTION = "userActivities";

// Get today's random daily activity
export const getTodayActivity = async (userId) => {
  try {
    // Check if we already have a daily activity for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTimestamp = Timestamp.fromDate(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = Timestamp.fromDate(tomorrow);
    
    const activitiesRef = collection(db, ACTIVITIES_COLLECTION);
    const todayActivityQuery = query(
      activitiesRef,
      where("userId", "==", userId),
      where("date", ">=", todayTimestamp),
      where("date", "<", tomorrowTimestamp),
      where("type", "==", "daily"),
      limit(1)
    );
    
    const querySnapshot = await getDocs(todayActivityQuery);
    
    // If we already have today's activity, return it
    if (!querySnapshot.empty) {
      const activityDoc = querySnapshot.docs[0];
      return { id: activityDoc.id, ...activityDoc.data() };
    }
    
    // Otherwise, generate a new random daily activity
    const randomIndex = Math.floor(Math.random() * dailyActivities.length);
    const selectedActivity = dailyActivities[randomIndex];
    
    // Save to Firestore
    const newActivity = {
      userId,
      activityId: selectedActivity.id,
      title: selectedActivity.title,
      description: selectedActivity.description,
      time: selectedActivity.time,
      date: Timestamp.fromDate(today),
      completed: false,
      type: "daily"
    };
    
    const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), newActivity);
    return { id: docRef.id, ...newActivity };
    
  } catch (error) {
    console.error("Error getting today's activity:", error);
    throw error;
  }
};

// Get past activities (last 5 days)
export const getPastActivities = async (userId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    
    const activitiesRef = collection(db, ACTIVITIES_COLLECTION);
    const pastActivitiesQuery = query(
      activitiesRef,
      where("userId", "==", userId),
      where("date", ">=", Timestamp.fromDate(fiveDaysAgo)),
      where("date", "<", Timestamp.fromDate(today)),
      where("type", "==", "daily"),
      orderBy("date", "desc"),
      limit(5)
    );
    
    const querySnapshot = await getDocs(pastActivitiesQuery);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate() // Convert Timestamp to Date
    }));
    
  } catch (error) {
    console.error("Error getting past activities:", error);
    throw error;
  }
};

// Get random fun activities (5 random suggestions)
export const getFunActivities = async (userId) => {
  try {
    // Get 5 random fun activities
    const randomActivities = [];
    const usedIndices = new Set();
    
    while (randomActivities.length < 5) {
      const randomIndex = Math.floor(Math.random() * funActivities.length);
      
      if (!usedIndices.has(randomIndex)) {
        usedIndices.add(randomIndex);
        randomActivities.push(funActivities[randomIndex]);
      }
    }
    
    // Store today's fun activities for this user
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // First, check if we already have fun activities for today
    const activitiesRef = collection(db, ACTIVITIES_COLLECTION);
    const todayFunQuery = query(
      activitiesRef,
      where("userId", "==", userId),
      where("date", "==", Timestamp.fromDate(today)),
      where("type", "==", "fun")
    );
    
    const querySnapshot = await getDocs(todayFunQuery);
    
    // If we already have fun activities for today, return them
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
    
    // Otherwise, save the new random activities
    const activitiesPromises = randomActivities.map(activity => {
      const newActivity = {
        userId,
        activityId: activity.id,
        title: activity.title,
        date: Timestamp.fromDate(today),
        completed: false,
        type: "fun"
      };
      
      return addDoc(collection(db, ACTIVITIES_COLLECTION), newActivity);
    });
    
    const docRefs = await Promise.all(activitiesPromises);
    
    return randomActivities.map((activity, index) => ({
      id: docRefs[index].id,
      userId,
      activityId: activity.id,
      title: activity.title,
      date: today,
      completed: false,
      type: "fun"
    }));
    
  } catch (error) {
    console.error("Error getting fun activities:", error);
    throw error;
  }
};

// Mark an activity as completed
export const markActivityCompleted = async (activityId, completed = true) => {
  try {
    const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
    await updateDoc(activityRef, { completed });
    return { success: true };
  } catch (error) {
    console.error("Error marking activity completed:", error);
    throw error;
  }
};