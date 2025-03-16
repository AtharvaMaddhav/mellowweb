
import React from "react";
import GoalCard from "./GoalCard.jsx";

const Goals = () => {
  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar Placeholder */}
      <div className="w-96 h-full bg-black flex items-center justify-center p-5">
        Sidebar
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5">
        {/* Search Bar */}
        <div className="w-full p-3 bg-[#333] shadow-md mb-5 rounded-lg">
          <input
            type="text"
            placeholder="Search Goals..."
            className="w-full p-3 bg-[#333] text-white border-none rounded-lg focus:outline-none"
          />
        </div>

        {/* Goals Section */}
        <div className="flex justify-between bg-[#333] p-8 rounded-lg shadow-lg">
          {/* Public Goals */}
          <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-5">Public</h2>
          <GoalCard 
            title="Mindful Mornings"
            subtitle="Mindful"
            description="Start your mornings with 10 minutes of meditation and a gratitude journal."
            startDate="Sep 1"
            dueDate="Sep 30"
            progress={75}
            daysLeft={15}
            members={12}
            completed={8}
            icon="/mindful-icon.svg"
          />
          <GoalCard 
            title="Cooking "
            subtitle="cook"
            description="Prepare meals for 5 people"
            startDate="Sep 1"
            dueDate="Sep 30"
            progress={75}
            daysLeft={15}
            members={12}
            completed={8}
            icon="/mindful-icon.svg"
          />
        </div>
          {/* Divider */}
          <div className="w-1 bg-gray-600"></div>

          {/* Private Goals */}
          <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-5">Private</h2>
          <GoalCard 
            title="Gyming"
            subtitle="Gym Dedication"
            description="Follow a structured gym plan focusing on muscle gain and endurance."
            startDate="Mar 1"
            dueDate="Mar 31"
            progress={75}
            daysLeft={20}
            members={5}
            completed={3}
            icon="/mindful-icon.svg"
          />
         </div> 
        </div>
      </div>
    </div>
  );
};

export default Goals;
