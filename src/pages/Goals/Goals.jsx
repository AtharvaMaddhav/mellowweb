import React, { useState } from "react";
import SideBar from "../SideBar/SideBar.jsx";
import { Globe, Lock, Filter } from "lucide-react";
import RecommendedGoalsSection from "./RecommendedGoalsSection";
import PublicGoals from "./PublicGoals";
import PrivateGoals from "./PrivateGoals";
import CreateGoal from "./CreateGoal";
import FilterGoals from "./FilterGoals";

const Goals = () => {
  const [activeTab, setActiveTab] = useState("public");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
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

  const handleCreateGoal = (goalData) => {
    // Here you would typically handle saving the goal to your backend
    console.log("New goal created:", goalData);
    
    // For now, we'll just log the data, but in a real application, 
    // you would add this to your state or send it to your API
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

          {/* Goals Grid Layout - Conditionally rendered based on active tab */}
          {/* You would pass activeFilters to these components to filter the goals */}
          {activeTab === "public" ? 
            <PublicGoals filters={isFiltering ? activeFilters : null} /> : 
            <PrivateGoals filters={isFiltering ? activeFilters : null} />
          }
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