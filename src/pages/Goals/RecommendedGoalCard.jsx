import React from "react"; 
import { Calendar, Users, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

// Helper function to truncate text
const truncateText = (text, maxLength = 100) => {
  if (!text) return "No description available";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const RecommendedGoalCard = ({ goal, currentUserId, onJoin, isJoining = false, className = "" }) => {   
  // Initialize useNavigate hook for navigation
  const navigate = useNavigate();
  
  if (!goal) {
    console.error("RecommendedGoalCard received null or undefined goal");
    return null;
  }
  
  // No need to maintain local state for members anymore as we're using real-time updates
  // This prevents desyncs between local state and Firestore data
  const members = goal.members || [];

  // Destructure goal properties with defaults and ensure we have a valid ID
  // Important: Consistently use 'id' as the identifier across the application
  const goalId = goal.id || goal._id || goal.goalId || null;
  
  const {      
    title = "",      
    description = "",      
    startDate = "",      
    endDate = "",      
    goalImage = "",     
    userId = "", // Creator's userId     
    numberOfUsersCompleted = 0   
  } = goal;
    
  const getImagePath = (path) => {     
    if (!path) return '/placeholder-image.jpg';          
    
    if (path.startsWith('/')) {       
      return path;     
    } else if (path.includes('public/')) {       
      return '/' + path.split('public/')[1];     
    } else if (path.startsWith('http')) {       
      return path;     
    } else {       
      return '/' + path;     
    }   
  };    
  
  const isAlreadyJoined = members.includes(currentUserId);

  const handleJoin = (e) => {
    e.preventDefault();
    
    if (isAlreadyJoined || isJoining || !goalId) {
      console.log("Join blocked:", { isAlreadyJoined, isJoining, hasId: !!goalId });
      return;
    }
    
    // Create a new goal object with the consistent ID field
    const goalWithId = {
      ...goal,
      id: goalId
    };
    
    // Pass the goal with ensured ID to the parent component
    onJoin(goalWithId);
  };
  
  // Handle view button click - Navigate to goal details page
  const handleViewClick = () => {
    if (!goalId) {
      console.error("Cannot view goal: No valid goalId found");
      return;
    }
    
    // Navigate to the goal details page using the goalId
    navigate(`/goals/${goalId}`);
  };
  
  // Only render the Join button if we have a valid ID
  const canJoin = !!goalId;
  
  return (     
    <div className={`min-w-full md:min-w-80 lg:min-w-96 xl:min-w-full bg-[#222] p-4 rounded-xl mr-10 hover:bg-[#444] transition-colors flex flex-col ${className}`}>       
      <div className="flex items-center justify-between mb-2">         
        <div className="flex items-center">           
          <div className="w-10 h-10 bg-gray-700 rounded-full mr-3 flex items-center justify-center overflow-hidden">             
            <img               
              src={getImagePath(goalImage)}               
              alt={title}               
              className="w-full h-full rounded-full object-cover"               
              onError={(e) => {                 
                e.target.onerror = null;                 
                e.target.src = '/placeholder-image.jpg';               
              }}             
            />           
          </div>           
          <div>             
            <h3 className="font-bold text-2xl">{title}</h3>           
          </div>         
        </div>       
      </div>
      
      <div className="flex items-center text-sm text-gray-400 mb-2">         
        <Calendar size={16} className="mr-2 text-purple-400" />         
        <span>{formatDate(startDate)} - {formatDate(endDate)}</span>       
      </div>
      
      <div className="flex justify-between items-center w-full mt-2">
        <span className="text-base text-gray-400 font-medium">{members.length} members</span>

        <div className="flex space-x-3">
          {/* View Button - Updated with navigation handler */}
          <button
            className={`bg-purple-600 hover:bg-purple-700 text-base px-4 py-1.5 rounded-full transition-colors flex items-center justify-center min-w-24 ${!goalId ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleViewClick}
            disabled={!goalId}
          >
            View
          </button>

          {/* Join Button */}
          <button
            className={`${             
              isAlreadyJoined              
                ? "bg-green-600 cursor-not-allowed"              
                : !canJoin
                  ? "bg-gray-600 cursor-not-allowed"
                  : isJoining               
                    ? "bg-purple-600 opacity-75"               
                    : "bg-purple-600 hover:bg-purple-700"           
            } text-base px-4 py-1.5 rounded-full transition-colors flex items-center justify-center min-w-24`}           
            onClick={handleJoin}           
            disabled={isAlreadyJoined || isJoining || !canJoin}         
          >           
            {isJoining ? (             
              <>               
                <Loader size={16} className="animate-spin mr-2" />               
                <span>Joining...</span>             
              </>           
            ) : isAlreadyJoined ? (             
              "Joined"           
            ) : !canJoin ? (
              "Invalid Goal"
            ) : (             
              "Join"           
            )}         
          </button>   
        </div>    
      </div>     
    </div>   
  ); 
};  

export default RecommendedGoalCard;