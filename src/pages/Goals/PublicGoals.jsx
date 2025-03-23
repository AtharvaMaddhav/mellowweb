import React from "react";
import { Calendar, Users } from "lucide-react";

const PublicGoals = ({ goals = [], filters = null }) => {
  // Debug log to help diagnose the issue
  console.log("PublicGoals received:", { goalsCount: goals.length, hasFilters: !!filters });
  
  // If no goals are provided, show a placeholder message
  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">No public goals yet. Join goals from the recommendations section or create your first public goal!</p>
      </div>
    );
  }
  
  // Apply filters if present
  let filteredGoals = [...goals];
  if (filters) {
    console.log("Applying filters:", filters);
    
    // Example filter implementation - expand based on your needs
    if (filters.status && filters.status.length > 0) {
      filteredGoals = filteredGoals.filter(goal => 
        filters.status.includes(goal.completed ? "completed" : "in-progress")
      );
    }
    
    if (filters.dateRange && filters.dateRange.startDate) {
      const startDate = new Date(filters.dateRange.startDate);
      filteredGoals = filteredGoals.filter(goal => {
        // Handle potentially missing or invalid dates
        if (!goal.startDate) return true;
        const goalStart = new Date(goal.startDate);
        return !isNaN(goalStart.getTime()) && goalStart >= startDate;
      });
    }
    
    if (filters.dateRange && filters.dateRange.endDate) {
      const endDate = new Date(filters.dateRange.endDate);
      filteredGoals = filteredGoals.filter(goal => {
        // Handle potentially missing or invalid dates
        if (!goal.endDate) return true;
        const goalEnd = new Date(goal.endDate);
        return !isNaN(goalEnd.getTime()) && goalEnd <= endDate;
      });
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "oldest":
          filteredGoals.sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));
          break;
        case "end-date":
          filteredGoals.sort((a, b) => new Date(a.endDate || 0) - new Date(b.endDate || 0));
          break;
        case "alphabetical":
          filteredGoals.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          break;
        default: // "newest"
          filteredGoals.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
      }
    }
  }

  // Log filtered goals for debugging
  console.log("Filtered goals:", filteredGoals);

  // Function to get the correct image path
  const getImagePath = (path) => {
    if (!path) return null;
    
    if (path.startsWith('/')) {
      return path;
    } else if (path.includes('public/')) {
      return '/' + path.split('public/')[1];
    } else if (path.startsWith('http')) {
      // For Firebase Storage URLs
      return path;
    } else {
      return '/' + path;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredGoals.map((goal, index) => {
        // Extract a stable key
        const goalKey = goal.id || goal._id || goal.goalId || index;
        
        return (
          <div 
            key={goalKey}
            className="bg-[#222] rounded-lg overflow-hidden border border-gray-800 hover:border-purple-500 transition-all duration-300 flex flex-col h-full"
          >
            {/* Goal Image with aspect ratio container */}
            <div className="relative w-full pt-[56.25%] bg-[#333]"> {/* 16:9 aspect ratio */}
              {goal.goalImage ? (
                <img 
                  src={getImagePath(goal.goalImage)} 
                  alt={goal.title} 
                  className="absolute top-0 left-0 w-full h-full object-cover object-center" 
                  onError={(e) => {
                    e.target.onerror = null;
                    // Replace with gradient background and first letter
                    e.target.parentElement.innerHTML = `
                      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-900">
                        <span class="text-white font-bold text-3xl">${goal.title ? goal.title.charAt(0) : '?'}</span>
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-900">
                  <span className="text-white font-bold text-3xl">{goal.title ? goal.title.charAt(0) : '?'}</span>
                </div>
              )}
              
              {/* Completed Badge - Only shown if goal is completed */}
              {goal.completed && (
                <div className="absolute top-4 right-4 bg-green-500 text-white text-sm font-medium px-3 py-1 rounded-md shadow-md">
                  Completed
                </div>
              )}
              
              {/* Recently Joined Badge - Show a badge for goals joined in the last 24 hours */}
              {goal.joinedAt && (Date.now() - new Date(goal.joinedAt).getTime() < 24 * 60 * 60 * 1000) && (
                <div className="absolute top-4 left-4 bg-purple-500 text-white text-sm font-medium px-3 py-1 rounded-md shadow-md">
                  New
                </div>
              )}
            </div>
            
            {/* Goal Content - Improved spacing and sizing */}
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-white font-bold text-xl mb-3 line-clamp-2">{goal.title || "Untitled Goal"}</h3>
              <p className="text-gray-300 text-base mb-6 line-clamp-3">{goal.description || "No description"}</p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${goal.completed ? 100 : Math.floor(Math.random() * 80) + 10}%` }} 
                />
              </div>
              
              {/* Goal Meta Information with improved spacing and visibility */}
              <div className="flex flex-col space-y-3 mt-auto">
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar size={16} className="mr-2 text-purple-400" />
                  <span>{formatDate(goal.startDate)} - {formatDate(goal.endDate)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Users size={16} className="mr-2 text-purple-400" />
                  <span>{goal.members ? goal.members.length : 0} participants</span>
                </div>
                
                {/* Action button */}
                <button className="mt-4 w-full bg-[#333] hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300">
                  View Details
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper function to format dates
const formatDate = (dateString) => {
  try {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    console.error("Date formatting error:", e);
    return "Invalid date";
  }
};

export default PublicGoals;