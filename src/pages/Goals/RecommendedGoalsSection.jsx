// import React, { useState, useEffect } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { collection, getDocs, query, where, limit, updateDoc, doc, arrayUnion } from "firebase/firestore";
// import { auth } from "../../config/firebase";
// import { db } from "../../config/firebase";
// import RecommendedGoalCard from "./RecommendedGoalCard";

// const RecommendedGoalsSection = ({ onJoinGoal }) => {
//   const [scrollPosition, setScrollPosition] = useState(0);
//   const [recommendedGoals, setRecommendedGoals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [joiningGoalId, setJoiningGoalId] = useState(null);
  
//   // Get current user ID on component mount
//   useEffect(() => {
//     const user = auth.currentUser;
    
//     if (user) {
//       console.log(user.uid);
//       setCurrentUserId(user.uid);
//     } else {
//       // Handle case when user is not logged in
//       console.log("No user is signed in");
//       setLoading(false);
//     }
//   }, []);
  
//   // Fetch goals when currentUserId is available
//   useEffect(() => {
//     const fetchRecommendedGoals = async () => {
//       if (!currentUserId) return;
      
//       try {
//         setLoading(true);
        
//         console.log("Fetching goals for user:", currentUserId);
        
//         // Create a query to get public goals
//         const goalsRef = collection(db, "goals");
//         const goalsQuery = query(
//           goalsRef,
//           where("goalType", "==", "Public"),
//           limit(20)
//         );
        
//         const querySnapshot = await getDocs(goalsQuery);
//         console.log(`Query returned ${querySnapshot.size} documents`);
        
//         const goals = [];
        
//         querySnapshot.forEach((doc) => {
//           const goalData = doc.data();
          
//           // Only include goals where the user is not already a member
//           const members = goalData.members || [];
//           if (!members.includes(currentUserId)) {
//             goals.push({
//               ...goalData,
//               goalId: doc.id // Keep the original property name
//             });
//           }
//         });
        
//         console.log(`Filtered to ${goals.length} goals after removing joined goals`);
//         setRecommendedGoals(goals);
//       } catch (error) {
//         console.error("Error fetching recommended goals:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchRecommendedGoals();
//   }, [currentUserId]);

//   // Show 3 cards at once instead of 2 since they're smaller now
//   const cardWidth = 'calc(100% / 3 - 20px)';
//   // Reduced card height
//   const cardHeight = '220px'; // Significantly reduced from 320px
  
//   const scrollLeft = () => {
//     const scrollContainer = document.querySelector('.recommended-container');
//     const containerWidth = scrollContainer?.clientWidth || 800;
//     const newPosition = Math.max(0, scrollPosition - containerWidth/3); // Adjusted for 3 cards
//     setScrollPosition(newPosition);
//   };
  
//   const scrollRight = () => {
//     const scrollContainer = document.querySelector('.recommended-container');
//     const containerWidth = scrollContainer?.clientWidth || 800;
//     const maxScroll = Math.max(0, (recommendedGoals.length - 3) * containerWidth/3); // Adjusted for 3 cards
//     const newPosition = Math.min(maxScroll, scrollPosition + containerWidth/3); // Adjusted for 3 cards
//     setScrollPosition(newPosition);
//   };
  
//   // Handle join goal functionality
//   const handleJoinGoal = async (goal) => {
//     if (!currentUserId) return;
    
//     try {
//       setJoiningGoalId(goal.goalId);
      
//       // Update the goal in Firestore
//       const goalRef = doc(db, "goals", goal.goalId);
//       await updateDoc(goalRef, {
//         members: arrayUnion(currentUserId)
//       });
      
//       // Update local state
//       const updatedGoal = {
//         ...goal,
//         members: [...(goal.members || []), currentUserId]
//       };
      
//       // Call parent callback if provided
//       if (typeof onJoinGoal === 'function') {
//         onJoinGoal(updatedGoal);
//       }
      
//       // Remove the goal from recommended list after joining
//       setRecommendedGoals(prevGoals => 
//         prevGoals.filter(g => g.goalId !== goal.goalId)
//       );
      
//       console.log("Successfully joined goal:", goal.title);
//     } catch (error) {
//       console.error("Error joining goal:", error);
//     } finally {
//       setJoiningGoalId(null);
//     }
//   };

//   return (
//     <div className="mb-6">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-2xl font-bold">Recommended Goals</h2>
//         <div className="flex space-x-3">
//           <button
//             onClick={scrollLeft}
//             className="p-2 rounded-full bg-[#333] hover:bg-[#444]"
//             disabled={scrollPosition === 0}
//           >
//             <ChevronLeft size={20} />
//           </button>
//           <button
//             onClick={scrollRight}
//             className="p-2 rounded-full bg-[#333] hover:bg-[#444]"
//             disabled={recommendedGoals.length <= 3} // Adjusted for 3 cards
//           >
//             <ChevronRight size={20} />
//           </button>
//         </div>
//       </div>
      
//       <div className="relative overflow-hidden recommended-container">
//         {!currentUserId ? (
//           <div className="flex justify-center items-center h-40">
//             <p className="text-sm">Please log in to view recommended goals.</p>
//           </div>
//         ) : loading ? (
//           <div className="flex justify-center items-center h-40">
//             <p className="text-sm">Loading recommended goals...</p>
//           </div>
//         ) : recommendedGoals.length === 0 ? (
//           <div className="flex justify-center items-center h-40">
//             <p className="text-sm">No new recommended goals available at the moment.</p>
//           </div>
//         ) : (
//           <div
//             className="flex transition-transform duration-300 ease-in-out"
//             style={{ transform: `translateX(-${scrollPosition}px)` }}
//           >
//             {recommendedGoals.map((goal) => (
//               <div 
//                 key={goal.goalId || goal._id} 
//                 style={{ 
//                   width: cardWidth, 
//                   minWidth: cardWidth,
//                   height: cardHeight
//                 }} 
//                 className="pr-4"
//               >
//                 <RecommendedGoalCard
//                   goal={goal}
//                   currentUserId={currentUserId}
//                   onJoin={handleJoinGoal}
//                   isJoining={joiningGoalId === (goal.goalId || goal._id)}
//                   className="h-full"
//                   compact={true} // Add a new prop to trigger compact mode
//                 />
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RecommendedGoalsSection;

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { collection, getDocs, query, where, limit, updateDoc, doc, arrayUnion, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import RecommendedGoalCard from "./RecommendedGoalCard";
import { getRecommendedGoals } from "../../services/recommendationService"; // ✅ NEW IMPORT

const RecommendedGoalsSection = ({ onJoinGoal }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [recommendedGoals, setRecommendedGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [joiningGoalId, setJoiningGoalId] = useState(null);

  // Get current user ID on mount
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUserId(user.uid);
    } else {
      console.log("No user is signed in");
      setLoading(false);
    }
  }, []);

  // Fetch goals + call Gemini for recommendation
  useEffect(() => {
    const fetchRecommendedGoals = async () => {
      if (!currentUserId) return;

      try {
        setLoading(true);
        console.log("Fetching goals for user:", currentUserId);

        // ✅ STEP 1: Fetch user interests from Firestore
        const userDocRef = doc(db, "users", currentUserId);
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) {
          console.log("User not found in Firestore");
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        const userInterests = userData.interests || [];
        console.log("User interests:", userInterests);

        // ✅ STEP 2: Get public goals
        const goalsRef = collection(db, "goals");
        const goalsQuery = query(goalsRef, where("goalType", "==", "Public"), limit(20));
        const querySnapshot = await getDocs(goalsQuery);

        const goals = [];
        querySnapshot.forEach((docSnap) => {
          const goalData = docSnap.data();
          const members = goalData.members || [];
          if (!members.includes(currentUserId)) {
            goals.push({ ...goalData, goalId: docSnap.id });
          }
        });

        console.log(`Fetched ${goals.length} public goals`);

        if (goals.length === 0) {
          setRecommendedGoals([]);
          setLoading(false);
          return;
        }

        // ✅ STEP 3: Call Gemini for recommendations
        console.log("Requesting Gemini recommendations...");
        const sortedGoals = await getRecommendedGoals(
          userInterests,
          goals.map((g) => g.title || g.name)
        );

        // ✅ STEP 4: Reorder original goal objects in sorted order
        const orderedGoals = sortedGoals
          .map((title) => goals.find((g) => g.title === title || g.name === title))
          .filter(Boolean); // remove undefined

        console.log("Recommended order:", orderedGoals.map((g) => g.title));

        setRecommendedGoals(orderedGoals.length ? orderedGoals : goals);
      } catch (error) {
        console.error("Error fetching recommended goals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedGoals();
  }, [currentUserId]);

  // --- UI logic below remains mostly the same ---
  const cardWidth = "calc(100% / 3 - 20px)";
  const cardHeight = "220px";

  const scrollLeft = () => {
    const scrollContainer = document.querySelector(".recommended-container");
    const containerWidth = scrollContainer?.clientWidth || 800;
    const newPosition = Math.max(0, scrollPosition - containerWidth / 3);
    setScrollPosition(newPosition);
  };

  const scrollRight = () => {
    const scrollContainer = document.querySelector(".recommended-container");
    const containerWidth = scrollContainer?.clientWidth || 800;
    const maxScroll = Math.max(0, (recommendedGoals.length - 3) * containerWidth / 3);
    const newPosition = Math.min(maxScroll, scrollPosition + containerWidth / 3);
    setScrollPosition(newPosition);
  };

  const handleJoinGoal = async (goal) => {
    if (!currentUserId) return;

    try {
      setJoiningGoalId(goal.goalId);
      const goalRef = doc(db, "goals", goal.goalId);
      await updateDoc(goalRef, { members: arrayUnion(currentUserId) });

      if (typeof onJoinGoal === "function") {
        onJoinGoal({ ...goal, members: [...(goal.members || []), currentUserId] });
      }

      setRecommendedGoals((prevGoals) => prevGoals.filter((g) => g.goalId !== goal.goalId));
      console.log("Joined goal:", goal.title);
    } catch (error) {
      console.error("Error joining goal:", error);
    } finally {
      setJoiningGoalId(null);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recommended Goals</h2>
        <div className="flex space-x-3">
          <button onClick={scrollLeft} className="p-2 rounded-full bg-[#333] hover:bg-[#444]" disabled={scrollPosition === 0}>
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={scrollRight}
            className="p-2 rounded-full bg-[#333] hover:bg-[#444]"
            disabled={recommendedGoals.length <= 3}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden recommended-container">
        {!currentUserId ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-sm">Please log in to view recommended goals.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-sm">Loading recommended goals...</p>
          </div>
        ) : recommendedGoals.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-sm">No recommended goals available right now.</p>
          </div>
        ) : (
          <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${scrollPosition}px)` }}>
            {recommendedGoals.map((goal) => (
              <div
                key={goal.goalId}
                style={{ width: cardWidth, minWidth: cardWidth, height: cardHeight }}
                className="pr-4"
              >
                <RecommendedGoalCard
                  goal={goal}
                  currentUserId={currentUserId}
                  onJoin={handleJoinGoal}
                  isJoining={joiningGoalId === goal.goalId}
                  className="h-full"
                  compact={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedGoalsSection;
