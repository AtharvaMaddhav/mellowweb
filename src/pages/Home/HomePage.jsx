import React, { useState, useEffect } from "react";
import { auth } from "../../config/firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import './Homepage.css';
import { FaHome, FaSearch, FaCompass, FaVideo, FaFacebookMessenger, FaHeart, FaPlus, FaUser, FaEllipsisH } from 'react-icons/fa';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Check user authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <div className="instagram-layout">
    {/* Left Sidebar */}
    <div className="sidebar">
      <div className="logo">
        <h1>Mellow!</h1>
      </div>
      <div className="sidebar-menu">
        <div className="menu-item active">
          <FaHome size={24} />
          <span>Home</span>
        </div>
        <div className="menu-item">
          <FaSearch size={24} />
          <span>Search</span>
        </div>
        <div className="menu-item">
          <FaCompass size={24} />
          <span>Explore</span>
        </div>
        <div className="menu-item">
          <FaVideo size={24} />
          <span>Daily Goals</span>
        </div>
        <div className="menu-item">
          <FaFacebookMessenger size={24} />
          <span>Chat</span>
        </div>
        <div className="menu-item">
          <FaHeart size={24} />
          <span>Notifications</span>
        </div>
        <div className="menu-item">
          <FaPlus size={24} />
          <span>Create</span>
        </div>
        <div className="menu-item">
          <FaUser size={24} />
          <span>Profile</span>
        </div>
      </div>
      <div className="menu-item more">
        <FaEllipsisH size={24} />
        <span>More</span>
      </div>
    </div>

    {/* Main Content */}
    <div className="main-content">
      {/* Stories Section */}
      <div className="stories-container">
        <div className="story-item">
          <div className="story-avatar car">
            <img src="https://via.placeholder.com/60" alt="Story Avatar" />
          </div>
          <span className="story-username">joji_tha...</span>
        </div>
        <div className="story-item">
          <div className="story-avatar">
            <img src="https://via.placeholder.com/60" alt="Story Avatar" />
          </div>
          <span className="story-username">mr.hight...</span>
        </div>
        <div className="story-item">
          <div className="story-avatar">
            <img src="https://via.placeholder.com/60" alt="Story Avatar" />
          </div>
          <span className="story-username">sujita8104</span>
        </div>
        <div className="story-item">
          <div className="story-avatar">
            <img src="https://via.placeholder.com/60" alt="Story Avatar" />
          </div>
          <span className="story-username">shikhardh...</span>
        </div>
        <div className="story-item">
          <div className="story-avatar">
            <img src="https://via.placeholder.com/60" alt="Story Avatar" />
          </div>
          <span className="story-username">shivani_...</span>
        </div>
        <div className="story-item">
          <div className="story-avatar">
            <img src="https://via.placeholder.com/60" alt="Story Avatar" />
          </div>
          <span className="story-username">anushka...</span>
        </div>
        <div className="story-item">
          <div className="story-avatar">
            <img src="https://via.placeholder.com/60" alt="Story Avatar" />
          </div>
          <span className="story-username">sreeleela...</span>
        </div>
        <div className="story-item">
          <div className="story-avatar">
            <img src="https://via.placeholder.com/60" alt="Story Avatar" />
          </div>
          <span className="story-username">dhanash...</span>
        </div>
      </div>

      {/* Suggestions Section */}
      <div className="suggestions-section">
        <div className="suggestions-header">
          <h3>Suggestions for you</h3>
          <a href="#" className="see-all">See all</a>
        </div>

        <div className="suggestions-grid">
          <div className="suggestion-card">
            <div className="dismiss">×</div>
            <div className="suggestion-avatar">
              <img src="https://via.placeholder.com/80" alt="Suggested Profile" />
            </div>
            <div className="suggestion-name verified">Álvaro Arbeloa</div>
            <div className="suggestion-info">Instagram recommended</div>
            <button className="follow-button">Follow</button>
          </div>

          <div className="suggestion-card">
            <div className="dismiss">×</div>
            <div className="suggestion-avatar">
              <img src="https://via.placeholder.com/80" alt="Suggested Profile" />
            </div>
            <div className="suggestion-name verified">The Tonight Show</div>
            <div className="suggestion-info">Instagram recommended</div>
            <button className="follow-button">Follow</button>
          </div>

          <div className="suggestion-card">
            <div className="dismiss">×</div>
            <div className="suggestion-avatar">
              <img src="https://via.placeholder.com/80" alt="Suggested Profile" />
            </div>
            <div className="suggestion-name">Shay Mitchell</div>
            <div className="suggestion-info">Instagram recommended</div>
            <button className="follow-button">Follow</button>
          </div>
        </div>
      </div>

      {/* Post Section */}
      <div className="post-section">
        <div className="post-header">
          <div className="post-user">
            <div className="post-user-avatar">
              <img src="https://via.placeholder.com/40" alt="User Avatar" />
            </div>
            <div className="post-user-info">
              <div className="post-username verified">atharvaaa</div>
              <div className="post-time">1h</div>
            </div>
          </div>
          <div className="post-options">
            <FaEllipsisH />
          </div>
        </div>

        <div className="post-image">
          <img src="https://www.ucheck.co.uk/wp-content/uploads/mental-health-2313426_1280.png" alt="Post" />
        </div>
      </div>
    </div>
  </div>
  );
}
