import React, { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaEllipsisH } from "react-icons/fa";
import SideBar from "../SideBar/SideBar.jsx";


export default function HomePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check user authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-black text-white font-sans">
      {/* Sidebar */}
      <SideBar />

      {/* Main Content */}
      <div className="flex-grow p-5 max-w-3xl mx-auto">
        {/* Logout Button */}
        <div className="p-5 pt-2 border-t border-gray-800">
          {user && (
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 text-white cursor-pointer rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* Stories Section */}
        <div className="flex gap-4 py-3 mb-6 overflow-x-auto scrollbar-hide">
          {["joji_tha...", "mr.hight...", "sujita8104", "shikhardh...", "shivani_...", "anushka...", "sreeleela...", "dhanash..."].map(
            (name, index) => (
              <div key={index} className="flex flex-col items-center cursor-pointer">
                <div className="w-16 h-16 rounded-full mb-2 p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                  <img src="https://via.placeholder.com/60" alt="Story Avatar" className="rounded-full w-full h-full object-cover border-2 border-black" />
                </div>
                <span className="text-xs overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[65px] text-center">
                  {name}
                </span>
              </div>
            )
          )}
        </div>

        {/* Post Section */}
        <div className="bg-black rounded-lg mb-6">
          <div className="flex justify-between items-center p-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full mr-3">
                <img src="https://via.placeholder.com/40" alt="User Avatar" className="w-full h-full rounded-full object-cover" />
              </div>
              <div>
                <div className="font-semibold mb-0.5 flex items-center">
                  atharvaaa
                  <span className="inline-block ml-1 w-3.5 h-3.5 bg-blue-500 text-white text-xs rounded-full text-center leading-3.5">✓</span>
                </div>
                <div className="text-xs text-gray-500">1h</div>
              </div>
            </div>
            <div className="cursor-pointer">
              <FaEllipsisH />
            </div>
          </div>

          <div className="w-full max-h-screen overflow-hidden">
            <img src="https://www.ucheck.co.uk/wp-content/uploads/mental-health-2313426_1280.png" alt="Post" className="w-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
