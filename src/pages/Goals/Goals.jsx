import React, { useState, useEffect } from "react";
import SideBar from "../SideBar/SideBar.jsx";
import { Globe, Lock, Filter } from "lucide-react";
import RecommendedGoalsSection from "./RecommendedGoalsSection";
import PublicGoals from "./PublicGoals";
import PrivateGoals from "./PrivateGoals";
import CreateGoal from "./CreateGoal";
import FilterGoals from "./FilterGoals";
import { db, auth } from "../../config/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  arrayUnion,
  onSnapshot
} from "firebase/firestore";

const Goals = () => {
  const [activeTab, setActiveTab] = useState("Public");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [publicGoals, setPublicGoals] = useState([]);
  const [privateGoals, setPrivateGoals] = useState([]);
  const [recommendedGoals, setRecommendedGoals] = useState([]);
  const [joiningGoalId, setJoiningGoalId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    status: [],
    dateRange: {
      startDate: "",
      endDate: ""
    },
    categories: [],
    sortBy: "newest"
  });
  const [isFiltering, setIsFiltering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in, set the currentUserId
        setCurrentUserId(user.uid);
      } else {
        // User is signed out, set currentUserId to null
        setCurrentUserId(null);
        // Optionally, you could redirect to a login page here
      }
    });
    
    // Clean up the auth listener on component unmount
    return () => unsubscribe();
  }, []);

  // Set up real-time listeners for goals
  useEffect(() => {
    // Don't fetch goals if there's no authenticated user
    if (!currentUserId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Create queries for public goals
    // We now use two separate queries:
    
    // 1. For public goals where the current user is a member
    const publicMemberGoalsQuery = query(
      collection(db, "goals"),
      where("goalType", "==", "Public"),
      where("members", "array-contains", currentUserId)
    );
    
    // 2. For all other public goals (for recommended section)
    const allPublicGoalsQuery = query(
      collection(db, "goals"), 
      where("goalType", "==", "Public")
    );
    
    // For private goals
    const privateGoalsQuery = query(
      collection(db, "goals"), 
      where("goalType", "==", "Private"),
      where("userId", "==", currentUserId)
    );
    
    // Set up real-time listener for public goals where user is a member
    const unsubscribePublicMember = onSnapshot(publicMemberGoalsQuery, (snapshot) => {
      const memberPublicGoalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Update state with public goals where user is a member
      setPublicGoals(memberPublicGoalsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching public goals where user is a member:", error);
      setIsLoading(false);
    });
    
    // Set up real-time listener for all public goals (to determine recommendations)
    const unsubscribeAllPublic = onSnapshot(allPublicGoalsQuery, (snapshot) => {
      const publicGoalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Filter for goals where the user is NOT a member (for recommendations)
      const recommendedGoalsData = publicGoalsData.filter(goal => 
        !goal.members || !goal.members.includes(currentUserId)
      );
      
      // Update state with recommended goals
      setRecommendedGoals(recommendedGoalsData);
    }, (error) => {
      console.error("Error fetching all public goals:", error);
    });
    
    // Set up real-time listener for private goals
    const unsubscribePrivate = onSnapshot(privateGoalsQuery, (snapshot) => {
      const privateGoalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPrivateGoals(privateGoalsData);
    }, (error) => {
      console.error("Error fetching private goals:", error);
    });
    
    // Clean up listeners when component unmounts
    return () => {
      unsubscribePublicMember();
      unsubscribeAllPublic();
      unsubscribePrivate();
    };
  }, [currentUserId]);

  const handleCreateGoal = async (goalData) => {
    try {
      // The goal is already created in the CreateGoal component
      // With real-time listeners, the UI will update automatically
      // when the new document is added to Firestore
      
      // Automatically switch to the tab where the goal was added
      setActiveTab(goalData.goalType);
    } catch (error) {
      console.error("Error updating local state for goal:", error);
      alert("Goal was created but there was an issue updating the view. Please refresh.");
    }
  };

  // Handle join goal functionality
  const handleJoinGoal = async (goalWithUpdatedMembers) => {
    // Ensure we have a valid ID by trying all possible ID fields
    const goalId = goalWithUpdatedMembers.id || 
                  goalWithUpdatedMembers._id || 
                  goalWithUpdatedMembers.goalId;
    
    if (!goalId) {
      console.error("Cannot join goal: Invalid goal ID", goalWithUpdatedMembers);
      return;
    }
    
    setJoiningGoalId(goalId);
    
    try {
      // Log the goal ID to help with debugging
      console.log("Joining goal with ID:", goalId);
      
      // Update the Firestore document to add the current user to members
      const goalRef = doc(db, "goals", goalId);
      await updateDoc(goalRef, {
        members: arrayUnion(currentUserId),
        // Add a timestamp for the "New" badge functionality
        joinedAt: serverTimestamp()
      });
      
      // No need to manually update state here anymore
      // The real-time listener will automatically update publicGoals and recommendedGoals
      
      // Notify user of successful join
      console.log(`Successfully joined goal: ${goalWithUpdatedMembers.title}`);
      
    } catch (error) {
      console.error("Error joining goal:", error);
      alert("Failed to join goal. Please try again.");
    } finally {
      setJoiningGoalId(null);
    }
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setIsFiltering(true);
    console.log("Applied filters:", filters);
  };

  const clearFilters = () => {
    setActiveFilters({
      status: [],
      dateRange: {
        startDate: "",
        endDate: ""
      },
      categories: [],
      sortBy: "newest"
    });
    setIsFiltering(false);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar with reduced width */}
      <div className="w-64 h-full bg-black flex items-center justify-center p-3">
        <SideBar />
      </div>

      {/* Main Content - with more space and shifted leftward */}
      <div className="flex-1 p-5 pl-0 overflow-y-auto overflow-x-hidden h-screen">
        {/* Search Bar */}
        <div className="w-full p-3 bg-[#333] shadow-md mb-5 rounded-lg">
          <input
            type="text"
            placeholder="Search Goals..."
            className="w-full p-3 bg-[#333] text-white border-none rounded-lg focus:outline-none"
          />
        </div>

        {/* Show authentication status warning if not logged in */}
        {!currentUserId && (
          <div className="bg-yellow-900 text-yellow-100 p-4 rounded-lg mb-5">
            <p>You are not currently logged in. Please sign in to view and manage your goals.</p>
          </div>
        )}

        {/* Recommended Goals Slider - Only show if logged in */}
        {currentUserId && (
          <RecommendedGoalsSection 
            goals={recommendedGoals}
            currentUserId={currentUserId}
            onJoinGoal={handleJoinGoal}
            joiningGoalId={joiningGoalId}
          />
        )}

        {/* Goals Section with Enhanced UI - Shifted left */}
        <div className="bg-[#1A1A1A] rounded-xl p-6 mb-8 shadow-xl border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Your Goals</h2>
            <div className="flex space-x-4">
              <button 
                className="bg-[#333] px-4 py-2 rounded-lg hover:bg-[#444] text-sm"
                onClick={() => setIsCreateModalOpen(true)}
                disabled={!currentUserId}
              >
                Create New
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  isFiltering ? "bg-purple-600 hover:bg-purple-700" : "bg-[#333] hover:bg-[#444]"
                }`}
                onClick={() => setIsFilterModalOpen(true)}
                disabled={!currentUserId}
              >
                <Filter size={14} />
                {isFiltering ? `Filtering (${getActiveFilterCount(activeFilters)})` : "Filter"}
              </button>
            </div>
          </div>
          {/* Active Filters Display */}
          {isFiltering && (
            <div className="mb-6 p-3 bg-[#2A2A2A] rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-300">Active Filters</h3>
                <button 
                  onClick={clearFilters}
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {renderActiveFilterBadges(activeFilters)}
              </div>
            </div>
          )}

          {/* Tabs for Public & Private with toggle functionality */}
          <div className="flex mb-6 border-b border-gray-800">
            <button
              className={`px-5 py-3 font-medium flex items-center gap-2 ${
                activeTab === "Public"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("Public")}
            >
              <Globe size={16} />
              Public
            </button>
            <button
              className={`px-5 py-3 font-medium flex items-center gap-2 ${
                activeTab === "Private"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("Private")}
            >
              <Lock size={16} />
              Private
            </button>
          </div>

          {/* Authentication, Loading, or Content States */}
          {!currentUserId ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Please sign in to view your goals</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading goals...</p>
            </div>
          ) : (
            /* Goals Grid Layout - Conditionally rendered based on active tab */
            activeTab === "Public" ? 
              <PublicGoals 
                goals={publicGoals}
                filters={isFiltering ? activeFilters : null} 
              /> : 
              <PrivateGoals 
                goals={privateGoals}
                filters={isFiltering ? activeFilters : null} 
              />
          )}
        </div>
      </div>

      {/* Create Goal Modal */}
      <CreateGoal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGoal={handleCreateGoal}
        currentUserId={currentUserId}
      />

      {/* Filter Goals Modal */}
      <FilterGoals
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

// Helper function to count active filters
const getActiveFilterCount = (filters) => {
  let count = 0;
  
  count += filters.status.length;
  count += filters.categories.length;
  
  if (filters.dateRange.startDate) count++;
  if (filters.dateRange.endDate) count++;
  
  if (filters.sortBy && filters.sortBy !== "newest") count++;
  
  return count;
};

// Helper function to render active filter badges
const renderActiveFilterBadges = (filters) => {
  const badges = [];
  
  // Status badges
  filters.status.forEach(status => {
    badges.push(
      <div key={`status-${status}`} className="px-2 py-1 bg-[#333] rounded-md text-xs text-gray-300">
        Status: {status}
      </div>
    );
  });
  
  // Category badges
  filters.categories.forEach(category => {
    badges.push(
      <div key={`category-${category}`} className="px-2 py-1 bg-[#333] rounded-md text-xs text-gray-300">
        Category: {category}
      </div>
    );
  });
  
  // Date range badges
  if (filters.dateRange.startDate) {
    badges.push(
      <div key="date-start" className="px-2 py-1 bg-[#333] rounded-md text-xs text-gray-300">
        From: {formatDate(filters.dateRange.startDate)}
      </div>
    );
  }
  
  if (filters.dateRange.endDate) {
    badges.push(
      <div key="date-end" className="px-2 py-1 bg-[#333] rounded-md text-xs text-gray-300">
        To: {formatDate(filters.dateRange.endDate)}
      </div>
    );
  }
  
  // Sort badges
  if (filters.sortBy && filters.sortBy !== "newest") {
    const sortLabels = {
      "oldest": "Oldest First",
      "end-date": "End Date (Closest)",
      "alphabetical": "Alphabetical (A-Z)"
    };
    
    badges.push(
      <div key="sort" className="px-2 py-1 bg-[#333] rounded-md text-xs text-gray-300">
        Sort: {sortLabels[filters.sortBy]}
      </div>
    );
  }
  
  return badges;
};

// Helper function to format dates
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return dateString;
  }
};

export default Goals;