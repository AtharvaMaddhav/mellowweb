import React, { useEffect, useState } from 'react';
import { getDailyActivity, getFunTasks, getPastActivities, markActivityCompleted } from '../../services/activityService';
import { auth } from '../../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import SideBar from '../SideBar/SideBar';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FaCalendarAlt } from 'react-icons/fa'; // Importing calendar icon

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dailyActivity, setDailyActivity] = useState(null);
  const [funTasks, setFunTasks] = useState([]);
  const [pastActivities, setPastActivities] = useState([]);
  const [completing, setCompleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) navigate('/auth');
    });

    const fetchDailyActivity = async () => {
      try {
        await getDailyActivity();
        console.log("Today's activity ensured.");
      } catch (error) {
        console.error("Error ensuring today's activity:", error);
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const activity = await getDailyActivity();
        setDailyActivity(activity);
        const tasks = await getFunTasks();
        setFunTasks(tasks.tasks);
        const past = await getPastActivities(7);
        setPastActivities(past);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return unsubscribe;
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
      navigate('/auth');
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  const handleCompleteActivity = async () => {
    if (!user) {
      console.error("User not logged in");
      alert("Please log in to complete the activity.");
      return;
    }

    try {
      setCompleting(true);
      const updatedActivity = await markActivityCompleted(user.uid);
      setDailyActivity(updatedActivity);
    } catch (error) {
      console.error("Error completing activity:", error);
      alert("Failed to mark activity as completed. Please try again.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4 text-lg">Loading your mellow experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-black text-white font-sans">
      <SideBar />

      <div className="ml-75 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Welcome to Mellow, {user.displayName || 'Guest'}!</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Video Section */}
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
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

        {/* Today's Activity - With Updated Completion Logic */}
        <div className="bg-gray-900 rounded-xl p-6 mb-8 border border-gray-800 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Today's Activity</h2>
          {dailyActivity && (
            <div className="flex items-start gap-4 border-none pb-4">
              <span className="text-lg font-bold text-green-400">🎯</span>
              <div className="flex-1">
                <h3 className="text-lg font-medium">{dailyActivity.title}</h3>
                <p className="text-gray-400">{dailyActivity.description}</p>
                <span className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full mt-2 inline-block">
                  {dailyActivity.time}
                </span>

                {/* Updated Completion Logic */}
                <div className="flex items-center gap-4 mt-3">
                  {dailyActivity.completedBy?.includes(user.uid) ? (
                    <div className="bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-md shadow-lg">
                      ✅ Completed
                    </div>
                  ) : (
                    <button
                      onClick={handleCompleteActivity}
                      disabled={completing}
                      className={`w-40 px-4 py-2 rounded-md text-white font-medium ${completing ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                        }`}
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
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-white">Past Activities</h2>

          <div className="space-y-6">
            {pastActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-gray-700 p-4 rounded-lg"
              >
                {/* Activity Number */}
                <span className="text-lg font-bold text-green-400">{index + 1}.</span>

                {/* Activity Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-300">{activity.title}</h3>
                  <p className="text-gray-400 mt-2">{activity.description}</p>

                  <span className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full mt-2 inline-block">
                    {activity.time}
                  </span>
                </div>

                {/* Right-Aligned Date */}
                <div className="text-right text-gray-400 opacity-70 min-w-[120px]">
                  <FaCalendarAlt className="inline-block text-yellow-400 mr-2" />
                  {format(new Date(activity.date), 'MMMM d, yyyy')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fun Activities Section */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700 shadow-lg">
          <h2 className="text-2xl font-semibold text-white mb-4">🎉 5 Fun Things To Do Today</h2>

          <div className="space-y-4">
            {funTasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-center gap-4 border-b border-gray-600 pb-3 transition duration-300 hover:bg-gray-700 p-3 rounded-lg"
              >
                {/* Task Number with Animation */}
                <span className="text-lg font-bold text-blue-400 transition-transform duration-300 transform hover:scale-110">
                  {index + 1}.
                </span>

                {/* Task Title */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-200">{task.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;