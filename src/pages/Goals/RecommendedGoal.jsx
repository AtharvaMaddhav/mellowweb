// src/components/RecommendedGoals.jsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const RecommendedGoalCard = ({ title, subtitle, description, members, icon }) => {
    return (
      <div className="min-w-full md:min-w-80 lg:min-w-96 xl:min-w-full bg-[#222] p-10 rounded-xl mr-10 hover:bg-[#444] transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full mr-4"></div>
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

const RecommendedGoal = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const recommendedGoals = [
    { title: "30 Days Coding", subtitle: "Tech Skills", description: "Daily coding challenges to improve your programming skills", members: 234 },
    { title: "Book Club", subtitle: "Reading", description: "Read and discuss one book every two weeks", members: 89 },
    { title: "5K Training", subtitle: "Fitness", description: "Beginner-friendly training plan for your first 5K run", members: 156 },
    { title: "Daily Sketching", subtitle: "Art", description: "Improve your drawing skills with daily practice", members: 112 },
    { title: "Language Learning", subtitle: "Education", description: "Learn a new language with daily practice sessions", members: 198 }
  ];

  const scrollLeft = () => {
    const scrollContainer = document.querySelector('.recommended-container');
    const containerWidth = scrollContainer?.clientWidth || 800;
    setScrollPosition(Math.max(0, scrollPosition - containerWidth / 2));
  };

  const scrollRight = () => {
    const scrollContainer = document.querySelector('.recommended-container');
    const containerWidth = scrollContainer?.clientWidth || 800;
    const maxScroll = (recommendedGoals.length - 2) * containerWidth / 2;
    setScrollPosition(Math.min(maxScroll, scrollPosition + containerWidth / 2));
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Recommended Goals</h2>
        <div className="flex space-x-4">
          <button onClick={scrollLeft} className="p-3 rounded-full bg-[#333] hover:bg-[#444]" disabled={scrollPosition === 0}>
            <ChevronLeft size={32} />
          </button>
          <button onClick={scrollRight} className="p-3 rounded-full bg-[#333] hover:bg-[#444]">
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
      
      <div className="relative overflow-hidden recommended-container">
        <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${scrollPosition}px)` }}>
          {recommendedGoals.map((goal, index) => (
            <div key={index} className="pr-10">
              <RecommendedGoalCard {...goal} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedGoal;
