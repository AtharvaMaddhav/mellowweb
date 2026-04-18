import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/profileService';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import SideBar from '../SideBar/SideBar';
import './Search.css';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [followingStatus, setFollowingStatus] = useState({});
  const [followLoading, setFollowLoading] = useState({});
  const navigate = useNavigate();

  // Set current user
  useEffect(() => {
    const user = auth.currentUser;
    setCurrentUser(user);
    
    if (!user) {
      // Redirect to authentication if not logged in
      navigate('/auth');
    }
  }, [navigate]);

  // Debounced search function
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        performSearch(searchTerm.trim());
      } else {
        setSearchResults([]);
        setFollowingStatus({});
      }
    }, 300); // 300ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = async (term) => {
    setIsLoading(true);
    setError('');
    try {
      const results = await profileService.searchUsers(term);
      setSearchResults(results);

      // Check following status for each user
      if (currentUser) {
        const statusMap = {};
        for (const user of results) {
          if (user.uid && user.uid !== currentUser.uid) {
            try {
              const isFollowing = await profileService.isFollowing(currentUser.uid, user.uid);
              statusMap[user.uid] = isFollowing;
            } catch (err) {
              console.error('Error checking follow status for user:', user.uid, err);
              statusMap[user.uid] = false; // Default to not following
            }
          }
        }
        setFollowingStatus(statusMap);
      }
    } catch (err) {
      setError('Failed to search users. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleFollowToggle = async (targetUserId, e) => {
    e.stopPropagation(); // Prevent triggering user card click

    console.log('Follow toggle clicked for user:', targetUserId);
    console.log('Current user:', currentUser);

    if (!currentUser) {
      setError('You must be logged in to follow users.');
      return;
    }

    if (currentUser.uid === targetUserId) {
      setError('You cannot follow yourself.');
      return;
    }

    setFollowLoading(prev => ({ ...prev, [targetUserId]: true }));
    setError(''); // Clear any previous errors

    try {
      const isCurrentlyFollowing = followingStatus[targetUserId];
      console.log('Current follow status:', isCurrentlyFollowing);

      if (isCurrentlyFollowing) {
        console.log('Unfollowing user:', targetUserId);
        await profileService.unfollowUser(currentUser.uid, targetUserId);
        setFollowingStatus(prev => ({ ...prev, [targetUserId]: false }));
        console.log('Unfollow successful');
      } else {
        console.log('Following user:', targetUserId);
        await profileService.followUser(currentUser.uid, targetUserId);
        setFollowingStatus(prev => ({ ...prev, [targetUserId]: true }));
        console.log('Follow successful');
      }
    } catch (err) {
      console.error('Error updating follow status:', err);
      setError(`Failed to ${followingStatus[targetUserId] ? 'unfollow' : 'follow'} user. Please try again.`);
    } finally {
      setFollowLoading(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 h-full bg-black flex items-center justify-center p-3">
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 pl-0 overflow-y-auto overflow-x-hidden h-screen">
        <div className="search-container">
          <h1 className="text-white mb-6">Search Users</h1>

          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search for users by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {isLoading && <div className="search-loading">Searching...</div>}
          </div>

          {error && <div className="search-error">{error}</div>}

          <div className="search-results">
            {searchResults.length === 0 && searchTerm && !isLoading && (
              <div className="no-results">No users found matching "{searchTerm}"</div>
            )}

            {searchResults.map((user) => (
              <div
                key={user.uid}
                className="user-card"
                onClick={() => handleUserClick(user.uid)}
              >
                <img
                  src={user.profilePic || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTMwIDI1QzMyLjIwOTEgMjUgMzQgMjYuNzA5MSAzNCAzMEMzNCAyOC4yMDkxIDMyLjIwOTEgMjcgMzAgMjdzLTIuMjA5MSAxLjI5MDktNCAyLjkxMDlDMTYuNzkwOSAyNyAxNSAyOC4yMDkxIDE1IDMwQzE1IDMxLjc5MDkgMTYuNzkwOSAzMyAxOCAzMyAzMEMzMyAzMS43OTA5IDMxLjc5MDkgMzAgMzBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='}
                  alt={user.name}
                  className="user-avatar"
                />
                <div className="user-info">
                  <h3 className="user-name text-white">{user.name}</h3>
                  <p className="user-bio text-gray-300">{user.bio || 'No bio available'}</p>
                  <div className="user-stats">
                    <span className="text-gray-400">{user.followers?.length || 0} followers</span>
                    <span className="text-gray-400">{user.following?.length || 0} following</span>
                  </div>
                </div>
                {currentUser && currentUser.uid !== user.uid && (
                  <button
                    onClick={(e) => handleFollowToggle(user.uid, e)}
                    disabled={followLoading[user.uid]}
                    className={`follow-button ${followingStatus[user.uid] ? 'following' : 'follow'}`}
                  >
                    {followLoading[user.uid] ? '...' : (followingStatus[user.uid] ? 'Following' : 'Follow')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
