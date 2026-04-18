import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { db } from "../config/firebase";

export const notificationService = {
  getUserNotifications: async (userId) => {
    try {
      const notificationsRef = collection(db, "users", userId, "notifications");
      const q = query(notificationsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      return [];
    }
  },

  sendGoalInviteNotification: async (receiverId, payload) => {
    try {
      const notificationsRef = collection(db, "users", receiverId, "notifications");
      const notificationPayload = {
        ...payload,
        status: "pending",
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(notificationsRef, notificationPayload);
      return { id: docRef.id, ...notificationPayload };
    } catch (error) {
      console.error("Error creating invite notification:", error);
      throw error;
    }
  },

  acceptGoalInvite: async (userId, notificationId, goalId) => {
    try {
      const notificationRef = doc(db, "users", userId, "notifications", notificationId);
      await updateDoc(notificationRef, {
        status: "accepted",
        respondedAt: serverTimestamp(),
      });

      const goalRef = doc(db, "goals", goalId);
      await updateDoc(goalRef, {
        members: arrayUnion(userId),
      });

      return true;
    } catch (error) {
      console.error("Error accepting goal invite:", error);
      throw error;
    }
  },

  ignoreGoalInvite: async (userId, notificationId) => {
    try {
      const notificationRef = doc(db, "users", userId, "notifications", notificationId);
      await updateDoc(notificationRef, {
        status: "ignored",
        respondedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error ignoring goal invite:", error);
      throw error;
    }
  },
};