import React from "react";

const RecommendedGoalCard = ({ title, subtitle, description, members, icon }) => {
  return (
    <div className="min-w-full md:min-w-80 lg:min-w-96 xl:min-w-full bg-[#222] p-10 rounded-xl mr-10 hover:bg-[#444] transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full mr-4 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-2xl">{title}</h3>
            <p className="text-lg text-gray-400">{subtitle}</p>
          </div>
        </div>
      </div>
      <p className="text-lg text-gray-300 mb-8">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-lg text-gray-400">{members} members</span>
        <button className="bg-purple-600 text-lg px-6 py-3 rounded-full hover:bg-purple-700">
          Join
        </button>
      </div>
    </div>
  );
};

export default RecommendedGoalCard;