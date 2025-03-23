import React, { useState, useEffect } from "react";
import { Users, Plus, Trophy, BookOpen, Heart, Dumbbell, Brain, Filter, Compass } from "lucide-react";
import SideBar from "../SideBar/SideBar.jsx";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import CreateCommunity from "./CreateCommunity.jsx";
import CommunityDetails from "./CommunityDetails.jsx";

const Community = () => {
  const [isCreatingCommunity, setIsCreateModalOpen] = useState(false);
  const [communities, setCommunities] = useState([]);
  const [trendingCommunities, setTrendingCommunities] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [suggestedCommunities, setSuggestedCommunities] = useState([]);
  const [mostPopularCommunity, setMostPopularCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("myCommunities");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(false);
  
  // Set current user ID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Fetch communities from database
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "Communities"));
        
        const communitiesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            tagline: data.tagline,
            image: data.image,
            members: data.members || [],
            membersCount: data.members ? data.members.length : 0,
            category: data.category,
            createdBy: data.createdBy,
            timestamp: data.timestamp
          };
        });
        
        // Sort by member count to get trending communities
        const sorted = [...communitiesData].sort((a, b) => b.membersCount - a.membersCount);
        setCommunities(communitiesData);
        
        // Set top 5 trending communities
        setTrendingCommunities(sorted.slice(0, 5));
        
        // Set most popular community (for featured section)
        if (sorted.length > 0) {
          setMostPopularCommunity(sorted[0]);
        }
        
        // Filter user's communities if user is logged in
        if (currentUserId) {
          const userComms = communitiesData.filter(comm => 
            comm.members && comm.members.includes(currentUserId)
          );
          setUserCommunities(userComms);
          
          // Get suggested communities (trending that user hasn't joined)
          const suggested = sorted.filter(comm => 
            !comm.members || !comm.members.includes(currentUserId)
          ).slice(0, 5);
          setSuggestedCommunities(suggested);
        }
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCommunities();
  }, [currentUserId]);
  
  // Handle viewing community details
  const handleViewCommunity = (community) => {
    setSelectedCommunity(community);
    setViewingDetails(true);
  };
  
  // Handle returning from community details
  const handleBackFromDetails = () => {
    setViewingDetails(false);
    setSelectedCommunity(null);
    
    // Refetch communities to get updated data
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "Communities"));
        
        const communitiesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            tagline: data.tagline,
            image: data.image,
            members: data.members || [],
            membersCount: data.members ? data.members.length : 0,
            category: data.category,
            createdBy: data.createdBy,
            timestamp: data.timestamp
          };
        });
        
        // Sort by member count to get trending communities
        const sorted = [...communitiesData].sort((a, b) => b.membersCount - a.membersCount);
        setCommunities(communitiesData);
        
        // Set top 5 trending communities
        setTrendingCommunities(sorted.slice(0, 5));
        
        // Set most popular community (for featured section)
        if (sorted.length > 0) {
          setMostPopularCommunity(sorted[0]);
        }
        
        // Filter user's communities if user is logged in
        if (currentUserId) {
          const userComms = communitiesData.filter(comm => 
            comm.members && comm.members.includes(currentUserId)
          );
          setUserCommunities(userComms);
          
          // Get suggested communities (trending that user hasn't joined)
          const suggested = sorted.filter(comm => 
            !comm.members || !comm.members.includes(currentUserId)
          ).slice(0, 5);
          setSuggestedCommunities(suggested);
        }
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCommunities();
  };
  
  if (isCreatingCommunity) {
    return <CreateCommunity onComplete={() => setIsCreateModalOpen(false)} />;
  }
  
  if (viewingDetails && selectedCommunity) {
    return <CommunityDetails community={selectedCommunity} onBack={handleBackFromDetails} />;
  }

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
  const CommunityCard = ({ community }) => {
    const isUserMember = community.members && community.members.includes(currentUserId);
    
    return (
      <div 
        onClick={() => handleViewCommunity(community)}
        className="bg-[#252525] rounded-xl p-5 hover:bg-[#2A2A2A] transition-all border border-gray-700 hover:border-purple-500 shadow-lg cursor-pointer"
      >
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
              <span>{community.membersCount.toLocaleString()} members</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs px-2 py-1 bg-purple-900/30 rounded-md text-purple-300">
            {community.category || "General"}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click event
              handleViewCommunity(community);
            }}
            className={`text-xs px-4 py-1.5 rounded-md text-white font-semibold transition-all ${
              isUserMember 
                ? "bg-gray-600 hover:bg-gray-700" 
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {isUserMember ? "View" : "Join"}
          </button>
        </div>
      </div>
    );
  };

  // Detailed community card for featured section
  const DetailedCommunityCard = ({ community }) => {
    if (!community) return null;
    
    const isUserMember = community.members && community.members.includes(currentUserId);
    
    return (
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-gray-800 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-lg">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={16} className="text-yellow-500" />
              <span className="text-xs uppercase tracking-wider text-yellow-400 font-semibold">Most Popular</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{community.name}</h3>
            <p className="text-gray-300 mb-4">{community.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{community.membersCount.toLocaleString()} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy size={14} />
                <span>{community.tagline}</span>
              </div>
            </div>
            <button 
              onClick={() => handleViewCommunity(community)}
              className={`px-5 py-2.5 rounded-lg text-white flex items-center gap-2 transition-all shadow-md ${
                isUserMember 
                  ? "bg-gray-600 hover:bg-gray-700" 
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isUserMember ? "View Community" : "Join Now"}
            </button>
          </div>
          <div className="flex-shrink-0">
            <img 
              src={community.image || "/api/placeholder/240/180"} 
              alt={community.name} 
              className="w-64 h-48 rounded-lg shadow-lg border border-gray-700 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/api/placeholder/240/180";
              }}
            />
          </div>
        </div>
      </div>
    );
  };

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

        {/* Trending Communities Slider - Updated to fix scrollbar issue */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            Trending Communities
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {loading ? (
              Array(5).fill(0).map((_, index) => (
                <div key={index} className="flex-shrink-0 bg-[#222] animate-pulse p-5 rounded-xl w-64 h-32"></div>
              ))
            ) : trendingCommunities.map((community, index) => (
              <div 
                key={community.id} 
                onClick={() => handleViewCommunity(community)}
                className="flex-shrink-0 bg-gradient-to-br from-purple-600 to-blue-600 p-5 rounded-xl w-64 h-32 flex flex-col justify-between hover:scale-105 transition-transform cursor-pointer shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <img 
                      src={community.image || "/api/placeholder/40/40"} 
                      alt={community.name}
                      className="w-8 h-8 rounded-md object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/40/40";
                      }}
                    />
                  </div>
                  <div className="bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">
                    <p className="text-xs text-white font-medium">#{index + 1}</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-white truncate">{community.name}</p>
                  <p className="text-xs text-gray-200">{community.membersCount.toLocaleString()} members</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Explorer Section */}
        <div className="bg-[#111] rounded-xl p-6 mb-8 shadow-xl border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Community Explorer</h2>
            </div>
            <div className="flex gap-2">
              <FilterButton 
                label="My Communities" 
                icon={<Users size={14} />} 
                filter="myCommunities" 
              />
              <FilterButton 
                label="Suggested For You" 
                icon={<Compass size={14} />} 
                filter="suggested" 
              />
            </div>
          </div>

          {/* Communities Grid */}
          {loading ? renderLoading() : error ? renderError() : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeFilter === "myCommunities" ? (
                userCommunities.length > 0 ? (
                  userCommunities.map((community) => (
                    <CommunityCard key={community.id} community={community} />
                  ))
                ) : (
                  <div className="col-span-3 text-center p-10 text-gray-400">
                    <p>You haven't joined any communities yet. Explore our suggestions!</p>
                  </div>
                )
              ) : (
                suggestedCommunities.length > 0 ? (
                  suggestedCommunities.map((community) => (
                    <CommunityCard key={community.id} community={community} />
                  ))
                ) : (
                  <div className="col-span-3 text-center p-10 text-gray-400">
                    <p>No suggested communities available right now.</p>
                  </div>
                )
              )}
            </div>
          )}
          
          {/* Featured Community - Most Popular */}
          <div className="mt-10">
            <div className="flex items-center gap-2 mb-6">
              <Trophy size={18} className="text-yellow-500" />
              <h2 className="text-2xl font-bold text-white">Featured Community</h2>
            </div>
            
            {loading ? (
              <div className="bg-[#222] animate-pulse p-6 rounded-xl h-48"></div>
            ) : mostPopularCommunity ? (
              <DetailedCommunityCard community={mostPopularCommunity} />
            ) : (
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-6 border border-gray-800 text-center">
                <p className="text-gray-400">No communities available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add CSS to hide scrollbars globally
const style = document.createElement('style');
style.textContent = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;
document.head.appendChild(style);

export default Community;