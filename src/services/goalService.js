import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  arrayUnion, 
  getDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig'; // Adjust this import to your Firebase config path

// Function to get all public goals that the user has joined
export const getUserGoals = async (userId) => {
  if (!userId) {
    console.error('getUserGoals called without userId');
    return [];
  }

  try {
    console.log('Getting goals for user:', userId);
    const goalsRef = collection(db, 'goals');
    const q = query(
      goalsRef, 
      where('goalType', '==', 'public'),
      where('members', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} user goals`);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      // Convert any Timestamp objects to strings for easier handling
      startDate: doc.data().startDate instanceof Timestamp ? 
        doc.data().startDate.toDate().toISOString() : doc.data().startDate,
      endDate: doc.data().endDate instanceof Timestamp ? 
        doc.data().endDate.toDate().toISOString() : doc.data().endDate
    }));
  } catch (error) {
    console.error('Error getting user goals:', error);
    throw error;
  }
};

// Function to get recommended goals (goals the user hasn't joined)
export const getRecommendedGoals = async (userId) => {
  if (!userId) {
    console.error('getRecommendedGoals called without userId');
    return [];
  }

  try {
    console.log('Getting recommended goals for user:', userId);
    // First, get all public goals
    const goalsRef = collection(db, 'goals');
    const q = query(
      goalsRef, 
      where('goalType', '==', 'public'),
      orderBy('startDate', 'desc'), // Get most recent goals first
      limit(10) // Limit to 10 goals for performance
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} public goals`);
    
    // Process all goals and normalize data
    const allPublicGoals = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Log each document ID to debug
      console.log('Goal document ID:', doc.id);
      console.log('Goal document data:', data);
      
      return { 
        id: doc.id, // Ensure ID is explicitly set from the document ID
        ...data,
        // Convert any Timestamp objects to strings
        startDate: data.startDate instanceof Timestamp ? 
          data.startDate.toDate().toISOString() : data.startDate,
        endDate: data.endDate instanceof Timestamp ? 
          data.endDate.toDate().toISOString() : data.endDate,
        // Ensure members is always an array
        members: Array.isArray(data.members) ? data.members : []
      };
    });
    
    // Debug log to check if IDs are properly set
    console.log('Processed public goals:', allPublicGoals.map(g => ({ id: g.id, title: g.title })));
    
    // Filter out goals the user has already joined
    const recommendedGoals = allPublicGoals.filter(goal => {
      const members = goal.members || [];
      return !members.includes(userId);
    });
    
    console.log(`Found ${recommendedGoals.length} recommended goals`);
    return recommendedGoals;
  } catch (error) {
    console.error('Error getting recommended goals:', error);
    throw error;
  }
};

// Function to join a goal
export const joinGoal = async (goalId, userId) => {
  if (!goalId) {
    console.error('joinGoal called without goalId');
    throw new Error('Goal ID is required to join a goal');
  }
  
  if (!userId) {
    console.error('joinGoal called without userId');
    throw new Error('User ID is required to join a goal');
  }

  try {
    console.log(`User ${userId} is joining goal ${goalId}`);
    
    // First, get the current goal data
    const goalRef = doc(db, 'goals', goalId);
    const goalDoc = await getDoc(goalRef);
    
    if (!goalDoc.exists()) {
      console.error(`Goal with ID ${goalId} not found`);
      throw new Error(`Goal with ID ${goalId} not found`);
    }
    
    const goalData = goalDoc.data();
    console.log('Current goal data:', goalData);
    
    // Check if user is already a member
    const members = goalData.members || [];
    if (members.includes(userId)) {
      console.log(`User ${userId} is already a member of goal ${goalId}`);
      return {
        id: goalDoc.id, // Ensure ID is explicitly set
        ...goalData,
        // Convert any Timestamp objects to strings
        startDate: goalData.startDate instanceof Timestamp ? 
          goalData.startDate.toDate().toISOString() : goalData.startDate,
        endDate: goalData.endDate instanceof Timestamp ? 
          goalData.endDate.toDate().toISOString() : goalData.endDate
      };
    }
    
    // Update the goal with the new member
    await updateDoc(goalRef, {
      members: arrayUnion(userId),
      goalType: 'public' // Ensure the goal is public
    });
    
    console.log(`Successfully added user ${userId} to goal ${goalId}`);
    
    // Return the updated goal data
    const updatedGoalDoc = await getDoc(goalRef);
    const updatedData = updatedGoalDoc.data();
    return {
      id: updatedGoalDoc.id, // Ensure ID is explicitly set
      ...updatedData,
      // Convert any Timestamp objects to strings
      startDate: updatedData.startDate instanceof Timestamp ? 
        updatedData.startDate.toDate().toISOString() : updatedData.startDate,
      endDate: updatedData.endDate instanceof Timestamp ? 
        updatedData.endDate.toDate().toISOString() : updatedData.endDate
    };
  } catch (error) {
    console.error('Error joining goal:', error);
    throw error;
  }
};

// Function to check if a user has already joined a goal
export const hasUserJoinedGoal = async (goalId, userId) => {
  if (!goalId || !userId) {
    console.error('hasUserJoinedGoal called without goalId or userId');
    return false;
  }

  try {
    console.log(`Checking if user ${userId} has joined goal ${goalId}`);
    const goalRef = doc(db, 'goals', goalId);
    const goalDoc = await getDoc(goalRef);
    
    if (!goalDoc.exists()) {
      console.log(`Goal with ID ${goalId} not found`);
      return false;
    }
    
    const goalData = goalDoc.data();
    const members = goalData.members || [];
    
    const hasJoined = members.includes(userId);
    console.log(`User ${userId} has${hasJoined ? '' : ' not'} joined goal ${goalId}`);
    return hasJoined;
  } catch (error) {
    console.error('Error checking if user joined goal:', error);
    return false;
  }
};