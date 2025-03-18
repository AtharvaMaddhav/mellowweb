import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Compass, Target, MessageCircle, Heart, Plus, User, MoreHorizontal, Users } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: <Home size={40} />, text: 'Home' },
    { path: '/search', icon: <Search size={40} />, text: 'Search' },
    { path: '/explore', icon: <Compass size={40} />, text: 'Explore' },
    { path: '/goal', icon: <Target size={40} />, text: 'Daily Goals' },
    { path: '/chat', icon: <MessageCircle size={40} />, text: 'Chat' },
    { path: '/notifications', icon: <Heart size={40} />, text: 'Notifications' },
    { path: '/create', icon: <Plus size={40} />, text: 'Create' },
    { path: '/profile', icon: <User size={40} />, text: 'Profile' },
    { path: '/community', icon: <Users size={40} />, text: 'Community' },
    { path: '/more', icon: <MoreHorizontal size={40} />, text: 'More' },
  ];
  
  return (
    <div className="h-screen w-80 bg-black text-white p-6 flex flex-col">
      <h1 className="text-5xl font-bold mb-6">Mellow!</h1>
      <div className="flex flex-col gap-5">
        {navItems.map((item) => (
          <NavItem key={item.text} to={item.path} icon={item.icon} text={item.text} />
        ))}
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, text }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-5 p-4 rounded-lg text-2xl cursor-pointer ${
          isActive ? 'bg-gray-800' : 'hover:bg-gray-700'
        }`
      }
    >
      {icon}
      <span>{text}</span>
    </NavLink>
  );
};

export default Sidebar;