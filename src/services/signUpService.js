// import { auth, provider, db } from "../config/firebase.js";
// import {
//   signInWithPopup,
//   createUserWithEmailAndPassword,
//   setPersistence,
//   browserSessionPersistence,
// } from "firebase/auth";
// import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// // Save user data in Firestore
// const saveUserToFirestore = async (user, name = "User", authType = "email_signup") => {
//   const userData = {
//     uid: user.uid,
//     name,
//     email: user.email,
//     profilePic: user.photoURL || "",
//     authType,
//     bio: "Mellow by Choice!",
//     createdAt: serverTimestamp(),
//     lastSeen: serverTimestamp(),
//     isOnline: true,
//     followers: [],
//     following: [],
//     mellow_coins: 0, 
//   };

//   try {
//     await setDoc(doc(db, "users", user.uid), userData);
//     console.log("User data saved in Firestore:", userData);
//   } catch (error) {
//     console.error("Firestore Error:", error.message);
//   }
// };

// // Handle sign-up with email and password
// export const handleSignUp = async (formData, navigate) => {
//   if (formData.password !== formData.confirmPassword) {
//     return "Passwords do not match!";
//   }

//   try {
//     const userCredential = await createUserWithEmailAndPassword(
//       auth,
//       formData.email,
//       formData.password
//     );
//     await saveUserToFirestore(userCredential.user, formData.name, "email_signup");
//     console.log("User registered successfully");

//     navigate("/home"); // ✅ Pass navigate from the component
//     return null;
//   } catch (error) {
//     return error.message;
//   }
// };

// // Handle Google sign-up
// export const handleSignUpWithGoogle = async (navigate) => {
//   try {
//     await setPersistence(auth, browserSessionPersistence);
//     const result = await signInWithPopup(auth, provider);
//     await saveUserToFirestore(result.user, result.user.displayName, "google_signup");
//     console.log("Google sign-up successful");

//     navigate("/home"); // ✅ Pass navigate from the component
//     return null;
//   } catch (error) {
//     return error.message;
//   }
// };

import { auth, provider, db } from "../config/firebase.js";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

// Save user data in Firestore
const saveUserToFirestore = async (user, name = "User", authType = "email_signup", interests = "") => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  // If user already exists (e.g., Google login), don’t overwrite data
  if (userSnap.exists()) {
    console.log("User already exists in Firestore:", user.email);
    return;
  }

  const userData = {
    uid: user.uid,
    name,
    email: user.email,
    profilePic: user.photoURL || "",
    authType,
    bio: "Mellow by Choice!",
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
    isOnline: true,
    followers: [],
    following: [],
    mellow_coins: 0,
    interests: interests
      ? interests
          .split(",") // ✅ Convert to array
          .map((i) => i.trim())
          .filter(Boolean)
      : [], // ✅ Default empty array if no interests provided
  };

  try {
    await setDoc(userRef, userData);
    console.log("User data saved in Firestore:", userData);
  } catch (error) {
    console.error("Firestore Error:", error.message);
  }
};

// Handle sign-up with email and password
export const handleSignUp = async (formData, navigate) => {
  if (formData.password !== formData.confirmPassword) {
    return "Passwords do not match!";
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    await saveUserToFirestore(
      userCredential.user,
      formData.name,
      "email_signup",
      formData.interests // ✅ Pass interests to Firestore
    );

    console.log("User registered successfully");
    navigate("/home");
    return null;
  } catch (error) {
    return error.message;
  }
};

// Handle Google sign-up
export const handleSignUpWithGoogle = async (navigate) => {
  try {
    await setPersistence(auth, browserSessionPersistence);
    const result = await signInWithPopup(auth, provider);

    // For Google signup, interests field will be empty initially
    await saveUserToFirestore(result.user, result.user.displayName, "google_signup", "");

    console.log("Google sign-up successful");
    navigate("/home");
    return null;
  } catch (error) {
    return error.message;
  }
};
