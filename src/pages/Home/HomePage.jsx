import React, { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaHome, FaSearch, FaCompass, FaVideo, FaFacebookMessenger, FaHeart, FaPlus, FaUser, FaEllipsisH } from 'react-icons/fa';

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
      {/* Left Sidebar - Made scrollable */}
      <div className="w-60 border-r border-gray-800 h-screen sticky top-0 flex flex-col">
        {/* Fixed header section */}
        <div className="p-5 pb-4">
          <h1 className="text-2xl font-normal" style={{ fontFamily: 'Pacifico, cursive' }}>Mellow!</h1>
        </div>
        
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center p-3 cursor-pointer rounded-lg transition hover:bg-gray-900 font-bold">
              <FaHome size={24} />
              <span className="ml-4 text-base">Home</span>
            </div>
            <div className="flex items-center p-3 cursor-pointer rounded-lg transition hover:bg-gray-900">
              <FaSearch size={24} />
              <span className="ml-4 text-base">Search</span>
            </div>
            <div className="flex items-center p-3 cursor-pointer rounded-lg transition hover:bg-gray-900">
              <FaCompass size={24} />
              <span className="ml-4 text-base">Explore</span>
            </div>
            <div className="flex items-center p-3 cursor-pointer rounded-lg transition hover:bg-gray-900">
              <FaVideo size={24} />
              <span className="ml-4 text-base">Daily Goals</span>
            </div>
            <div className="flex items-center p-3 cursor-pointer rounded-lg transition hover:bg-gray-900">
              <FaFacebookMessenger size={24} />
              <span className="ml-4 text-base">Chat</span>
            </div>
            <div className="flex items-center p-3 cursor-pointer rounded-lg transition hover:bg-gray-900">
              <FaHeart size={24} />
              <span className="ml-4 text-base">Notifications</span>
            </div>
            <div className="flex items-center p-3 cursor-pointer rounded-lg transition hover:bg-gray-900">
              <FaPlus size={24} />
              <span className="ml-4 text-base">Create</span>
            </div>
            <div className="flex items-center p-3 cursor-pointer rounded-lg transition hover:bg-gray-900">
              <FaUser size={24} />
              <span className="ml-4 text-base">Profile</span>
            </div>
            
            <div className="flex items-center p-3 cursor-pointer rounded-lg transition hover:bg-gray-900 mt-auto">
              <FaEllipsisH size={24} />
              <span className="ml-4 text-base">More</span>
            </div>
          </div>
        </div>
        
        {/* Fixed footer with logout button */}
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
      </div>

      {/* Main Content */}
      <div className="flex-grow p-5 max-w-3xl mx-auto">
        {/* Stories Section */}
        <div className="flex gap-4 py-3 mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-16 h-16 rounded-full mb-2 p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <img src="https://via.placeholder.com/60" alt="Story Avatar" className="rounded-full w-full h-full object-cover border-2 border-black" />
            </div>
            <span className="text-xs overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[65px] text-center">joji_tha...</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-16 h-16 rounded-full mb-2 p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <img src="https://via.placeholder.com/60" alt="Story Avatar" className="rounded-full w-full h-full object-cover border-2 border-black" />
            </div>
            <span className="text-xs overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[65px] text-center">mr.hight...</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-16 h-16 rounded-full mb-2 p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <img src="https://via.placeholder.com/60" alt="Story Avatar" className="rounded-full w-full h-full object-cover border-2 border-black" />
            </div>
            <span className="text-xs overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[65px] text-center">sujita8104</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-16 h-16 rounded-full mb-2 p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <img src="https://via.placeholder.com/60" alt="Story Avatar" className="rounded-full w-full h-full object-cover border-2 border-black" />
            </div>
            <span className="text-xs overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[65px] text-center">shikhardh...</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-16 h-16 rounded-full mb-2 p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <img src="https://via.placeholder.com/60" alt="Story Avatar" className="rounded-full w-full h-full object-cover border-2 border-black" />
            </div>
            <span className="text-xs overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[65px] text-center">shivani_...</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-16 h-16 rounded-full mb-2 p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <img src="https://via.placeholder.com/60" alt="Story Avatar" className="rounded-full w-full h-full object-cover border-2 border-black" />
            </div>
            <span className="text-xs overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[65px] text-center">anushka...</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-16 h-16 rounded-full mb-2 p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <img src="https://via.placeholder.com/60" alt="Story Avatar" className="rounded-full w-full h-full object-cover border-2 border-black" />
            </div>
            <span className="text-xs overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[65px] text-center">sreeleela...</span>
          </div>
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-16 h-16 rounded-full mb-2 p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
              <img src="https://via.placeholder.com/60" alt="Story Avatar" className="rounded-full w-full h-full object-cover border-2 border-black" />
            </div>
            <span className="text-xs overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[65px] text-center">dhanash...</span>
          </div>
        </div>

        {/* Suggestions Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold">Suggestions for you</h3>
            <a href="#" className="text-blue-500 font-semibold no-underline">See all</a>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-900 rounded-lg p-6 flex flex-col items-center relative">
              <div className="absolute top-2 right-2 cursor-pointer text-xl">×</div>
              <div className="w-20 h-20 rounded-full mb-3">
                <img src="https://via.placeholder.com/80" alt="Suggested Profile" className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="font-semibold mb-1.5 flex items-center">
                Álvaro Arbeloa
                <span className="inline-block ml-1 w-3.5 h-3.5 bg-blue-500 text-white text-xs rounded-full text-center leading-3.5">✓</span>
              </div>
              <div className="text-gray-500 text-xs mb-4 text-center">Instagram recommended</div>
              <button className="bg-blue-500 text-white border-none rounded-lg py-1.5 px-4 font-semibold cursor-pointer w-full">Follow</button>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 flex flex-col items-center relative">
              <div className="absolute top-2 right-2 cursor-pointer text-xl">×</div>
              <div className="w-20 h-20 rounded-full mb-3">
                <img src="https://via.placeholder.com/80" alt="Suggested Profile" className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="font-semibold mb-1.5 flex items-center">
                The Tonight Show
                <span className="inline-block ml-1 w-3.5 h-3.5 bg-blue-500 text-white text-xs rounded-full text-center leading-3.5">✓</span>
              </div>
              <div className="text-gray-500 text-xs mb-4 text-center">Instagram recommended</div>
              <button className="bg-blue-500 text-white border-none rounded-lg py-1.5 px-4 font-semibold cursor-pointer w-full">Follow</button>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 flex flex-col items-center relative">
              <div className="absolute top-2 right-2 cursor-pointer text-xl">×</div>
              <div className="w-20 h-20 rounded-full mb-3">
                <img src="https://via.placeholder.com/80" alt="Suggested Profile" className="w-full h-full rounded-full object-cover" />
              </div>
              <div className="font-semibold mb-1.5">Shay Mitchell</div>
              <div className="text-gray-500 text-xs mb-4 text-center">Instagram recommended</div>
              <button className="bg-blue-500 text-white border-none rounded-lg py-1.5 px-4 font-semibold cursor-pointer w-full">Follow</button>
            </div>
          </div>
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