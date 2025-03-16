import React from "react";
import EnhancedGoalCard from "./GoalCard";
import { Dumbbell, BookOpen } from "lucide-react";

const PrivateGoals = () => {
  const privateGoals = [
    {
      title: "Gyming",
      subtitle: "Gym Dedication",
      description: "Follow a structured gym plan focusing on muscle gain and endurance.",
      startDate: "Mar 1",
      dueDate: "Mar 31",
      progress: 75,
      daysLeft: 20,
      members: 5,
      completed: 3,
      icon: <Dumbbell size={24} className="text-green-400" />
    },
    {
      title: "Daily Reading",
      subtitle: "Personal Development",
      description: "Read 20 pages daily from educational or inspiring books.",
      startDate: "Mar 5",
      dueDate: "Apr 5",
      progress: 45,
      daysLeft: 25,
      members: 8,
      completed: 2,
      icon: <BookOpen size={24} className="text-blue-400" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {privateGoals.map((goal, index) => (
        <EnhancedGoalCard 
          key={`private-${index}`}
          title={goal.title}
          subtitle={goal.subtitle}
          description={goal.description}
          startDate={goal.startDate}
          dueDate={goal.dueDate}
          progress={goal.progress}
          daysLeft={goal.daysLeft}
          members={goal.members}
          completed={goal.completed}
          icon={goal.icon}
        />
      ))}
    </div>
  );
};

export default PrivateGoals;