import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Globe, Book, Dumbbell, Award, BookOpen } from "lucide-react";
import RecommendedGoalCard from "./RecommendedGoalCard";

const RecommendedGoalsSection = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const recommendedGoals = [
    {
      title: "30 Days Coding",
      subtitle: "Tech Skills",
      description: "Daily coding challenges to improve your programming skills",
      members: 234,
      icon: <Globe size={32} className="text-blue-400" />
    },
    {
      title: "Book Club",
      subtitle: "Reading",
      description: "Read and discuss one book every two weeks",
      members: 89,
      icon: <Book size={32} className="text-purple-400" />
    },
    {
      title: "5K Training",
      subtitle: "Fitness",
      description: "Beginner-friendly training plan for your first 5K run",
      members: 156,
      icon: <Dumbbell size={32} className="text-green-400" />
    },
    {
      title: "Daily Sketching",
      subtitle: "Art",
      description: "Improve your drawing skills with daily practice",
      members: 112,
      icon: <Award size={32} className="text-yellow-400" />
    },
    {
      title: "Language Learning",
      subtitle: "Education",
      description: "Learn a new language with daily practice sessions",
      members: 198,
      icon: <BookOpen size={32} className="text-red-400" />
    }
  ];

  // Calculate card width based on the container width
  const cardWidth = 'calc(100% / 2 - 40px)';

  const scrollLeft = () => {
    const scrollContainer = document.querySelector('.recommended-container');
    const containerWidth = scrollContainer?.clientWidth || 800;
    const newPosition = Math.max(0, scrollPosition - containerWidth/2);
    setScrollPosition(newPosition);
  };

  const scrollRight = () => {
    const scrollContainer = document.querySelector('.recommended-container');
    const containerWidth = scrollContainer?.clientWidth || 800;
    const maxScroll = (recommendedGoals.length - 2) * containerWidth/2;
    const newPosition = Math.min(maxScroll, scrollPosition + containerWidth/2);
    setScrollPosition(newPosition);
  };

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Recommended Goals</h2>
        <div className="flex space-x-4">
          <button 
            onClick={scrollLeft} 
            className="p-3 rounded-full bg-[#333] hover:bg-[#444]"
            disabled={scrollPosition === 0}
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={scrollRight} 
            className="p-3 rounded-full bg-[#333] hover:bg-[#444]"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </div>
      
      <div className="relative overflow-hidden recommended-container">
        <div 
          className="flex transition-transform duration-300 ease-in-out" 
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {recommendedGoals.map((goal, index) => (
            <div key={index} style={{ width: cardWidth, minWidth: cardWidth }} className="pr-10">
              <RecommendedGoalCard
                title={goal.title}
                subtitle={goal.subtitle}
                description={goal.description}
                members={goal.members}
                icon={goal.icon}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedGoalsSection;