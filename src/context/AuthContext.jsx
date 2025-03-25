import { createContext, useContext, useEffect, useState } from "react";
// import { auth } from "../firebase";
import { auth } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Create a Context for Authentication
const AuthContext = createContext();

// Create an Auth Provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Store logged-in user
    const [loading, setLoading] = useState(true); // Track loading state

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Set user if logged in
            setLoading(false); // Stop loading
        });

        return () => unsubscribe(); // Cleanup function
    }, []);

    // Logout function
    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, logout }}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};

// Custom hook to use Auth Context
export const useAuth = () => useContext(AuthContext);