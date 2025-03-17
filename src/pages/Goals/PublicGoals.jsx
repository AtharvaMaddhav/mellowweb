// import React from "react";
// import EnhancedGoalCard from "./GoalCard";

// const PublicGoals = () => {
//   const publicGoals = [
//     {
//       title: "Mindful Mornings",
//       subtitle: "Mindfulness & Mental Health",
//       description: "Start your mornings with 10 minutes of meditation and a gratitude journal.",
//       startDate: "Sep 1",
//       dueDate: "Sep 30",
//       progress: 75,
//       daysLeft: 15,
//       members: 12,
//       completed: 8,
//       icon: "/icons/mindfulness.png" // Replace with the actual image path
//     },
//     {
//       title: "Cooking Skills",
//       subtitle: "Food & Nutrition",
//       description: "Prepare meals for 5 people and master new cooking techniques.",
//       startDate: "Sep 1",
//       dueDate: "Sep 30",
//       progress: 65,
//       daysLeft: 15,
//       members: 12,
//       completed: 8,
//       icon: "/icons/cooking.png" // Replace with the actual image path
//     }
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       {publicGoals.map((goal, index) => (
//         <EnhancedGoalCard 
//           key={`public-${index}`}
//           title={goal.title}
//           subtitle={goal.subtitle}
//           description={goal.description}
//           startDate={goal.startDate}
//           dueDate={goal.dueDate}
//           progress={goal.progress}
//           daysLeft={goal.daysLeft}
//           members={goal.members}
//           completed={goal.completed}
//           icon={<img src={goal.icon} alt={goal.title} className="w-8 h-8" />} 
//         />
//       ))}
//     </div>
//   );
// };

// export default PublicGoals;


import React from "react";
import { Calendar, Users } from "lucide-react";

const PublicGoals = ({ goals = [], filters = null }) => {
  // If no goals are provided, show a placeholder message
  if (!goals || goals.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">No public goals yet. Create your first public goal!</p>
      </div>
    );
  }
  
  // Apply filters if present
  let filteredGoals = [...goals];
  if (filters) {
    // Example filter implementation - expand based on your needs
    if (filters.status && filters.status.length > 0) {
      filteredGoals = filteredGoals.filter(goal => 
        filters.status.includes(goal.completed ? "completed" : "in-progress")
      );
    }
    
    if (filters.dateRange.startDate) {
      const startDate = new Date(filters.dateRange.startDate);
      filteredGoals = filteredGoals.filter(goal => new Date(goal.startDate) >= startDate);
    }
    
    if (filters.dateRange.endDate) {
      const endDate = new Date(filters.dateRange.endDate);
      filteredGoals = filteredGoals.filter(goal => new Date(goal.endDate) <= endDate);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "oldest":
          filteredGoals.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          break;
        case "end-date":
          filteredGoals.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
          break;
        case "alphabetical":
          filteredGoals.sort((a, b) => a.title.localeCompare(b.title));
          break;
        default: // "newest"
          filteredGoals.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      }
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredGoals.map((goal, index) => (
        <div 
          key={index}
          className="bg-[#222] rounded-lg overflow-hidden border border-gray-800 hover:border-purple-500 transition-all duration-300"
        >
          {/* Goal Image */}
          <div className="h-40 bg-[#333] relative">
            {goal.goalImage ? (
              <img 
                src={goal.goalImage} 
                alt={goal.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-900">
                <span className="text-white font-bold text-xl">{goal.title.charAt(0)}</span>
              </div>
            )}
            
            {/* Completed Badge - Only shown if goal is completed */}
            {goal.completed && (
              <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                Completed
              </div>
            )}
          </div>
          
          {/* Goal Content */}
          <div className="p-4">
            <h3 className="text-white font-bold text-lg mb-2">{goal.title}</h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{goal.description}</p>
            
            {/* Goal Meta Information */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <div className="flex items-center">
                <Calendar size={12} className="mr-1" />
                <span>{formatDate(goal.startDate)} - {formatDate(goal.endDate)}</span>
              </div>
              <div className="flex items-center">
                <Users size={12} className="mr-1" />
                <span>{goal.numberOfUsersCompleted} joined</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to format dates
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return "Invalid date";
  }
};

export default PublicGoals;
