// This can be integrated into your PublicGoals.jsx or PrivateGoals.jsx components
// or into a shared GoalCard component if you have one

const GoalCard = ({ goal }) => {
  return (
    <div className="bg-[#252525] rounded-xl overflow-hidden shadow-lg border border-gray-800 h-full flex flex-col transition-transform hover:scale-[1.02] hover:shadow-xl">
      {/* Image Container with proper aspect ratio and padding */}
      <div className="relative w-full pt-[56.25%]"> {/* 16:9 aspect ratio */}
        {goal.goalImage ? (
          <img 
            src={goal.goalImage} 
            alt={goal.title}
            className="absolute top-0 left-0 w-full h-full object-cover object-center" 
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-800 to-gray-900 flex items-center justify-center">
            <span className="text-2xl font-bold text-white opacity-50">No Image</span>
          </div>
        )}
        
        {/* Status badge (positioned over the image) */}
        {goal.completed ? (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
            Completed
          </div>
        ) : (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium">
            In Progress
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{goal.title}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-3">{goal.description}</p>
        
        {/* Dates */}
        <div className="mt-auto">
          <div className="flex justify-between text-xs text-gray-500 mb-4">
            <div>
              <span className="block text-gray-400">Start</span>
              <span>{formatDate(goal.startDate)}</span>
            </div>
            <div className="text-right">
              <span className="block text-gray-400">End</span>
              <span>{formatDate(goal.endDate)}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${goal.completed ? 100 : 30}%` }} 
            />
          </div>
          
          {/* Footer with members count */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {/* Member avatars would go here */}
                <div className="w-6 h-6 rounded-full bg-gray-600"></div>
                <div className="w-6 h-6 rounded-full bg-gray-700"></div>
              </div>
              <span className="text-xs text-gray-400 ml-3">
                {goal.members?.length || 1} member{goal.members?.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <button className="text-purple-400 hover:text-purple-300 text-sm">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format date
const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Invalid date';
  }
};

// To use in your PublicGoals.jsx
const PublicGoals = ({ goals, filters }) => {
  // Apply filters logic here if needed
  const filteredGoals = applyFilters(goals, filters);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredGoals.length > 0 ? (
        filteredGoals.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))
      ) : (
        <div className="col-span-full text-center py-10">
          <p className="text-gray-400">No goals found. Try adjusting your filters or create a new goal.</p>
        </div>
      )}
    </div>
  );
};

// Helper function to apply filters
const applyFilters = (goals, filters) => {
  if (!filters) return goals;
  
  // Apply filtering logic here based on your filters
  // This is just an example - adjust according to your needs
  return goals.filter(goal => {
    // Filter by status
    if (filters.status.length > 0 && !filters.status.includes(goal.completed ? 'completed' : 'in-progress')) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateRange.startDate) {
      const startDate = new Date(filters.dateRange.startDate);
      const goalDate = new Date(goal.startDate);
      if (goalDate < startDate) return false;
    }
    
    if (filters.dateRange.endDate) {
      const endDate = new Date(filters.dateRange.endDate);
      const goalDate = new Date(goal.endDate);
      if (goalDate > endDate) return false;
    }
    
    // Filter by categories (if you have categories in your goals)
    if (filters.categories.length > 0 && goal.category && !filters.categories.includes(goal.category)) {
      return false;
    }
    
    return true;
  });
};