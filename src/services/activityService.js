import { db } from "../config/firebase.js";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { dailyActivities } from "../data/dailyActivities";
import { funActivities } from "../data/funActivities";

// Format date as YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

// Get today's date formatted
const getTodayFormatted = () => formatDate(new Date());

// Get random activity from array
const getRandomActivity = (activities) => {
  const randomIndex = Math.floor(Math.random() * activities.length);
  return activities[randomIndex];
};

// Get random tasks from array (non-repeating)
const getRandomTasks = (tasks, count) => {
  const shuffled = [...tasks].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get daily activity for a specific date
export const getDailyActivity = async (date = getTodayFormatted()) => {
  const docRef = doc(db, "dailyActivity", date);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // If no activity exists for today, create a new one
    const randomActivity = getRandomActivity(dailyActivities);
    const activityData = {
      ...randomActivity,
      date,
      createdAt: new Date().toISOString(),
      completedBy: [] // No 'completedAt' field now
    };

    // Save to Firebase
    await setDoc(docRef, activityData);
    return activityData;
  }
};

// Mark daily activity as completed by a user
export const markActivityCompleted = async (userId, date = getTodayFormatted()) => {
  if (!userId) {
    throw new Error("User ID is required to mark an activity as completed");
  }

  const docRef = doc(db, "dailyActivity", date);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Activity not found");
  }

  const activityData = docSnap.data();

  // Check if the user has already completed the activity
  if (activityData.completedBy.includes(userId)) {
    return activityData; // No update needed
  }

  // Add user to completedBy array without duplicates
  await updateDoc(docRef, {
    completedBy: arrayUnion(userId)
  });

  // Return the updated activity
  const updatedDoc = await getDoc(docRef);
  return updatedDoc.data();
};

// Get fun tasks for a specific date
export const getFunTasks = async (date = getTodayFormatted()) => {
  const docRef = doc(db, "funTasks", date);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    const randomTasks = getRandomTasks(funActivities, 5);
    const tasksData = {
      tasks: randomTasks,
      date,
      createdAt: new Date().toISOString()
    };

    await setDoc(docRef, tasksData);
    return tasksData;
  }
};

// Get past activities for a specified number of days
export const getPastActivities = async (days = 7) => {
  const activities = [];
  const today = new Date();

  for (let i = 1; i <= days; i++) {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - i);
    const formattedDate = formatDate(pastDate);

    try {
      const activity = await getDailyActivity(formattedDate);
      activities.push(activity);
    } catch (error) {
      console.error(`Error fetching activity for ${formattedDate}:`, error);
    }
  }

  return activities;
};

// Get users who completed an activity for a specific date
export const getActivityCompletions = async (date = getTodayFormatted()) => {
  const docRef = doc(db, "dailyActivity", date);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      completedBy: data.completedBy || [],
      completionCount: data.completedBy ? data.completedBy.length : 0
    };
  }

  return {
    completedBy: [],
    completionCount: 0
  };
};
