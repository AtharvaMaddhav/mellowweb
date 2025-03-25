import { React } from "react";
import "./App.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import HomePage from "./pages/Home/HomePage.jsx";
import AuthenticationPage from "./pages/Authentication/AuthenticationPage.jsx";
import SignUpPage from "./pages/Authentication/SignUpPage.jsx";
import Goals from "./pages/Goals/Goals.jsx";
import PostPage from "./pages/Posts/PostPage.jsx";
import Search from "./pages/Search/Search.jsx";
import Explore from "./pages/Explore/Explore.jsx";
import Chats from "./pages/Chat/ChatIntro.jsx";
import Notifications from "./pages/Notifications/Notifications.jsx";
import Create from "./pages/Create/Create.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Community from "./pages/Community/Community.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/auth" element={<AuthenticationPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/goal" element={<Goals />} />
        <Route path="/post" element={<PostPage />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/chat" element={<Chats />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/create" element={<Create />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
