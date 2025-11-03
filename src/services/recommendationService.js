// import { GoogleGenerativeAI } from "@google/generative-ai";

// // ⚠️ Temporary use of API key for testing
// const genAI = new GoogleGenerativeAI("AIzaSyBZwXSyNs_QSfGsMQnesRMc4T9aUILpQZ0");

// export const getRecommendedGoals = async (interests, goals) => {
//   try {
//     if (!interests || !goals || goals.length === 0) {
//       throw new Error("Missing interests or goals");
//     }

//     // Corrected line
//     const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//     const prompt = `
// You are a recommendation system.
// User interests: ${interests.join(", ")}.
// Available goals: ${goals.join(", ")}.
// Return only the goals in the most recommended order as a JSON array.
// Example output: ["Meditate daily", "Read 10 pages a day", "Save money monthly"]
// `;

//     const result = await model.generateContent(prompt);
//     const text = result.response.text();

//     // Try to safely parse the Gemini output
//     const recommended = JSON.parse(text);
//     return recommended;
//   } catch (error) {
//     console.error("Error getting recommended goals:", error);
//     return goals; // fallback to default order
//   }
// };

import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ Temporary use of API key for testing
const genAI = new GoogleGenerativeAI("AIzaSyBZwXSyNs_QSfGsMQnesRMc4T9aUILpQZ0");

export const getRecommendedGoals = async (interests, goals) => {
  try {
    if (!interests || !goals || goals.length === 0) {
      throw new Error("Missing interests or goals");
    }

    // FIX 1: Correct model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are a recommendation system.
User interests: ${interests.join(", ")}.
Available goals: ${goals.join(", ")}.
Return only the goals in the most recommended order as a JSON array.
Example output: ["Meditate daily", "Read 10 pages a day", "Save money monthly"]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // FIX 2: Extract the JSON string before parsing
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error(`Could not find JSON array in model response: ${text}`);
    }

    const jsonString = text.substring(startIndex, endIndex + 1);
    const recommended = JSON.parse(jsonString); // This will now work
    
    return recommended;
  } catch (error) {
    console.error("Error getting recommended goals:", error);
    return goals; // fallback to default order
  }
};