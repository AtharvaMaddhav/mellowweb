import React, { useState, useEffect } from "react";
import { Users, Plus, Trophy, BookOpen, Compass, Heart, Dumbbell, Brain, Filter } from "lucide-react";
import SideBar from "../SideBar/SideBar.jsx";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import CreateCommunity from "./CreateCommunity.jsx";

const Community = () => {
  const [isCreatingCommunity, setIsCreateModalOpen] = useState(false);
  const [recommendedCommunities, setRecommendedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Fetch communities from database
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "Communities"));
        
        const communities = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            tagline: data.tagline,
            image: data.image,
            membersCount: data.members ? data.members.length : 0,
            category: data.category
          };
        });
        
        setRecommendedCommunities(communities);
        console.log("Fetched communities:", communities);
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCommunities();
  }, []);
  
  if (isCreatingCommunity) {
    return <CreateCommunity />;
  } 
  // Trending categories
  const trendingCategories = [
    { name: "Fitness", icon: <Dumbbell size={16} /> },
    { name: "Reading", icon: <BookOpen size={16} /> },
    { name: "Wellness", icon: <Heart size={16} /> },
    { name: "Education", icon: <Brain size={16} /> }
  ];

  // Render loading state
  const renderLoading = () => (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );

  // Render error state
  const renderError = () => (
    <div className="bg-red-900/30 text-red-300 p-4 rounded-lg">
      <p>Failed to load communities: {error}</p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded"
      >
        Retry
      </button>
    </div>
  );

  // Filter buttons for the Community Explorer section
  const FilterButton = ({ label, icon, filter }) => (
    <button 
      onClick={() => setActiveFilter(filter)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        activeFilter === filter 
          ? "bg-purple-600 text-white" 
          : "bg-[#333] text-gray-300 hover:bg-[#444]"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  // Community card component
  const CommunityCard = ({ community }) => (
    <div className="bg-[#252525] rounded-xl p-5 hover:bg-[#2A2A2A] transition-all border border-gray-700 hover:border-purple-500 shadow-lg cursor-pointer">
      <div className="flex gap-4 items-center mb-3">
        <div className="flex-shrink-0">
          <img 
            src={community.image || "/api/placeholder/80/80"} 
            alt={community.name} 
            className="w-16 h-16 rounded-lg object-cover border border-gray-700"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/api/placeholder/80/80";
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-white truncate">{community.name}</h3>
          <p className="text-gray-300 text-sm truncate">{community.tagline}</p>
          <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
            <Users size={12} />
            <span>{community.members?.toLocaleString() || "0"} members</span>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-xs px-2 py-1 bg-purple-900/30 rounded-md text-purple-300">
          {community.category || "General"}
        </span>
        <button className="text-xs bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-md text-white font-semibold transition-all">
          Join
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar Component */}
      <div className="w-72 h-full bg-black flex items-center justify-center p-3">
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto overflow-x-hidden h-screen">
        {/* Search and Header Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Communities</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Communities..."
                className="w-64 p-2 pl-8 bg-[#222] text-white border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              />
              <span className="absolute left-2.5 top-2.5 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
            </div>
            
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-all shadow-lg"
            >
              <Plus size={18} />
              Create Community
            </button>
          </div>
        </div>

        {/* Trending Categories Slider */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            Trending Categories
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {trendingCategories.map((category, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 bg-gradient-to-br from-purple-600 to-blue-600 p-5 rounded-xl w-48 h-32 flex flex-col justify-between hover:scale-105 transition-transform cursor-pointer shadow-xl"
              >
                <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  {category.icon}
                </div>
                <div>
                  <p className="font-semibold text-white">{category.name}</p>
                  <p className="text-xs text-gray-200">{Math.floor(Math.random() * 100) + 20} communities</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Explorer Section */}
        <div className="bg-[#111] rounded-xl p-6 mb-8 shadow-xl border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">Community Explorer</h2>
            </div>
            <div className="flex gap-2">
              <FilterButton 
                label="All" 
                icon={<Filter size={14} />} 
                filter="all" 
              />
              <FilterButton 
                label="Newest" 
                icon={<BookOpen size={14} />} 
                filter="newest" 
              />
              <FilterButton 
                label="Popular" 
                icon={<Users size={14} />} 
                filter="popular" 
              />
            </div>
          </div>

          {/* Communities Grid */}
          {loading ? renderLoading() : error ? renderError() : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedCommunities.length > 0 ? recommendedCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              )) : (
                <div className="col-span-3 text-center p-10 text-gray-400">
                  <p>No communities found. Try again later.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Featured Community */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-6">
              <Trophy size={18} className="text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">Featured Community</h2>
            </div>
            
            {recommendedCommunities.length > 0 && (
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-gray-800 shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="max-w-lg">
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {recommendedCommunities[0]?.name || "Community Spotlight"}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {recommendedCommunities[0]?.description || "Join our featured community to connect with others who share your interests and passions."}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                      <Users size={14} />
                      <span>{recommendedCommunities[0]?.members?.toLocaleString() || "0"} members</span>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg text-white flex items-center gap-2 transition-all shadow-md">
                      Join Now
                    </button>
                  </div>
                  <div className="flex-shrink-0">
                    <img 
                      src={recommendedCommunities[0]?.image || "/api/placeholder/240/180"} 
                      alt={recommendedCommunities[0]?.name || "Featured Community"} 
                      className="w-64 h-48 rounded-lg shadow-lg border border-gray-700 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/240/180";
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;