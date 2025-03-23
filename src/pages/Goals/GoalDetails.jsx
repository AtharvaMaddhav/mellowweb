import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Calendar, Users, CheckCircle, Clock } from 'lucide-react';
import { ViewOtherProfile } from '../Profile/ViewOtherProfile';
import { useAuth } from "../../context/AuthContext"; // Import Auth context to check current user

const GoalDetails = () => {
  const [goalData, setGoalData] = useState(null);
  const [memberDetails, setMemberDetails] = useState([]);
  const [creatorDetails, setCreatorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const { goalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user from Auth context

  useEffect(() => {
    const fetchGoalAndMembers = async () => {
      try {
        // Fetch goal data
        const goalDoc = await getDoc(doc(db, "goals", goalId));
        
        if (!goalDoc.exists()) {
          console.error("Goal not found");
          setLoading(false);
          return;
        }
        
        const goal = goalDoc.data();
        setGoalData(goal);
        
        // Fetch creator details
        if (goal.userId) {
          const creatorDoc = await getDoc(doc(db, "users", goal.userId));
          if (creatorDoc.exists()) {
            setCreatorDetails({
              id: goal.userId,
              ...creatorDoc.data()
            });
          }
        }
        
        // Fetch members' details
        const membersData = [];
        for (const memberId of goal.members) {
          const memberDoc = await getDoc(doc(db, "users", memberId));
          if (memberDoc.exists()) {
            membersData.push({
              id: memberId,
              ...memberDoc.data(),
              hasCompleted: goal.completedBy?.includes(memberId) || false
            });
          }
        }
        
        setMemberDetails(membersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (goalId) {
      fetchGoalAndMembers();
    }
  }, [goalId]);

  const handleProfileClick = (userId) => {
    // Check if the clicked profile is the current user's profile
    if (user && userId === user.uid) {
      // Navigate to the Profile.jsx component
      navigate(`/profile/${userId}`);
    } else {
      // For other users, show the ViewOtherProfile modal
      setSelectedProfileId(userId);
    }
  };

  const handleCloseProfile = () => {
    setSelectedProfileId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!goalData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-2xl font-bold text-red-500">Goal not found</h1>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const completedCount = goalData.completedBy?.length || 0;
  const membersCount = goalData.members?.length || 0;
  const completionPercentage = membersCount > 0 ? Math.round((completedCount / membersCount) * 100) : 0;
  
  // Format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center text-purple-400 hover:text-purple-300"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </button>

        <div className="w-full">
          {/* Goal Image Banner */}
          {goalData.goalImage && (
            <div className="h-96 w-full overflow-hidden rounded-xl mb-8">
              <img 
                src={goalData.goalImage} 
                alt={goalData.title} 
                className="w-full h-full object-contain bg-[#1A1A1A]"
              />
            </div>
          )}
          
          {/* Header section with title, type, and completion status */}
          <div className="flex flex-wrap items-center justify-between mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold text-white">{goalData.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                goalData.goalType === 'Private' ? 'bg-purple-900 text-purple-200' : 'bg-green-900 text-green-200'
              }`}>
                {goalData.goalType}
              </span>
            </div>
            
            {/* Completion Status Pill - moved here */}
            <div className="flex items-center bg-[#2A2A2A] rounded-full py-2 px-4">
              <div className="mr-3">
                <span className="text-base font-medium text-gray-300">{completedCount} of {membersCount} completed</span>
              </div>
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <span className="ml-3 text-base font-medium text-purple-400">{completionPercentage}%</span>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="mb-8">
            <div className="flex flex-wrap">
              <div className="w-full lg:w-3/4 pr-0 lg:pr-12">
                {/* Creator Info */}
                {creatorDetails && (
                  <div className="mb-8 flex items-center">
                    <div className="mr-4 cursor-pointer" onClick={() => handleProfileClick(creatorDetails.id)}>
                      {creatorDetails.profilePic ? (
                        <img 
                          src={creatorDetails.profilePic} 
                          alt={creatorDetails.name} 
                          className="w-12 h-12 rounded-full object-cover border border-purple-500 hover:border-purple-300 transition-colors"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center hover:bg-purple-600 transition-colors">
                          <span className="text-lg text-white font-bold">
                            {creatorDetails.name?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Created by</p>
                      <p className="text-purple-400 font-medium text-lg">{creatorDetails.name}</p>
                    </div>
                  </div>
                )}
                
                <div className="mb-10">
                  <p className="text-gray-300 text-xl leading-relaxed">{goalData.description}</p>
                </div>
                
                {/* Timeline section for dates - redesigned */}
                <div className="mb-10 relative">
                  <div className="flex items-center mb-6">
                    <Clock className="text-purple-400 mr-3" size={24} />
                    <h3 className="text-2xl font-semibold text-white">Timeline</h3>
                  </div>
                  
                  <div className="relative pl-8 before:content-[''] before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-purple-800">
                    <div className="relative mb-8">
                      <div className="absolute left-[-32px] w-6 h-6 rounded-full bg-purple-700 border-4 border-black flex items-center justify-center"></div>
                      <div className="bg-[#1A1A1A] p-5 rounded-lg">
                        <p className="text-sm text-purple-400 mb-1">Start Date</p>
                        <p className="text-xl font-medium text-white">{formatDate(goalData.startDate)}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute left-[-32px] w-6 h-6 rounded-full bg-purple-700 border-4 border-black flex items-center justify-center"></div>
                      <div className="bg-[#1A1A1A] p-5 rounded-lg">
                        <p className="text-sm text-purple-400 mb-1">End Date</p>
                        <p className="text-xl font-medium text-white">{formatDate(goalData.endDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full lg:w-1/4 mt-6 lg:mt-0">
                {/* Categories section */}
                {goalData.categories && goalData.categories.length > 0 && (
                  <div className="bg-[#1A1A1A] p-6 rounded-lg mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {goalData.categories.map((category, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-[#2A2A2A] text-sm rounded-md text-purple-300"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Members Section - vertically scrollable */}
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Users className="text-purple-400 mr-3" size={24} />
                Members
              </h2>
              <div className="h-96 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  {memberDetails.map((member) => (
                    <div key={member.id} className="bg-[#1A1A1A] rounded-lg p-5 flex items-center hover:bg-[#222] transition-colors">
                      <div className="flex-shrink-0 mr-5 cursor-pointer" onClick={() => handleProfileClick(member.id)}>
                        {member.profilePic ? (
                          <img 
                            src={member.profilePic} 
                            alt={member.name} 
                            className="w-16 h-16 rounded-full object-cover border border-gray-600 hover:border-purple-400 transition-colors"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-purple-700 flex items-center justify-center hover:bg-purple-600 transition-colors">
                            <span className="text-2xl text-white font-bold">
                              {member.name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-white text-xl">{member.name}</h3>
                        <p className="text-base text-gray-400 truncate">{member.email}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {member.hasCompleted ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-200">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-gray-300">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* ViewOtherProfile Modal - only shown for other users */}
      {selectedProfileId && (
        <ViewOtherProfile 
          userId={selectedProfileId} 
          onClose={handleCloseProfile} 
        />
      )}
      
      {/* Custom scrollbar style */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1A1A1A;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8B5CF6;
        }
      `}</style>
    </div>
  );
};

export default GoalDetails;