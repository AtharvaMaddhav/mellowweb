import React from "react";
import EnhancedGoalCard from "./GoalCard";

const PublicGoals = () => {
  const publicGoals = [
    {
      title: "Mindful Mornings",
      subtitle: "Mindfulness & Mental Health",
      description: "Start your mornings with 10 minutes of meditation and a gratitude journal.",
      startDate: "Sep 1",
      dueDate: "Sep 30",
      progress: 75,
      daysLeft: 15,
      members: 12,
      completed: 8,
      icon: "/icons/mindfulness.png" // Replace with the actual image path
    },
    {
      title: "Cooking Skills",
      subtitle: "Food & Nutrition",
      description: "Prepare meals for 5 people and master new cooking techniques.",
      startDate: "Sep 1",
      dueDate: "Sep 30",
      progress: 65,
      daysLeft: 15,
      members: 12,
      completed: 8,
      icon: "/icons/cooking.png" // Replace with the actual image path
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {publicGoals.map((goal, index) => (
        <EnhancedGoalCard 
          key={`public-${index}`}
          title={goal.title}
          subtitle={goal.subtitle}
          description={goal.description}
          startDate={goal.startDate}
          dueDate={goal.dueDate}
          progress={goal.progress}
          daysLeft={goal.daysLeft}
          members={goal.members}
          completed={goal.completed}
          icon={<img src={goal.icon} alt={goal.title} className="w-8 h-8" />} 
        />
      ))}
    </div>
  );
};

export default PublicGoals;
