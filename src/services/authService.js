import { auth, provider, db } from "../config/firebase.js";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// Function to check user authentication state
export const checkAuthState = (callback) => {
  return onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        callback(currentUser);
      } else {
        console.log("User data missing in Firestore");
        alert("User data not found. Please sign up first.");
        signOut(auth);
      }
    } else {
      callback(null);
    }
  });
};

// Function to store user data in Firestore
export const storeUserData = async (user, authType) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "No Name",
        email: user.email,
        profilePic: user.photoURL || "",
        authType: authType,
        bio: "Mellow by Choice!",
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        isOnline: true,
        followers: [],
        following: [],
      });
    } else {
      await setDoc(userRef, { lastSeen: serverTimestamp(), isOnline: true }, { merge: true });
    }
  } catch (error) {
    console.error("Error storing user data:", error.message);
  }
};

// Function to handle email/password login
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid); 
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      console.log("Login Error: User does not exist in Firestore.");
      alert("User does not exist. Please sign up first.");
      return null;
    }

    await setDoc(userDocRef, { lastSeen: serverTimestamp(), isOnline: true }, { merge: true });
    return user;
  } catch (error) {
    console.log("Login Error:", error.message);
    alert(error.message);
    return null;
  }
};

// Function to handle Google login
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    await storeUserData(result.user, "google");
    return result.user;
  } catch (error) {
    console.error("Google Login Error:", error.message);
    return null;
  }
};
