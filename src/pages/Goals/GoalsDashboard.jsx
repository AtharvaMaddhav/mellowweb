// This code would typically be in your state management or parent component
import React, { useState, useEffect } from 'react';
import RecommendedGoalCard from './RecommendedGoalCard';
import PublicGoals from './PublicGoals';

const GoalsDashboard = ({ currentUserId }) => {
  // State for recommended and public goals
  const [recommendedGoals, setRecommendedGoals] = useState([]);
  const [publicGoals, setPublicGoals] = useState([]);
  const [joiningGoalId, setJoiningGoalId] = useState(null);
  
  // Fetch goals on component mount
  useEffect(() => {
    fetchRecommendedGoals();
    fetchPublicGoals();
  }, [currentUserId]);
  
  // Fetch recommended goals (goals current user hasn't joined)
  const fetchRecommendedGoals = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/goals/recommended');
      const data = await response.json();
      
      // Filter out goals where the current user is already a member
      const filteredGoals = data.filter(goal => 
        !goal.members || !goal.members.includes(currentUserId)
      );
      
      setRecommendedGoals(filteredGoals);
    } catch (error) {
      console.error("Failed to fetch recommended goals:", error);
    }
  };
  
  // Fetch public goals (goals current user has joined)
  const fetchPublicGoals = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/goals/public');
      const data = await response.json();
      
      // Only include goals where the current user is a member
      const userGoals = data.filter(goal => 
        goal.members && goal.members.includes(currentUserId)
      );
      
      setPublicGoals(userGoals);
    } catch (error) {
      console.error("Failed to fetch public goals:", error);
    }
  };
  
  // Handle joining a goal
  const handleJoinGoal = async (goalWithUpdatedMembers) => {
    if (!goalWithUpdatedMembers.id) {
      console.error("Cannot join goal: Invalid goal ID");
      return;
    }
    
    setJoiningGoalId(goalWithUpdatedMembers.id);
    
    try {
      // Update the database with the new member
      const response = await fetch(`/api/goals/${goalWithUpdatedMembers.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUserId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to join goal');
      }
      
      // Add the joined goal to public goals
      setPublicGoals(prevPublicGoals => [...prevPublicGoals, goalWithUpdatedMembers]);
      
      // Remove the joined goal from recommended goals
      setRecommendedGoals(prevRecommendedGoals => 
        prevRecommendedGoals.filter(goal => goal.id !== goalWithUpdatedMembers.id)
      );
      
    } catch (error) {
      console.error("Failed to join goal:", error);
      // Revert the UI changes if the API call fails
      alert("Failed to join goal. Please try again.");
    } finally {
      setJoiningGoalId(null);
    }
  };
  
  return (
    <div>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Recommended Goals</h2>
        <div className="flex overflow-x-auto pb-4 space-x-6">
          {recommendedGoals.length > 0 ? (
            recommendedGoals.map(goal => (
              <RecommendedGoalCard
                key={goal.id}
                goal={goal}
                currentUserId={currentUserId}
                onJoin={handleJoinGoal}
                isJoining={joiningGoalId === goal.id}
              />
            ))
          ) : (
            <p className="text-gray-400">No recommended goals available.</p>
          )}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-6">Your Goals</h2>
        <PublicGoals goals={publicGoals} />
      </section>
    </div>
  );
};

export default GoalsDashboard;