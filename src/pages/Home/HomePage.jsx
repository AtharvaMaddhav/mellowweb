import React, { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaStar, FaCalendarAlt, FaCheck, FaHistory, FaSmile, FaInfoCircle, FaComment, FaHeart } from "react-icons/fa";
import SideBar from "../SideBar/SideBar.jsx";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { format, isToday, isYesterday, subDays, startOfDay } from "date-fns";
import { dailyActivities } from "../../data/dailyActivities";
import { funActivities as funActivitiesData } from "../../data/funActivities";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dailyActivity, setDailyActivity] = useState(null);
  const [pastActivities, setPastActivities] = useState([]);
  const [funActivities, setFunActivities] = useState([]);
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const navigate = useNavigate();

  // Check user authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate("/auth");
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]);

  // Fetch data when user is authenticated
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Reference to user's activities collection
        const userActivitiesRef = collection(db, "users", user.uid, "activities");

        // ---------- Daily Activity Logic ----------
        const today = startOfDay(new Date()).getTime();

        // Check if there's already a daily activity for today
        const todayActivityQuery = query(
          userActivitiesRef,
          where("type", "==", "daily"),
          where("date", "==", today)
        );

        const todayActivitySnapshot = await getDocs(todayActivityQuery);

        let todayActivityDoc;

        if (todayActivitySnapshot.empty) {
          // No activity for today, create a new one
          const randomActivityIndex = Math.floor(Math.random() * dailyActivities.length);
          const newActivity = dailyActivities[randomActivityIndex];

          // Add to Firestore
          todayActivityDoc = await addDoc(userActivitiesRef, {
            type: "daily",
            title: newActivity.title,
            description: newActivity.description,
            time: newActivity.time,
            date: today,
            completed: false,
            createdAt: Date.now()
          });

          setDailyActivity({
            id: todayActivityDoc.id,
            title: newActivity.title,
            description: newActivity.description,
            time: newActivity.time,
            date: today,
            completed: false
          });
        } else {
          // Use existing activity for today
          todayActivityDoc = todayActivitySnapshot.docs[0];
          const activityData = todayActivityDoc.data();

          setDailyActivity({
            id: todayActivityDoc.id,
            title: activityData.title,
            description: activityData.description,
            time: activityData.time,
            date: activityData.date,
            completed: activityData.completed
          });
        }

        // ---------- Past Activities Logic ----------
        const pastActivitiesQuery = query(
          userActivitiesRef,
          where("type", "==", "daily"),
          where("date", "<", today),
          orderBy("date", "desc"),
          limit(10)
        );

        const pastActivitiesSnapshot = await getDocs(pastActivitiesQuery);

        if (!pastActivitiesSnapshot.empty) {
          const activitiesList = pastActivitiesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title,
              description: data.description,
              date: data.date,
              completed: data.completed
            };
          });

          setPastActivities(activitiesList);
        } else {
          // If no past activities, create demo data for first-time users
          // This would typically only happen on first use
          const demoActivities = [];

          // Create activities for the past 5 days
          for (let i = 1; i <= 5; i++) {
            const pastDate = subDays(new Date(), i).getTime();
            const randomIndex = Math.floor(Math.random() * dailyActivities.length);
            const pastActivity = dailyActivities[randomIndex];

            // Random completion status
            const completed = Math.random() > 0.5;

            // Add to Firestore
            const demoActivityDoc = await addDoc(userActivitiesRef, {
              type: "daily",
              title: pastActivity.title,
              description: pastActivity.description,
              time: pastActivity.time,
              date: pastDate,
              completed: completed,
              createdAt: Date.now() - (i * 86400000) // Simulate creation in the past
            });

            demoActivities.push({
              id: demoActivityDoc.id,
              title: pastActivity.title,
              description: pastActivity.description,
              date: pastDate,
              completed: completed
            });
          }

          demoActivities.sort((a, b) => b.date - a.date);
          setPastActivities(demoActivities);
        }

        // ---------- Fun Activities Logic ----------
        // Check if we already have fun activities for today
        const funActivitiesQuery = query(
          userActivitiesRef,
          where("type", "==", "fun"),
          where("date", "==", today)
        );

        const funActivitiesSnapshot = await getDocs(funActivitiesQuery);

        if (!funActivitiesSnapshot.empty) {
          // Use existing fun activities
          const activitiesList = funActivitiesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title,
              completed: data.completed
            };
          });

          setFunActivities(activitiesList);
        } else {
          // Create new fun activities for today
          const randomFunActivities = [];
          const usedIndices = new Set();

          while (randomFunActivities.length < 5) {
            const randomIndex = Math.floor(Math.random() * funActivitiesData.length);

            if (!usedIndices.has(randomIndex)) {
              usedIndices.add(randomIndex);

              // Add to Firestore
              const newFunActivityDoc = await addDoc(userActivitiesRef, {
                type: "fun",
                title: funActivitiesData[randomIndex].title,
                date: today,
                completed: false,
                createdAt: Date.now()
              });

              randomFunActivities.push({
                id: newFunActivityDoc.id,
                title: funActivitiesData[randomIndex].title,
                completed: false
              });
            }
          }

          setFunActivities(randomFunActivities);
        }

      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle marking activity as completed
  const handleCompleteActivity = async (activityId, type) => {
    try {
      if (!user) return;

      // Update in Firestore
      const activityRef = doc(db, "users", user.uid, "activities", activityId);
      await updateDoc(activityRef, {
        completed: true
      });

      // Update in state
      if (type === 'daily' && dailyActivity?.id === activityId) {
        setDailyActivity({
          ...dailyActivity,
          completed: true
        });
      } else if (type === 'past') {
        setPastActivities(pastActivities.map(activity =>
          activity.id === activityId
            ? { ...activity, completed: true }
            : activity
        ));
      } else if (type === 'fun') {
        setFunActivities(funActivities.map(activity =>
          activity.id === activityId
            ? { ...activity, completed: true }
            : activity
        ));
      }
    } catch (error) {
      console.error("Error completing activity:", error);
    }
  };

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

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";

    const dateObj = new Date(date);

    if (isToday(dateObj)) {
      return "Today";
    } else if (isYesterday(dateObj)) {
      return "Yesterday";
    } else {
      return format(dateObj, "MMM d");
    }
  };

  if (loading) {
    return (
      <div className="flex w-full min-h-screen bg-black text-white font-sans items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading your activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-black text-white font-sans">
      {/* Sidebar */}
      <div className="w-100 fixed top-0 left-0 h-screen bg-black text-white p-6 overflow-y-auto">
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-80 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome {user?.displayName || 'Friend'}!</h1>
            <p className="text-gray-400">How are you feeling today?</p>
          </div>

          {/* Video Section */}
          <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
            <video
              className="w-full rounded-lg"
              autoPlay
              loop
              muted
              playsInline
              controls={false}  // Hides controls for a cleaner look
              src="/homepagevideo.mp4"
              alt="Mindfulness Video"
            />
          </div>

          {/* Daily Fun Activity Section */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800 shadow-lg">
            <div className="flex items-center mb-4">
              <FaStar className="text-yellow-500 mr-2 text-xl" />
              <h2 className="text-xl font-bold">Today's Fun Activity</h2>
            </div>
            {dailyActivity ? (
              <>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">{dailyActivity.title}</h3>
                <p className="text-gray-300 mb-4">{dailyActivity.description}</p>

                {/* Like and Comment Section */}
                <div className="flex items-center gap-4 mb-4">
                  {/* Like Button */}
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${dailyActivity.liked ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
                      }`}
                    onClick={() => handleLikeActivity(dailyActivity.id)}
                  >
                    <FaHeart className="text-xl" />
                    {dailyActivity.liked ? 'Liked' : 'Like'}
                  </button>

                  {/* Comment Button */}
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    onClick={() => handleCommentActivity(dailyActivity.id)}
                  >
                    <FaComment className="text-xl" />
                    Comment
                  </button>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm bg-blue-900 text-blue-300 px-3 py-1 rounded-full">
                    <FaCalendarAlt className="inline mr-1" /> {dailyActivity.time}
                  </span>
                  {dailyActivity.completed ? (
                    <button
                      className="bg-green-700 text-white px-4 py-2 rounded-lg cursor-not-allowed opacity-80"
                      disabled
                    >
                      <FaCheck className="inline mr-1" /> Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCompleteActivity(dailyActivity.id, 'daily')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                    >
                      Complete Activity
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center py-4 text-gray-500">No daily activity available</p>
            )}
          </div>

          {/* Past Activities Section */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800 shadow-lg">
            <div className="flex items-center mb-4">
              <FaHistory className="text-purple-500 mr-2 text-xl" />
              <h2 className="text-xl font-bold">Past Activities</h2>
            </div>
            {pastActivities.length > 0 ? (
              <div className="space-y-3">
                {pastActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-gray-800 p-6 rounded-lg shadow-md relative"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${activity.completed ? 'bg-green-600' : 'bg-gray-600'
                            }`}
                          onClick={() => !activity.completed && handleCompleteActivity(activity.id, 'past')}
                          style={{ cursor: activity.completed ? 'default' : 'pointer' }}
                        >
                          {activity.completed && <FaCheck className="text-white text-xs" />}
                        </div>
                        <span className="text-lg font-semibold">{activity.title}</span>
                      </div>
                      <span className="text-sm text-gray-400">{formatDate(activity.date)}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{activity.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No past activities yet. Check back tomorrow!</p>
              </div>
            )}
          </div>

          {/* 5 Fun Things To Do Today Section */}
          <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800 shadow-lg">
            <div className="flex items-center mb-4">
              <FaSmile className="text-green-500 mr-2 text-xl" />
              <h2 className="text-xl font-bold">5 Fun Things To Do Today</h2>
            </div>
            {funActivities.length > 0 ? (
              <ul className="space-y-3">
                {funActivities.map((item, index) => (
                  <li
                    key={item.id}
                    className={`flex items-start p-3 bg-gray-800 rounded-lg ${item.completed ? 'opacity-75' : ''
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 ${item.completed ? 'bg-green-700 text-green-200' : 'bg-green-900 text-green-400'
                        }`}
                      onClick={() => !item.completed && handleCompleteActivity(item.id, 'fun')}
                      style={{ cursor: item.completed ? 'default' : 'pointer' }}
                    >
                      {item.completed ? <FaCheck size={12} /> : index + 1}
                    </div>
                    <p className={item.completed ? 'line-through text-gray-500' : ''}>{item.title}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Loading fun activities...</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="mb-8">
            {user && (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-red-600 text-white cursor-pointer rounded-lg hover:bg-red-700 transition font-medium"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}