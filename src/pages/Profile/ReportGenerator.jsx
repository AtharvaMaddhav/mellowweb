import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { profileService } from "../../services/profileService.js";

const ReportGenerator = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);

  // API endpoint configuration - using Vite proxy
  const API_ENDPOINT = "/api/generate-pdf";

  // Generate month options
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Generate year options (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  useEffect(() => {
    // Set default to current month
    setSelectedMonth(new Date().getMonth() + 1);
  }, []);

  // Load monthly data when month/year changes
  useEffect(() => {
    if (selectedMonth && selectedYear && user?.uid) {
      loadMonthlyData();
    }
  }, [selectedMonth, selectedYear, user]);

  const loadMonthlyData = async () => {
    try {
      const data = await fetchMonthlyData(selectedMonth, selectedYear);
      setMonthlyData(data);
    } catch (err) {
      console.error("Failed to load monthly data:", err);
      setMonthlyData(null);
    }
  };

  const fetchMonthlyData = async (month, year) => {
    try {
      if (!user?.uid) {
        throw new Error("User not authenticated");
      }

      // Create date range for the selected month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      // Fetch all relevant data for the month
      const [posts, mood, activities, goals] = await Promise.all([
        profileService.getUserPostsInDateRange(user.uid, startDate, endDate),
        profileService.getUserMoodDataInDateRange(user.uid, startDate, endDate),
        profileService.getUserActivitiesInDateRange(user.uid, startDate, endDate),
        profileService.getUserGoalsInDateRange(user.uid, startDate, endDate),
      ]);

      return {
        userId: user.uid,
        userName: user.displayName || user.email,
        month: month,
        year: year,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        data: {
          posts: posts || [],
          mood: mood || [],
          activities: activities || [],
          goals: goals || [],
        },
        summary: {
          totalPosts: posts?.length || 0,
          totalMoodEntries: mood?.length || 0,
          totalActivities: activities?.length || 0,
          totalGoals: goals?.length || 0,
        },
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching monthly data:", error);
      throw error;
    }
  };

  // Transform data to match API expected format
  const transformDataForAPI = (monthlyData) => {
    const logs = [];

    // Transform mood data to logs format
    if (monthlyData.data.mood && monthlyData.data.mood.length > 0) {
      monthlyData.data.mood.forEach(moodEntry => {
        logs.push({
          moodIndex: moodEntry.moodIndex || moodEntry.mood || 3, // Default to 3 if no index
          moodLabel: moodEntry.moodLabel || moodEntry.type || moodEntry.emotion || "Neutral",
          note: moodEntry.note || moodEntry.description || moodEntry.thoughts || "",
          timestamp: moodEntry.createdAt ? moodEntry.createdAt.toISOString() : new Date().toISOString()
        });
      });
    }

    // Transform posts to logs format (treating posts as mood entries)
    if (monthlyData.data.posts && monthlyData.data.posts.length > 0) {
      monthlyData.data.posts.forEach(post => {
        logs.push({
          moodIndex: 3, // Default neutral mood for posts
          moodLabel: "Reflection", // Label posts as reflections
          note: post.content || post.text || post.description || "",
          timestamp: post.createdAt ? post.createdAt.toISOString() : new Date().toISOString()
        });
      });
    }

    // Transform goals to logs format
    if (monthlyData.data.goals && monthlyData.data.goals.length > 0) {
      monthlyData.data.goals.forEach(goal => {
        logs.push({
          moodIndex: goal.completed ? 4 : 3, // Higher mood for completed goals
          moodLabel: goal.completed ? "Achievement" : "Goal Setting",
          note: `Goal: ${goal.title || goal.description || "Unnamed goal"}${goal.completed ? " (Completed)" : ""}`,
          timestamp: goal.createdAt ? goal.createdAt.toISOString() : new Date().toISOString()
        });
      });
    }

    // Sort logs by timestamp
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return { logs };
  };

  const generateReport = async () => {
    if (!selectedMonth || !selectedYear) {
      setError("Please select both month and year");
      return;
    }

    // API endpoint is now hardcoded, no validation needed for project ID

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      // Fetch monthly data
      const monthlyData = await fetchMonthlyData(selectedMonth, selectedYear);

      // Check if there's enough data to generate report
      const hasData = monthlyData.summary.totalPosts > 0 || 
                     monthlyData.summary.totalGoals > 0 || 
                     monthlyData.summary.totalMoodEntries > 0 ||
                     monthlyData.summary.totalActivities > 0;

      if (!hasData) {
        setError("No data found for the selected month and year. Please select a different period or create some content first.");
        return;
      }

      // Transform data to match API format
      const apiData = transformDataForAPI(monthlyData);

      console.log("Using API endpoint:", API_ENDPOINT);
      console.log("Sending data to API:", apiData);

      // Send to report generation API with proper headers
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/pdf"
        },
        body: JSON.stringify(apiData)
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Report generation failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      // Handle PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Mental_Health_Report_${months.find(m => m.value === selectedMonth)?.label}_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess(`Report for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear} generated successfully!`);
      
    } catch (err) {
      console.error("Failed to generate report:", err);
      
      // Handle different types of errors
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        if (err.message.includes('CORS') || error?.includes('CORS')) {
          setError("CORS Error: Your API server needs to allow requests from this domain (http://localhost:5173). Please add the required CORS headers to your API.");
        } else {
          setError("Unable to connect to the report service. This might be due to CORS policy, network issues, or server downtime. Please check the API status and CORS configuration.");
        }
      } else if (err.message.includes('CORS') || err.message.includes('Access-Control')) {
        setError("CORS Error: The API server is blocking requests from this domain. Please configure CORS headers on your API server.");
      } else if (err.message.includes('Failed to parse URL')) {
        setError("Invalid API endpoint URL. Please check your API configuration.");
      } else {
        setError(err.message || "Failed to generate report. Please try again later.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Generate Mental Health Report</h1>
          <p className="text-blue-200">
            Generate a comprehensive report of your mental health data for any month
          </p>
        </div>



        {/* Report Generation Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Select Report Period</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Month Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data Preview */}
          {selectedMonth && selectedYear && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-3">
                Data Available for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {(monthlyData?.summary?.totalPosts || 0) + 
                     (monthlyData?.summary?.totalGoals || 0) + 
                     (monthlyData?.summary?.totalMoodEntries || 0)}
                  </div>
                  <div className="text-gray-400">Total Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {monthlyData?.summary?.totalPosts || 0}
                  </div>
                  <div className="text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {monthlyData?.summary?.totalGoals || 0}
                  </div>
                  <div className="text-gray-400">Goals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {monthlyData?.summary?.totalMoodEntries || 0}
                  </div>
                  <div className="text-gray-400">Feelings</div>
                </div>
              </div>

              {/* Show message if no data */}
              {monthlyData && 
               monthlyData.summary.totalPosts === 0 && 
               monthlyData.summary.totalGoals === 0 && 
               monthlyData.summary.totalMoodEntries === 0 && (
                <div className="mt-4 p-3 bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg">
                  <p className="text-yellow-300 text-sm">
                    No data found for this period. Try selecting a different month or add some entries first.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateReport}
            disabled={!selectedMonth || !selectedYear || isGenerating}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
              !selectedMonth || !selectedYear || isGenerating
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating Report...
              </div>
            ) : (
              "Generate PDF Report"
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg">
              <div className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <span className="text-red-300 font-medium">Error:</span>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mt-4 p-4 bg-green-900 bg-opacity-50 border border-green-700 rounded-lg">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-400 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-green-300">{success}</span>
              </div>
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">What's Included in Your Report?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Activity Summary</h3>
                  <p className="text-gray-400 text-sm">Overview of your posts, interactions, and engagement patterns</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Mood Tracking</h3>
                  <p className="text-gray-400 text-sm">Analysis of your mood patterns and emotional well-being</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Goal Progress</h3>
                  <p className="text-gray-400 text-sm">Track your personal goals and achievements</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center mr-3 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Insights & Trends</h3>
                  <p className="text-gray-400 text-sm">Data-driven insights and recommendations for improvement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;