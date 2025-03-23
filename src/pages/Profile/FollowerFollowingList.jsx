import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";


const FollowerFollowingList = ({
  isOpen,
  onClose,
  data,
  title,
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-2">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-t-indigo-500 border-indigo-200 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              <p>{error}</p>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No {title.toLowerCase()} found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-700">
              {data.map((user) => (
                <li key={user.uid} className="py-3 px-2">
                  <Link
                    to={`/profile/${user.uid}`}
                    className="flex items-center hover:bg-gray-700 p-2 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-[#333] overflow-hidden flex items-center justify-center cursor-pointer shadow-sm border border-gray-700">
                        {user.profilePic ? (
                          <img
                            src={user.profilePic}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-lg font-bold">
                            {user.name?.charAt(0) || "U"}
                          </span>
                        )}
                      </div>
                      {user.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {user.name}
                        </span>
                        <span className="text-gray-400 text-sm line-clamp-1">
                          {user.bio || "No bio"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowerFollowingList;
