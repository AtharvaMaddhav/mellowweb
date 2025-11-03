import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ Temporary use of API key for testing
const genAI = new GoogleGenerativeAI("AIzaSyBZwXSyNs_QSfGsMQnesRMc4T9aUILpQZ0");

/**
 * Get AI-recommended communities based on user interests and available communities
 * @param {Array<string>} userInterests - Array of user interests/categories
 * @param {Array<Object>} communities - Array of community objects with {id, name, category, description}
 * @param {Array<string>} joinedCommunityIds - Array of community IDs the user has already joined
 * @returns {Promise<Array<string>>} - Array of recommended community IDs in order
 */
export const getRecommendedCommunities = async (userInterests, communities, joinedCommunityIds = []) => {
  try {
    if (!communities || communities.length === 0) {
      throw new Error("No communities available");
    }

    // Filter out already joined communities
    const availableCommunities = communities.filter(
      comm => !joinedCommunityIds.includes(comm.id)
    );

    if (availableCommunities.length === 0) {
      return []; // User has joined all communities
    }

    // Use model with correct name
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Create a detailed prompt with community information
    const communityInfo = availableCommunities.map(comm => ({
      id: comm.id,
      name: comm.name,
      category: comm.category || "General",
      description: comm.description || comm.tagline || "",
      membersCount: comm.membersCount || 0
    }));

    const prompt = `
You are a community recommendation system for a social platform.

User's interests: ${userInterests && userInterests.length > 0 ? userInterests.join(", ") : "Not specified - recommend based on popularity and variety"}

Available communities to recommend:
${JSON.stringify(communityInfo, null, 2)}

Task: Analyze the user's interests and recommend communities in the best order for this user.
Consider:
1. Match between user interests and community categories
2. Community descriptions and their relevance
3. Mix popular communities with niche ones
4. Provide diverse recommendations across different categories

Return ONLY a JSON array of community IDs in recommended order (most relevant first).
Example output format: ["comm_id_1", "comm_id_2", "comm_id_3"]

Important: Return only the JSON array, no additional text or explanation.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON array from response
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    
    if (startIndex === -1 || endIndex === -1) {
      console.warn("Could not parse AI response, falling back to default ordering");
      return availableCommunities.map(c => c.id);
    }

    const jsonString = text.substring(startIndex, endIndex + 1);
    const recommendedIds = JSON.parse(jsonString);
    
    // Validate that all returned IDs exist in available communities
    const validIds = recommendedIds.filter(id => 
      availableCommunities.some(comm => comm.id === id)
    );
    
    // Add any communities that weren't recommended (fallback)
    const missingIds = availableCommunities
      .map(c => c.id)
      .filter(id => !validIds.includes(id));
    
    return [...validIds, ...missingIds];
    
  } catch (error) {
    console.error("Error getting recommended communities:", error);
    
    // Fallback: Sort by member count (popularity)
    return communities
      .filter(comm => !joinedCommunityIds.includes(comm.id))
      .sort((a, b) => (b.membersCount || 0) - (a.membersCount || 0))
      .map(c => c.id);
  }
};

/**
 * Get user interests from their profile or joined communities
 * @param {string} userId - User ID
 * @param {Object} db - Firestore database instance
 * @returns {Promise<Array<string>>} - Array of user interests
 */
export const getUserInterests = async (userId, db) => {
  try {
    const { doc, getDoc, collection, getDocs, query, where } = await import("firebase/firestore");
    
    // Try to get interests from user profile
    const userDoc = await getDoc(doc(db, "users", userId));
    
    if (userDoc.exists() && userDoc.data().interests) {
      return userDoc.data().interests;
    }
    
    // Fallback: Infer interests from joined communities
    const communitiesSnapshot = await getDocs(collection(db, "Communities"));
    const joinedCategories = [];
    
    communitiesSnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.members && data.members.includes(userId) && data.category) {
        joinedCategories.push(data.category);
      }
    });
    
    // Return unique categories
    return [...new Set(joinedCategories)];
    
  } catch (error) {
    console.error("Error getting user interests:", error);
    return [];
  }
};