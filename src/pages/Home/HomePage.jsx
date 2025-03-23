<<<<<<< Updated upstream
import React, { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaEllipsisH } from "react-icons/fa";
import SideBar from "../SideBar/SideBar.jsx";
=======
import React, { useEffect, useState } from 'react';
import { getDailyActivity, getFunTasks, getPastActivities, markActivityCompleted } from '../../services/activityService';
import { auth } from '../../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import SideBar from '../SideBar/SideBar';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaCalendarAlt } from 'react-icons/fa';
>>>>>>> Stashed changes


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
<<<<<<< Updated upstream
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
=======
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-black text-white font-sans">
      <SideBar />

      <div className="w-full md:ml-64 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 sm:mb-0">Welcome to Mellow, {user.displayName || 'Guest'}!</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Video Section */}
        <div className="mb-6 rounded-lg overflow-hidden shadow-lg">
          <video
            className="w-full rounded-lg"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            src="/homepagevideo.mp4"
            alt="Mindfulness Video"
          />
        </div>

        {/* Today's Activity */}
        <div className="bg-gray-900 rounded-xl p-4 md:p-5 mb-6 border border-gray-800 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Today's Activity</h2>
          {dailyActivity && (
            <div className="flex items-start gap-3 pb-3">
              <span className="text-lg font-bold text-green-400">🎯</span>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-medium">{dailyActivity.title}</h3>
                <p className="text-gray-400 text-sm md:text-base">{dailyActivity.description}</p>
                <span className="bg-blue-500 text-white text-xs md:text-sm font-medium px-2 py-0.5 rounded-full mt-2 inline-block">
                  {dailyActivity.time}
                </span>

                <div className="flex items-center gap-3 mt-3">
                  {dailyActivity.completedBy?.includes(user.uid) ? (
                    <div className="bg-green-600 text-white text-xs md:text-sm font-bold px-3 py-1.5 rounded-md shadow-lg">
                      ✅ Completed
                    </div>
                  ) : (
                    <button
                      onClick={handleCompleteActivity}
                      disabled={completing}
                      className={`w-32 px-3 py-1.5 rounded-md text-white text-sm font-medium ${completing ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                      {completing ? "Marking..." : "Complete"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Past Activities Section */}
        <div className="bg-gray-800 rounded-xl p-4 md:p-5 mb-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-white">Past Activities</h2>

          <div className="space-y-4">
            {pastActivities.map((activity, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-gray-700 p-3 rounded-lg"
              >
                <span className="text-base font-bold text-green-400">{index + 1}.</span>

                <div className="flex-1">
                  <h3 className="text-base font-semibold text-blue-300">{activity.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{activity.description}</p>

                  <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block">
                    {activity.time}
                  </span>
                </div>

                <div className="text-right text-gray-400 opacity-70 text-xs sm:text-sm mt-2 sm:mt-0">
                  <FaCalendarAlt className="inline-block text-yellow-400 mr-1" />
                  {format(new Date(activity.date), 'MMM d, yyyy')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fun Activities Section */}
        <div className="bg-gray-800 rounded-xl p-4 md:p-5 mb-6 border border-gray-700 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-3">🎉 5 Fun Things To Do Today</h2>

          <div className="space-y-3">
            {funTasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-center gap-3 border-b border-gray-600 pb-2 transition duration-300 hover:bg-gray-700 p-2 rounded-lg"
              >
                <span className="text-base font-bold text-blue-400 transition-transform duration-300 transform hover:scale-110">
                  {index + 1}.
                </span>

                <div className="flex-1">
                  <h3 className="text-base font-medium text-gray-200">{task.title}</h3>
                </div>
>>>>>>> Stashed changes
              </div>
            )
          )}
        </div>
<<<<<<< Updated upstream

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
=======
>>>>>>> Stashed changes
      </div>
    </div>
  );
}
