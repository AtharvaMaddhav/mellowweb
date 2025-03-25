import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot, addDoc, serverTimestamp, orderBy, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase'; // Assuming you have this setup
import { useAuthState } from 'react-firebase-hooks/auth';
import defaultAvatar from '/download.png'; // Add a default avatar image

function ChatApp() {
  const [user] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch current user's data
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get current user's data
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          // Fetch followers
          if (userData.followers && userData.followers.length > 0) {
            const followersData = await Promise.all(
              userData.followers.map(async (followerId) => {
                const followerRef = doc(db, 'users', followerId);
                const followerSnap = await getDoc(followerRef);
                return followerSnap.exists() ? { id: followerId, ...followerSnap.data() } : null;
              })
            );
            setFollowers(followersData.filter(Boolean));
          }

          // Fetch following
          if (userData.following && userData.following.length > 0) {
            const followingData = await Promise.all(
              userData.following.map(async (followingId) => {
                const followingRef = doc(db, 'users', followingId);
                const followingSnap = await getDoc(followingRef);
                return followingSnap.exists() ? { id: followingId, ...followingSnap.data() } : null;
              })
            );
            setFollowing(followingData.filter(Boolean));
          }
        }

        // Fetch all users for suggestions
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(u => u.id !== user.uid);
        setAllUsers(usersData);

        // Filter out users who are already followed
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        const followingIds = userData.following || [];
        const suggestedUsersData = usersData.filter(u => !followingIds.includes(u.id)).slice(0, 5);
        setSuggestedUsers(suggestedUsersData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();

    // Listen for online status changes of all users
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const userData = change.doc.data();
          const userId = change.doc.id;

          // Update followers
          setFollowers(prev => prev.map(follower =>
            follower.id === userId ? { ...follower, isOnline: userData.isOnline, lastSeen: userData.lastSeen } : follower
          ));

          // Update following
          setFollowing(prev => prev.map(following =>
            following.id === userId ? { ...following, isOnline: userData.isOnline, lastSeen: userData.lastSeen } : following
          ));

          // Update suggested users
          setSuggestedUsers(prev => prev.map(user =>
            user.id === userId ? { ...user, isOnline: userData.isOnline, lastSeen: userData.lastSeen } : user
          ));
        }
      });
    });

    // Update current user's online status
    const updateOnlineStatus = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          isOnline: true
        });

        // Set up offline status when user disconnects
        window.addEventListener('beforeunload', async () => {
          await updateDoc(userRef, {
            isOnline: false,
            lastSeen: serverTimestamp()
          });
        });
      }
    };

    updateOnlineStatus();

    return () => {
      unsubscribe();
      // Update offline status when component unmounts
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, {
          isOnline: false,
          lastSeen: serverTimestamp()
        });
      }
    };
  }, [user]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper function to generate chat ID from two user IDs
  const generateChatId = (userId1, userId2) => {
    // Sort user IDs to ensure consistent chat ID regardless of who initiates the chat
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };

  // Listen for unread messages
  useEffect(() => {
    if (!user) return;

    const fetchUnreadMessages = async () => {
      try {
        // Get all users the current user might chat with
        const contactIds = [...new Set([
          ...followers.map(f => f.id),
          ...following.map(f => f.id),
          ...suggestedUsers.map(u => u.id)
        ])];

        const unreadCounts = {};
        const unsubscribes = [];

        // For each potential contact, check for unread messages
        for (const contactId of contactIds) {
          const chatId = generateChatId(user.uid, contactId);

          // Set up listener for unread messages in this chat
          const messagesQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            where('receiverId', '==', user.uid),
            where('read', '==', false)
          );

          const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            unreadCounts[contactId] = snapshot.docs.length;
            setUnreadMessages({ ...unreadCounts });
          });

          unsubscribes.push(unsubscribe);
        }

        return () => {
          unsubscribes.forEach(unsubscribe => unsubscribe());
        };
      } catch (error) {
        console.error("Error setting up unread messages listeners:", error);
      }
    };

    if (followers.length > 0 || following.length > 0 || suggestedUsers.length > 0) {
      fetchUnreadMessages();
    }
  }, [user, followers, following, suggestedUsers]);

  // Start a chat with a user
  const startChat = async (otherUser) => {
    if (!user) return;

    try {
      // Generate chat ID using the helper function
      const chatId = generateChatId(user.uid, otherUser.id);

      // Check if the chat exists
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      // If chat doesn't exist, create it
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, otherUser.id],
          createdAt: serverTimestamp()
        });
      }

      // Mark messages as read
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        where('receiverId', '==', user.uid),
        where('read', '==', false)
      );

      const unreadSnapshot = await getDocs(messagesQuery);
      const updatePromises = unreadSnapshot.docs.map(doc =>
        updateDoc(doc.ref, { read: true })
      );
      await Promise.all(updatePromises);

      // Update unread count
      setUnreadMessages(prev => ({
        ...prev,
        [otherUser.id]: 0
      }));

      // Set selected chat
      setSelectedChat({
        id: chatId,
        user: otherUser
      });

      // Listen for messages in this chat
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(messagesData);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  // Upload media to Cloudinary
  const uploadMediaToCloudinary = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'mellow_media'); // Replace with your Cloudinary upload preset

      const response = await fetch('https://api.cloudinary.com/v1_1/mellow-post/auto/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload media');
      }

      const result = await response.json();
      setIsUploading(false);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading media:', error);
      setIsUploading(false);
      return null;
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  // Clear selected media
  const clearMedia = () => {
    setMediaFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send a message
  const sendMessage = async (e) => {
    e.preventDefault();

    if ((!newMessage.trim() && !mediaFile) || !selectedChat) return;

    try {
      let mediaUrl = null;

      if (mediaFile) {
        mediaUrl = await uploadMediaToCloudinary(mediaFile);
        if (!mediaUrl) {
          alert('Failed to upload media. Please try again.');
          return;
        }
      }

      await addDoc(collection(db, 'chats', selectedChat.id, 'messages'), {
        message: newMessage.trim() || '',
        senderId: user.uid,
        receiverId: selectedChat.user.id,
        timestamp: serverTimestamp(),
        read: false,
        mediaUrl: mediaUrl,
        mediaType: mediaFile ? mediaFile.type.split('/')[0] : null // 'image' or 'video'
      });

      setNewMessage('');
      clearMedia();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Filter users based on search query
  const filteredContacts = () => {
    const allContacts = [...following, ...followers.filter(f =>
      !following.some(follow => follow.id === f.id)
    )];

    if (!searchQuery) return allContacts;

    return allContacts.filter(contact =>
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.name && contact.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Format last seen
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never online';

    const date = timestamp.toDate();
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  };

  // Helper function to get user display name
  const getUserDisplayName = (user) => {
    return user.name || user.email.split('@')[0];
  };

  // Helper function to get user profile picture
  const getUserProfilePic = (user) => {
    return user.profilePic || defaultAvatar;
  };

  // Render media content
  const renderMedia = (mediaUrl, mediaType) => {
    if (!mediaUrl) return null;

    if (mediaType === 'image') {
      return (
        <img 
          src={mediaUrl} 
          alt="Media" 
          className="rounded-lg max-w-full max-h-60 object-contain mb-2"
        />
      );
    } else if (mediaType === 'video') {
      return (
        <video 
          src={mediaUrl} 
          controls 
          className="rounded-lg max-w-full max-h-60 object-contain mb-2"
        />
      );
    }
    
    return <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">View attachment</a>;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-2 rounded-md border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-gray-700">
            <h2 className="font-bold text-lg mb-2 text-gray-200">Contacts</h2>
            {filteredContacts().length > 0 ? (
              filteredContacts().map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center p-2 rounded-md mb-2 cursor-pointer hover:bg-gray-700 ${selectedChat?.user.id === contact.id ? 'bg-gray-700' : ''}`}
                  onClick={() => startChat(contact)}
                >
                  <div className="relative">
                    <img
                      src={getUserProfilePic(contact)}
                      alt={contact.email}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${contact.isOnline ? 'bg-green-500' : 'bg-red-500'} border-2 border-gray-800`}></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-200">{getUserDisplayName(contact)}</p>
                      {unreadMessages[contact.id] > 0 && (
                        <span className="bg-blue-600 text-white rounded-full px-2 py-1 text-xs">
                          {unreadMessages[contact.id]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      {contact.isOnline ? 'Online' : `Last seen: ${formatLastSeen(contact.lastSeen)}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No contacts found</p>
                <p className="text-sm mt-2">Follow users to start chatting</p>
              </div>
            )}
          </div>

          {/* You Might Know */}
          <div className="p-4">
            <h2 className="font-bold text-lg mb-2 text-gray-200">You Might Know</h2>
            {suggestedUsers.length > 0 ? (
              suggestedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center p-2 rounded-md mb-2 cursor-pointer hover:bg-gray-700"
                  onClick={() => startChat(user)}
                >
                  <div className="relative">
                    <img
                      src={getUserProfilePic(user)}
                      alt={user.email}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-red-500'} border-2 border-gray-800`}></div>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-200">{getUserDisplayName(user)}</p>
                    <p className="text-sm text-gray-400">
                      {user.isOnline ? 'Online' : `Last seen: ${formatLastSeen(user.lastSeen)}`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No suggestions available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center">
              <div className="relative">
                <img
                  src={getUserProfilePic(selectedChat.user)}
                  alt={selectedChat.user.email}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${selectedChat.user.isOnline ? 'bg-green-500' : 'bg-red-500'} border-2 border-gray-800`}></div>
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-200">{getUserDisplayName(selectedChat.user)}</p>
                <p className="text-xs text-gray-400">
                  {selectedChat.user.isOnline ? 'Online' : `Last seen: ${formatLastSeen(selectedChat.user.lastSeen)}`}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-4 max-w-xs rounded-lg p-3 ${msg.senderId === user.uid ? 'ml-auto bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}
                  >
                    {msg.mediaUrl && renderMedia(msg.mediaUrl, msg.mediaType)}
                    {msg.message && <p>{msg.message}</p>}
                    <p className={`text-xs mt-1 ${msg.senderId === user.uid ? 'text-blue-200' : 'text-gray-400'}`}>
                      {msg.timestamp ? formatTime(msg.timestamp) : 'Sending...'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Media preview */}
            {mediaFile && (
              <div className="bg-gray-800 p-2 border-t border-gray-700">
                <div className="flex items-center">
                  <div className="flex-1 flex">
                    <div className="bg-gray-700 rounded-md p-2 flex items-center">
                      <span className="text-sm text-gray-300 truncate max-w-xs">
                        {mediaFile.name}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="ml-2 text-red-500 hover:text-red-400 focus:outline-none" 
                    onClick={clearMedia}
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="bg-gray-800 p-4 border-t border-gray-700">
              <form onSubmit={sendMessage} className="flex flex-col">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 p-2 rounded-l-md border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isUploading}
                  />
                  <div className="relative">
                    <button
                      type="button"
                      className="bg-gray-700 text-gray-300 px-3 py-2 border border-gray-600 border-l-0 hover:bg-gray-600 focus:outline-none"
                      onClick={() => fileInputRef.current.click()}
                      disabled={isUploading}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                      </svg>
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*,video/*" 
                      className="hidden"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    disabled={isUploading || (!newMessage.trim() && !mediaFile)}
                  >
                    {isUploading ? 'Uploading...' : 'Send'}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-400">
              <h2 className="text-2xl font-bold mb-2">Select a conversation</h2>
              <p>Choose a contact from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatApp;