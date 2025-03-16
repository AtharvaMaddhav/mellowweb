import React from "react";

// Goal Card Component
const GoalCard = ({ title, description, startDate, dueDate, progress, daysLeft, members, completed, imageUrl }) => {
  return (
    <div className="w-full max-w-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white p-8 rounded-xl mb-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 border border-blue-400">
      <div className="flex flex-col items-center">
        <div className="w-28 h-28 rounded-full mb-4 p-2 bg-white shadow-inner overflow-hidden">
          <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-full" />
        </div>
        <h3 className="text-3xl font-extrabold tracking-tight mb-2 text-center bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-md">
          {title}
        </h3>
      </div>
      <p className="mt-3 text-lg font-medium text-blue-100 text-center">{description}</p>

      <div className="mt-4 py-3 px-4 bg-blue-600/50 rounded-lg border border-blue-400/30">
        <p className="text-lg font-medium text-blue-100 flex justify-between items-center">
          <span>Start: <span className="font-bold text-white">{startDate}</span></span>
          <span>Due: <span className="font-bold text-white">{dueDate}</span></span>
        </p>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-blue-100">Progress</span>
          <span className="text-sm font-bold text-white">{progress}%</span>
        </div>
        <div className="w-full bg-blue-800/50 rounded-full h-4 p-1 border border-blue-300/20">
          <div 
            className="bg-gradient-to-r from-cyan-300 to-blue-300 h-full rounded-full shadow-inner flex items-center justify-end" 
            style={{ width: `${progress}%` }}
          >
            {progress > 15 && (
              <div className="w-3 h-3 bg-white rounded-full mr-1 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 text-center">
        <span className="text-md font-bold inline-block py-2 px-4 bg-blue-800/40 rounded-full text-blue-100 border border-blue-400/20">
          {daysLeft} days left
        </span>
      </div>

      <div className="flex justify-between mt-5 text-md">
        <span className="flex items-center bg-blue-600/30 py-2 px-4 rounded-full">
          <span className="mr-2 text-blue-200">👥</span> 
          <span className="font-medium">{members} <span className="text-xs text-blue-200">Members</span></span>
        </span>
        <span className="flex items-center bg-blue-600/30 py-2 px-4 rounded-full">
          <span className="mr-2 text-orange-300">🔥</span> 
          <span className="font-medium">{completed} <span className="text-xs text-blue-200">Completed</span></span>
        </span>
      </div>

      <div className="mt-6 pt-4 border-t border-blue-400/30">
        <p className="text-md italic text-center text-blue-100 font-medium">
          "You are almost there! Keep pushing forward."
        </p>
      </div>
    </div>
  );
};

export default GoalCard;
