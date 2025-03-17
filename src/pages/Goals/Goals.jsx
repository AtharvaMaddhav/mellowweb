import React, { useState, useEffect } from "react";
import SideBar from "../SideBar/SideBar.jsx";
import { Globe, Lock, Filter } from "lucide-react";
import RecommendedGoalsSection from "./RecommendedGoalsSection";
import PublicGoals from "./PublicGoals";
import PrivateGoals from "./PrivateGoals";
import CreateGoal from "./CreateGoal";
import FilterGoals from "./FilterGoals";
import { db }  from "../../config/firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

const Goals = () => {
  const [activeTab, setActiveTab] = useState("public");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [publicGoals, setPublicGoals] = useState([]);
  const [privateGoals, setPrivateGoals] = useState([]);
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
  
  // Current user ID - In a real app, this would come from authentication
  const currentUserId = "4Avy2gnDizxdsWRMYL2i";

  // Fetch goals from Firestore on component mount
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setIsLoading(true);
        
        // Create queries for public and private goals
        const publicQuery = query(
          collection(db, "goals"), 
          where("goalType", "==", "public")
        );
        
        const privateQuery = query(
          collection(db, "goals"), 
          where("goalType", "==", "private"),
          where("userId", "==", currentUserId)
        );
        
        // Fetch goals
        const publicSnapshot = await getDocs(publicQuery);
        const privateSnapshot = await getDocs(privateQuery);
        
        // Convert snapshots to arrays with IDs
        const publicGoalsData = publicSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const privateGoalsData = privateSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Update state
        setPublicGoals(publicGoalsData);
        setPrivateGoals(privateGoalsData);
      } catch (error) {
        console.error("Error fetching goals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGoals();
  }, [currentUserId]);

  const handleCreateGoal = async (goalData) => {
    try {
      // Format the data for Firestore
      const newGoal = {
        title: goalData.title,
        description: goalData.description,
        startDate: new Date(goalData.startDate),
        endDate: new Date(goalData.endDate),
        goalImage: goalData.image ? goalData.image.name : "",
        goalType: goalData.isPublic ? "public" : "private",
        userId: currentUserId,
        members: [currentUserId],
        numberOfUsersCompleted: 0,
        completed: false,
        createdAt: serverTimestamp()
      };
      
      // Add document to Firestore
      const docRef = await addDoc(collection(db, "goals"), newGoal);
      console.log("New goal created with ID:", docRef.id);
      
      // Add the goal to the local state with the new ID
      const goalWithId = { id: docRef.id, ...newGoal };
      
      if (goalData.isPublic) {
        setPublicGoals(prevGoals => [goalWithId, ...prevGoals]);
      } else {
        setPrivateGoals(prevGoals => [goalWithId, ...prevGoals]);
      }
      
      // Automatically switch to the tab where the goal was added
      setActiveTab(goalData.isPublic ? "public" : "private");
    } catch (error) {
      console.error("Error creating goal:", error);
      alert("Failed to create goal. Please try again.");
    }
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setIsFiltering(true);
    console.log("Applied filters:", filters);
    
    // Here you would apply these filters to your goals data
    // For example, filtering the public/private goals based on these criteria
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
      {/* Sidebar Placeholder */}
      <div className="w-96 h-full bg-black flex items-center justify-center p-5">
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 overflow-y-auto overflow-x-hidden h-screen">
        {/* Search Bar */}
        <div className="w-full p-3 bg-[#333] shadow-md mb-5 rounded-lg">
          <input
            type="text"
            placeholder="Search Goals..."
            className="w-full p-3 bg-[#333] text-white border-none rounded-lg focus:outline-none"
          />
        </div>

        {/* Recommended Goals Slider */}
        <RecommendedGoalsSection />

        {/* Goals Section with Enhanced UI */}
        <div className="bg-[#1A1A1A] rounded-xl p-8 mb-8 shadow-xl border border-gray-800">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Your Goals</h2>
            <div className="flex space-x-4">
              <button 
                className="bg-[#333] px-4 py-2 rounded-lg hover:bg-[#444] text-sm"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create New
              </button>
              <button 
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
                  isFiltering ? "bg-purple-600 hover:bg-purple-700" : "bg-[#333] hover:bg-[#444]"
                }`}
                onClick={() => setIsFilterModalOpen(true)}
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
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === "public"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("public")}
            >
              <Globe size={16} />
              Public
            </button>
            <button
              className={`px-6 py-3 font-medium flex items-center gap-2 ${
                activeTab === "private"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              onClick={() => setActiveTab("private")}
            >
              <Lock size={16} />
              Private
            </button>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-400">Loading goals...</p>
            </div>
          ) : (
            /* Goals Grid Layout - Conditionally rendered based on active tab */
            activeTab === "public" ? 
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