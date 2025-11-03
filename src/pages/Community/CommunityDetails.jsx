// import React, { useState, useEffect } from "react";
// import { Users, ArrowLeft, MessageCircle, Info, Calendar, Award, ChevronRight, Plus, X } from "lucide-react";
// import { db, auth } from "../../config/firebase";
// import { 
//   doc, 
//   getDoc, 
//   updateDoc, 
//   arrayUnion, 
//   arrayRemove,
//   collection, 
//   query, 
//   where, 
//   getDocs, 
//   orderBy,
//   addDoc,
//   serverTimestamp
// } from "firebase/firestore";

// const CommunityDetails = ({ community, onBack }) => {
//   const [activeTab, setActiveTab] = useState("about");
//   const [posts, setPosts] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isJoining, setIsJoining] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isMember, setIsMember] = useState(false);
//   const [isOwner, setIsOwner] = useState(false);
  
//   // New state for post creation
//   const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
//   const [postContent, setPostContent] = useState("");
//   const [postImage, setPostImage] = useState(null);
//   const [isPostingInProgress, setIsPostingInProgress] = useState(false);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setCurrentUser(user);
//         // Check if user is a member of this community
//         setIsMember(community.members && community.members.includes(user.uid));
        
//         // Check if user is the community owner
//         setIsOwner(community.createdBy === user.uid);
//       }
//     });
    
//     return () => unsubscribe();
//   }, [community.members, community.createdBy]);

//   useEffect(() => {
//     // Fetch posts for this community if user is a member
//     const fetchPosts = async () => {
//       if (!isMember || activeTab !== "posts") return;
      
//       try {
//         setIsLoading(true);
//         const postsRef = collection(db, "Posts");
//         const q = query(
//           postsRef, 
//           where("communityId", "==", community.id),
//           orderBy("timestamp", "desc")
//         );
        
//         const querySnapshot = await getDocs(q);
//         const fetchedPosts = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
        
//         setPosts(fetchedPosts);
//       } catch (error) {
//         console.error("Error fetching posts:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchPosts();
//   }, [community.id, activeTab, isMember]);

//   const handleJoinCommunity = async () => {
//     if (!currentUser) return;
    
//     try {
//       setIsJoining(true);
//       const communityRef = doc(db, "Communities", community.id);
      
//       if (isMember) {
//         // Leave community
//         await updateDoc(communityRef, {
//           members: arrayRemove(currentUser.uid)
//         });
//         setIsMember(false);
//       } else {
//         // Join community
//         await updateDoc(communityRef, {
//           members: arrayUnion(currentUser.uid)
//         });
//         setIsMember(true);
//       }
//     } catch (error) {
//       console.error("Error updating membership:", error);
//     } finally {
//       setIsJoining(false);
//     }
//   };

//   const handleCreatePost = async () => {
//     if (!currentUser || !isOwner || !postContent.trim()) return;

//     try {
//       setIsPostingInProgress(true);
//       const newPost = {
//         communityId: community.id,
//         content: postContent.trim(),
//         authorId: currentUser.uid,
//         authorName: currentUser.displayName || "Community Owner",
//         authorPhoto: currentUser.photoURL || null,
//         timestamp: serverTimestamp(),
//         image: postImage, // Optional: handle image upload separately
//         likesCount: 0,
//         commentsCount: 0
//       };

//       // Add post to Firestore
//       const docRef = await addDoc(collection(db, "Posts"), newPost);

//       // Reset state and close modal
//       setPostContent("");
//       setPostImage(null);
//       setIsCreatePostModalOpen(false);

//       // Add the new post to local state
//       setPosts(prevPosts => [
//         { ...newPost, id: docRef.id },
//         ...prevPosts
//       ]);

//     } catch (error) {
//       console.error("Error creating post:", error);
//     } finally {
//       setIsPostingInProgress(false);
//     }
//   };

//   const formatDate = (timestamp) => {
//     if (!timestamp) return "Unknown date";
    
//     try {
//       const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//       return date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric"
//       });
//     } catch (error) {
//       return "Unknown date";
//     }
//   };

//   const CreatePostModal = () => (
//     <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
//       <div className="bg-[#222] rounded-xl w-full max-w-lg">
//         <div className="flex justify-between items-center p-4 border-b border-gray-700">
//           <h2 className="text-xl font-bold">Create Post</h2>
//           <button 
//             onClick={() => setIsCreatePostModalOpen(false)}
//             className="text-gray-400 hover:text-white"
//           >
//             <X size={24} />
//           </button>
//         </div>
        
//         <div className="p-4">
//           <textarea 
//             value={postContent}
//             onChange={(e) => setPostContent(e.target.value)}
//             placeholder="Write your post..."
//             className="w-full bg-[#111] rounded-lg p-3 text-white border border-gray-700 min-h-[150px]"
//           />
          
//           {/* Optional: Image upload functionality can be added here */}
          
//           <button 
//             onClick={handleCreatePost}
//             disabled={!postContent.trim() || isPostingInProgress}
//             className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg disabled:opacity-50"
//           >
//             {isPostingInProgress ? "Posting..." : "Post"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   const renderPostItem = (post) => (
//     <div key={post.id} className="bg-[#252525] rounded-lg p-4 mb-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-all">
//       <div className="flex items-start gap-3">
//         <img 
//           src={post.authorPhoto || "/api/placeholder/40/40"} 
//           alt="Author" 
//           className="w-10 h-10 rounded-full"
//           onError={(e) => {
//             e.target.onerror = null;
//             e.target.src = "/api/placeholder/40/40";
//           }}
//         />
//         <div className="flex-1">
//           <div className="flex justify-between items-start">
//             <h3 className="font-medium text-white">{post.authorName || "Anonymous"}</h3>
//             <span className="text-xs text-gray-400">{formatDate(post.timestamp)}</span>
//           </div>
//           <p className="mt-2 text-gray-300">{post.content}</p>
          
//           {post.image && (
//             <div className="mt-3">
//               <img 
//                 src={post.image} 
//                 alt="Post image" 
//                 className="rounded-lg max-h-64 w-auto"
//                 onError={(e) => {
//                   e.target.onerror = null;
//                   e.target.src = "/api/placeholder/300/200";
//                 }}
//               />
//             </div>
//           )}
          
//           <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
//             <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
//               <MessageCircle size={16} />
//               <span>{post.commentsCount || 0}</span>
//             </button>
//             <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
//               <Award size={16} />
//               <span>{post.likesCount || 0}</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="bg-black text-white min-h-screen">
//       {/* Header with background image */}
//       <div 
//         className="h-48 bg-cover bg-center relative"
//         style={{
//           backgroundImage: `url(${community.image || "/api/placeholder/1200/400"})`,
//           backgroundPosition: 'center'
//         }}
//       >
//         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
        
//         {/* Back button */}
//         <button 
//           onClick={onBack}
//           className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white backdrop-blur-sm transition-all"
//         >
//           <ArrowLeft size={24} />
//         </button>
        
//         {/* Community info on top of image */}
//         <div className="absolute bottom-4 left-6 right-6">
//           <div className="flex justify-between items-end">
//             <div>
//               <h1 className="text-2xl font-bold text-white">{community.name}</h1>
//               <p className="text-gray-300">{community.tagline}</p>
//               <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
//                 <Users size={14} />
//                 <span>{community.membersCount?.toLocaleString() || 0} members</span>
//               </div>
//             </div>
            
//             <button 
//               onClick={handleJoinCommunity}
//               disabled={isJoining}
//               className={`px-5 py-2 rounded-full text-white font-medium transition-all ${
//                 isMember 
//                   ? "bg-gray-600 hover:bg-gray-700" 
//                   : "bg-purple-600 hover:bg-purple-700"
//               }`}
//             >
//               {isJoining 
//                 ? "Processing..." 
//                 : isMember 
//                   ? "Leave Community" 
//                   : "Join Community"
//               }
//             </button>
//           </div>
//         </div>
//       </div>
      
//       {/* Tabs */}
//       <div className="border-b border-gray-800">
//         <div className="container mx-auto px-4">
//           <div className="flex">
//             <button 
//               onClick={() => setActiveTab("about")}
//               className={`py-4 px-6 font-medium transition-all relative ${
//                 activeTab === "about" 
//                   ? "text-purple-400" 
//                   : "text-gray-400 hover:text-gray-300"
//               }`}
//             >
//               About Community
//               {activeTab === "about" && (
//                 <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
//               )}
//             </button>
//             <button 
//               onClick={() => setActiveTab("posts")}
//               className={`py-4 px-6 font-medium transition-all relative ${
//                 activeTab === "posts" 
//                   ? "text-purple-400" 
//                   : "text-gray-400 hover:text-gray-300"
//               }`}
//             >
//               Journey So Far
//               {activeTab === "posts" && (
//                 <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
      
//       {/* Tab content */}
//       <div className="container mx-auto px-4 py-6">
//         {activeTab === "about" ? (
//           <div className="bg-[#111] rounded-xl p-6 shadow-xl border border-gray-800">
//             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//               <Info size={18} className="text-purple-400" />
//               About {community.name}
//             </h2>
            
//             <p className="text-gray-300 mb-6 leading-relaxed">
//               {community.description || "No description provided."}
//             </p>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="bg-[#222] rounded-lg p-4 border border-gray-700">
//                 <h3 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
//                   <Users size={16} className="text-purple-400" />
//                   Community Stats
//                 </h3>
//                 <div className="space-y-2 text-gray-300">
//                   <div className="flex items-center justify-between">
//                     <span>Members:</span>
//                     <span className="font-medium">{community.membersCount?.toLocaleString() || 0}</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span>Category:</span>
//                     <span className="font-medium">{community.category || "General"}</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span>Created:</span>
//                     <span className="font-medium">{formatDate(community.timestamp)}</span>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="bg-[#222] rounded-lg p-4 border border-gray-700">
//                 <h3 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
//                   <Calendar size={16} className="text-purple-400" />
//                   Recent Activity
//                 </h3>
//                 <div className="space-y-3 text-gray-300">
//                   {[1, 2, 3].map((_, index) => (
//                     <div key={index} className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 rounded-full bg-purple-500"></div>
//                         <span>New posts this week</span>
//                       </div>
//                       <span className="font-medium">{Math.floor(Math.random() * 20) + 5}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
            
//             <div className="mt-8">
//               <h3 className="text-lg font-medium mb-4 text-white flex items-center gap-2">
//                 <Award size={16} className="text-yellow-500" />
//                 Community Guidelines
//               </h3>
//               <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-gray-800">
//                 <ul className="space-y-2 text-gray-300">
//                   <li className="flex items-start gap-2">
//                     <ChevronRight size={16} className="text-purple-400 mt-1 flex-shrink-0" />
//                     <span>Be respectful and supportive of other community members.</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <ChevronRight size={16} className="text-purple-400 mt-1 flex-shrink-0" />
//                     <span>Share relevant content that contributes to our community focus.</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <ChevronRight size={16} className="text-purple-400 mt-1 flex-shrink-0" />
//                     <span>Engage constructively in discussions and provide helpful feedback.</span>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div>
//             {!isMember ? (
//               <div className="bg-[#111] rounded-xl p-8 shadow-xl border border-gray-800 text-center">
//                 <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center">
//                   <Users size={28} className="text-purple-400" />
//                 </div>
//                 <h3 className="text-xl font-bold mb-2 text-white">Please Join Community First</h3>
//                 <p className="text-gray-400 mb-6 max-w-md mx-auto">
//                   You need to be a member of this community to view and interact with posts.
//                 </p>
//                 <button 
//                   onClick={handleJoinCommunity}
//                   className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-lg text-white font-medium transition-all"
//                 >
//                   Join Community
//                 </button>
//               </div>
//             ) : (
//               <div>
//                 {/* Create Post Button for Community Owner */}
//                 {isOwner && (
//                   <div className="mb-6">
//                     <button 
//                       onClick={() => setIsCreatePostModalOpen(true)}
//                       className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2"
//                     >
//                       <Plus size={20} />
//                       Create Post
//                     </button>
//                   </div>
//                 )}

//                 {isLoading ? (
//                   <div className="flex justify-center items-center h-40">
//                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//                   </div>
//                 ) : posts.length > 0 ? (
//                   <div className="space-y-4">
//                     {posts.map(post => renderPostItem(post))}
//                   </div>
//                 ) : (
//                   <div className="bg-[#111] rounded-xl p-8 shadow-xl border border-gray-800 text-center">
//                     <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center">
//                       <MessageCircle size={28} className="text-purple-400" />
//                     </div>
//                     <h3 className="text-xl font-bold mb-2 text-white">
//                       {isOwner 
//                         ? "Be the first to post in this community!" 
//                         : "No Posts Yet"
//                       }
//                     </h3>
//                     <p className="text-gray-400 mb-6 max-w-md mx-auto">
//                       {isOwner 
//                         ? "Click 'Create Post' to start the conversation." 
//                         : "The community owner hasn't created any posts yet."
//                       }
//                     </p>
//                     {isOwner && (
//                       <button 
//                         onClick={() => setIsCreatePostModalOpen(true)}
//                         className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-lg text-white font-medium transition-all"
//                       >
//                         Create Post
//                       </button>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Create Post Modal */}
//       {isCreatePostModalOpen && <CreatePostModal />}
//     </div>
//   );
// };

// export default CommunityDetails;



// import React, { useState, useEffect } from "react";
// import { 
//   Users, 
//   ArrowLeft, 
//   MessageCircle, 
//   Info, 
//   Calendar, 
//   Award, 
//   ChevronRight, 
//   Plus, 
//   X 
// } from "lucide-react";
// import { db, auth } from "../../config/firebase";
// import { 
//   doc, 
//   getDoc, 
//   updateDoc, 
//   arrayUnion, 
//   arrayRemove,
//   collection, 
//   query, 
//   where, 
//   getDocs, 
//   orderBy,
//   addDoc,
//   serverTimestamp
// } from "firebase/firestore";

// const CommunityDetails = ({ community, onBack }) => {
//   // State management
//   const [activeTab, setActiveTab] = useState("about");
//   const [posts, setPosts] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isJoining, setIsJoining] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isMember, setIsMember] = useState(false);
//   const [isOwner, setIsOwner] = useState(false);
  
//   // Post creation states
//   const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
//   const [postContent, setPostContent] = useState("");
//   const [isPostingInProgress, setIsPostingInProgress] = useState(false);

//   // Authentication and membership tracking
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setCurrentUser(user);
//         // Check if user is a member of this community
//         setIsMember(community.members && community.members.includes(user.uid));
        
//         // Check if user is the community owner
//         setIsOwner(community.createdBy === user.uid);
//       }
//     });
    
//     return () => unsubscribe();
//   }, [community.members, community.createdBy]);

//   // Fetch posts when tab and membership change
//   useEffect(() => {
//     const fetchPosts = async () => {
//       if (!isMember || activeTab !== "posts") return;
      
//       try {
//         setIsLoading(true);
//         const postsRef = collection(db, "Communities", community.id, "Posts");
//         const q = query(postsRef, orderBy("timestamp", "desc"));
        
//         const querySnapshot = await getDocs(q);
//         const fetchedPosts = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
        
//         setPosts(fetchedPosts);
//       } catch (error) {
//         console.error("Error fetching posts:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchPosts();
//   }, [community.id, activeTab, isMember]);

//   // Join/Leave community handler
//   const handleJoinCommunity = async () => {
//     if (!currentUser) return;
    
//     try {
//       setIsJoining(true);
//       const communityRef = doc(db, "Communities", community.id);
      
//       if (isMember) {
//         // Leave community
//         await updateDoc(communityRef, {
//           members: arrayRemove(currentUser.uid)
//         });
//         setIsMember(false);
//       } else {
//         // Join community
//         await updateDoc(communityRef, {
//           members: arrayUnion(currentUser.uid)
//         });
//         setIsMember(true);
//       }
//     } catch (error) {
//       console.error("Error updating membership:", error);
//     } finally {
//       setIsJoining(false);
//     }
//   };

//   // Create post handler
//   const handleCreatePost = async () => {
//     if (!currentUser || !isOwner || !postContent.trim()) return;

//     try {
//       setIsPostingInProgress(true);
//       const postsRef = collection(db, "Communities", community.id, "Posts");
      
//       const newPost = {
//         content: postContent.trim(),
//         authorId: currentUser.uid,
//         authorName: currentUser.displayName || "Community Owner",
//         authorPhoto: currentUser.photoURL || null,
//         timestamp: serverTimestamp(),
//         likesCount: 0,
//         commentsCount: 0
//       };

//       // Add post to Firestore
//       const docRef = await addDoc(postsRef, newPost);

//       // Reset state and close modal
//       setPostContent("");
//       setIsCreatePostModalOpen(false);

//       // Add the new post to local state
//       setPosts(prevPosts => [
//         { ...newPost, id: docRef.id, timestamp: new Date() },
//         ...prevPosts
//       ]);

//     } catch (error) {
//       console.error("Error creating post:", error);
//     } finally {
//       setIsPostingInProgress(false);
//     }
//   };

//   // Date formatting utility
//   const formatDate = (timestamp) => {
//     if (!timestamp) return "Unknown date";
    
//     try {
//       const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//       return date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric"
//       });
//     } catch (error) {
//       return "Unknown date";
//     }
//   };

//   // Create Post Modal Component
//   const CreatePostModal = () => (
//     <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
//       <div className="bg-[#222] rounded-xl w-full max-w-lg">
//         <div className="flex justify-between items-center p-4 border-b border-gray-700">
//           <h2 className="text-xl font-bold">Create Post</h2>
//           <button 
//             onClick={() => setIsCreatePostModalOpen(false)}
//             className="text-gray-400 hover:text-white"
//           >
//             <X size={24} />
//           </button>
//         </div>
        
//         <div className="p-4">
//           <textarea 
//             value={postContent}
//             onChange={(e) => setPostContent(e.target.value)}
//             placeholder="Write your post..."
//             className="w-full bg-[#111] rounded-lg p-3 text-white border border-gray-700 min-h-[150px]"
//           />
          
//           <button 
//             onClick={handleCreatePost}
//             disabled={!postContent.trim() || isPostingInProgress}
//             className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg disabled:opacity-50"
//           >
//             {isPostingInProgress ? "Posting..." : "Post"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   // Post item rendering
//   const renderPostItem = (post) => (
//     <div key={post.id} className="bg-[#252525] rounded-lg p-4 mb-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-all">
//       <div className="flex items-start gap-3">
//         <img 
//           src={"/Mellow_Icon.jpeg"} 
//           alt="Author" 
//           className="w-10 h-10 rounded-full"
//           onError={(e) => {
//             e.target.onerror = null;
//             e.target.src = "/api/placeholder/40/40";
//           }}
//         />
//         <div className="flex-1">
//           <div className="flex justify-between items-start">
//             <h3 className="font-medium text-white">{post.authorName || "Anonymous"}</h3>
//             <span className="text-xs text-gray-400">{formatDate(post.timestamp)}</span>
//           </div>
//           <p className="mt-2 text-gray-300">{post.content}</p>
          
//           <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
//             <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
//               <MessageCircle size={16} />
//               <span>{post.commentsCount || 0}</span>
//             </button>
//             <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
//               <Award size={16} />
//               <span>{post.likesCount || 0}</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="bg-black text-white min-h-screen">
//       {/* Header with background image */}
//       <div 
//         className="h-48 bg-cover bg-center relative"
//         style={{
//           backgroundImage: `url(${community.image || "/api/placeholder/1200/400"})`,
//           backgroundPosition: 'center'
//         }}
//       >
//         <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
        
//         {/* Back button */}
//         <button 
//           onClick={onBack}
//           className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white backdrop-blur-sm transition-all"
//         >
//           <ArrowLeft size={24} />
//         </button>
        
//         {/* Community info on top of image */}
//         <div className="absolute bottom-4 left-6 right-6">
//           <div className="flex justify-between items-end">
//             <div>
//               <h1 className="text-2xl font-bold text-white">{community.name}</h1>
//               <p className="text-gray-300">{community.tagline}</p>
//               <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
//                 <Users size={14} />
//                 <span>{community.membersCount?.toLocaleString() || 0} members</span>
//               </div>
//             </div>
            
//             <button 
//               onClick={handleJoinCommunity}
//               disabled={isJoining}
//               className={`px-5 py-2 rounded-full text-white font-medium transition-all ${
//                 isMember 
//                   ? "bg-gray-600 hover:bg-gray-700" 
//                   : "bg-purple-600 hover:bg-purple-700"
//               }`}
//             >
//               {isJoining 
//                 ? "Processing..." 
//                 : isMember 
//                   ? "Leave Community" 
//                   : "Join Community"
//               }
//             </button>
//           </div>
//         </div>
//       </div>
      
//       {/* Tabs */}
//       <div className="border-b border-gray-800">
//         <div className="container mx-auto px-4">
//           <div className="flex">
//             <button 
//               onClick={() => setActiveTab("about")}
//               className={`py-4 px-6 font-medium transition-all relative ${
//                 activeTab === "about" 
//                   ? "text-purple-400" 
//                   : "text-gray-400 hover:text-gray-300"
//               }`}
//             >
//               About Community
//               {activeTab === "about" && (
//                 <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
//               )}
//             </button>
//             <button 
//               onClick={() => setActiveTab("posts")}
//               className={`py-4 px-6 font-medium transition-all relative ${
//                 activeTab === "posts" 
//                   ? "text-purple-400" 
//                   : "text-gray-400 hover:text-gray-300"
//               }`}
//             >
//               Journey So Far
//               {activeTab === "posts" && (
//                 <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
      
//       {/* Tab content */}
//       <div className="container mx-auto px-4 py-6">
//         {activeTab === "about" ? (
//           <div className="bg-[#111] rounded-xl p-6 shadow-xl border border-gray-800">
//             <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
//               <Info size={18} className="text-purple-400" />
//               About {community.name}
//             </h2>
            
//             <p className="text-gray-300 mb-6 leading-relaxed">
//               {community.description || "No description provided."}
//             </p>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="bg-[#222] rounded-lg p-4 border border-gray-700">
//                 <h3 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
//                   <Users size={16} className="text-purple-400" />
//                   Community Stats
//                 </h3>
//                 <div className="space-y-2 text-gray-300">
//                   <div className="flex items-center justify-between">
//                     <span>Members:</span>
//                     <span className="font-medium">{community.membersCount?.toLocaleString() || 0}</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span>Category:</span>
//                     <span className="font-medium">{community.category || "General"}</span>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span>Created:</span>
//                     <span className="font-medium">{formatDate(community.timestamp)}</span>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="bg-[#222] rounded-lg p-4 border border-gray-700">
//                 <h3 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
//                   <Calendar size={16} className="text-purple-400" />
//                   Recent Activity
//                 </h3>
//                 <div className="space-y-3 text-gray-300">
//                   {[1, 2, 3].map((_, index) => (
//                     <div key={index} className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 rounded-full bg-purple-500"></div>
//                         <span>New posts this week</span>
//                       </div>
//                       <span className="font-medium">{Math.floor(Math.random() * 20) + 5}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
            
//             <div className="mt-8">
//               <h3 className="text-lg font-medium mb-4 text-white flex items-center gap-2">
//                 <Award size={16} className="text-yellow-500" />
//                 Community Guidelines
//               </h3>
//               <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-gray-800">
//                 <ul className="space-y-2 text-gray-300">
//                   <li className="flex items-start gap-2">
//                     <ChevronRight size={16} className="text-purple-400 mt-1 flex-shrink-0" />
//                     <span>Be respectful and supportive of other community members.</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <ChevronRight size={16} className="text-purple-400 mt-1 flex-shrink-0" />
//                     <span>Share relevant content that contributes to our community focus.</span>
//                   </li>
//                   <li className="flex items-start gap-2">
//                     <ChevronRight size={16} className="text-purple-400 mt-1 flex-shrink-0" />
//                     <span>Engage constructively in discussions and provide helpful feedback.</span>
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div>
//             {!isMember ? (
//               <div className="bg-[#111] rounded-xl p-8 shadow-xl border border-gray-800 text-center">
//                 <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center">
//                   <Users size={28} className="text-purple-400" />
//                 </div>
//                 <h3 className="text-xl font-bold mb-2 text-white">Please Join Community First</h3>
//                 <p className="text-gray-400 mb-6 max-w-md mx-auto">
//                   You need to be a member of this community to view and interact with posts.
//                 </p>
//                 <button 
//                   onClick={handleJoinCommunity}
//                   className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-lg text-white font-medium transition-all"
//                 >
//                   Join Community
//                 </button>
//               </div>
//             ) : (
//               <div>
//                 {/* Create Post Button for Community Owner */}
//                 {isOwner && (
//                   <div className="mb-6">
//                     <button 
//                       onClick={() => setIsCreatePostModalOpen(true)}
//                       className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2"
//                     >
//                       <Plus size={20} />
//                       Create Post
//                     </button>
//                   </div>
//                 )}

//                 {isLoading ? (
//                   <div className="flex justify-center items-center h-40">
//                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
//                   </div>
//                 ) : posts.length > 0 ? (
//                   <div className="space-y-4">
//                     {posts.map(post => renderPostItem(post))}
//                   </div>
//                 ) : (
//                   <div className="bg-[#111] rounded-xl p-8 shadow-xl border border-gray-800 text-center">
//                     <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center">
//                       <MessageCircle size={28} className="text-purple-400" />
//                     </div>
//                     <h3 className="text-xl font-bold mb-2 text-white">
//                       {isOwner 
//                         ? "Be the first to post in this community!" 
//                         : "No Posts Yet"
//                       }
//                     </h3>
//                     <p className="text-gray-400 mb-6 max-w-md mx-auto">
//                       {isOwner 
//                         ? "Click 'Create Post' to start the conversation." 
//                         : "The community owner hasn't created any posts yet."
//                       }
//                     </p>
//                     {isOwner && (
//                       <button 
//                         onClick={() => setIsCreatePostModalOpen(true)}
//                         className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-lg text-white font-medium transition-all"
//                       >
//                         Create Post
//                       </button>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Create Post Modal */}
//       {isCreatePostModalOpen && <CreatePostModal />}
//     </div>
//   );
// };

// export default CommunityDetails;



// import React, { useState, useEffect, useRef } from "react";
// import { 
//   Users, 
//   ArrowLeft, 
//   MessageCircle, 
//   Info, 
//   Calendar, 
//   Award, 
//   ChevronRight, 
//   Plus, 
//   X 
// } from "lucide-react";
// import { db, auth } from "../../config/firebase";
// import { 
//   doc, 
//   getDoc, 
//   updateDoc, 
//   arrayUnion, 
//   arrayRemove,
//   collection, 
//   query, 
//   where, 
//   getDocs, 
//   orderBy,
//   addDoc,
//   serverTimestamp
// } from "firebase/firestore";

// const CommunityDetails = ({ community, onBack }) => {
//   // State management
//   const [activeTab, setActiveTab] = useState("about");
//   const [posts, setPosts] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isJoining, setIsJoining] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isMember, setIsMember] = useState(false);
//   const [isOwner, setIsOwner] = useState(false);
  
//   // Post creation states
//   const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
//   const [postContent, setPostContent] = useState("");
//   const [isPostingInProgress, setIsPostingInProgress] = useState(false);

//   // Textarea ref for focus management
//   const postTextareaRef = useRef(null);

//   // Authentication and membership tracking
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setCurrentUser(user);
//         // Check if user is a member of this community
//         setIsMember(community.members && community.members.includes(user.uid));
        
//         // Check if user is the community owner
//         setIsOwner(community.createdBy === user.uid);
//       }
//     });
    
//     return () => unsubscribe();
//   }, [community.members, community.createdBy]);

//   // Fetch posts when tab and membership change
//   useEffect(() => {
//     const fetchPosts = async () => {
//       if (!isMember || activeTab !== "posts") return;
      
//       try {
//         setIsLoading(true);
//         const postsRef = collection(db, "Communities", community.id, "Posts");
//         const q = query(postsRef, orderBy("timestamp", "desc"));
        
//         const querySnapshot = await getDocs(q);
//         const fetchedPosts = querySnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         }));
        
//         setPosts(fetchedPosts);
//       } catch (error) {
//         console.error("Error fetching posts:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchPosts();
//   }, [community.id, activeTab, isMember]);

//   // Join/Leave community handler
//   const handleJoinCommunity = async () => {
//     if (!currentUser) return;
    
//     try {
//       setIsJoining(true);
//       const communityRef = doc(db, "Communities", community.id);
      
//       if (isMember) {
//         // Leave community
//         await updateDoc(communityRef, {
//           members: arrayRemove(currentUser.uid)
//         });
//         setIsMember(false);
//       } else {
//         // Join community
//         await updateDoc(communityRef, {
//           members: arrayUnion(currentUser.uid)
//         });
//         setIsMember(true);
//       }
//     } catch (error) {
//       console.error("Error updating membership:", error);
//     } finally {
//       setIsJoining(false);
//     }
//   };

//   // Create post handler
//   const handleCreatePost = async () => {
//     if (!currentUser || !isOwner || !postContent.trim()) return;

//     try {
//       setIsPostingInProgress(true);
//       const postsRef = collection(db, "Communities", community.id, "Posts");
      
//       const newPost = {
//         content: postContent.trim(),
//         authorId: currentUser.uid,
//         authorName: currentUser.displayName || "Community Owner",
//         authorPhoto: currentUser.photoURL || null,
//         timestamp: serverTimestamp(),
//         likesCount: 0,
//         commentsCount: 0
//       };

//       // Add post to Firestore
//       const docRef = await addDoc(postsRef, newPost);

//       // Reset state and close modal
//       setPostContent("");
//       setIsCreatePostModalOpen(false);

//       // Add the new post to local state
//       setPosts(prevPosts => [
//         { ...newPost, id: docRef.id, timestamp: new Date() },
//         ...prevPosts
//       ]);

//     } catch (error) {
//       console.error("Error creating post:", error);
//     } finally {
//       setIsPostingInProgress(false);
//     }
//   };

//   // Date formatting utility
//   const formatDate = (timestamp) => {
//     if (!timestamp) return "Unknown date";
    
//     try {
//       const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//       return date.toLocaleDateString("en-US", {
//         month: "short",
//         day: "numeric",
//         year: "numeric"
//       });
//     } catch (error) {
//       return "Unknown date";
//     }
//   };

//   // Create Post Modal Component
//   const CreatePostModal = () => {
//     // Use useEffect to focus the textarea when modal opens
//     useEffect(() => {
//       if (postTextareaRef.current) {
//         postTextareaRef.current.focus();
//       }
//     }, []);

//     return (
//       <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
//         <div className="bg-[#222] rounded-xl w-full max-w-lg">
//           <div className="flex justify-between items-center p-4 border-b border-gray-700">
//             <h2 className="text-xl font-bold">Create Post</h2>
//             <button 
//               onClick={() => setIsCreatePostModalOpen(false)}
//               className="text-gray-400 hover:text-white"
//             >
//               <X size={24} />
//             </button>
//           </div>
          
//           <div className="p-4">
//             <textarea 
//               ref={postTextareaRef}
//               value={postContent}
//               onChange={(e) => setPostContent(e.target.value)}
//               placeholder="Write your post..."
//               className="w-full bg-[#111] rounded-lg p-3 text-white border border-gray-700 min-h-[150px]"
//             />
            
//             <button 
//               onClick={handleCreatePost}
//               disabled={!postContent.trim() || isPostingInProgress}
//               className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg disabled:opacity-50"
//             >
//               {isPostingInProgress ? "Posting..." : "Post"}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };




import React, { useState, useEffect, useRef } from "react";
import { 
  Users, 
  ArrowLeft, 
  MessageCircle, 
  Info, 
  Calendar, 
  Award, 
  ChevronRight, 
  Plus, 
  X 
} from "lucide-react";
import { db, auth } from "../../config/firebase";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

const CommunityDetails = ({ community, onBack }) => {
  // State management
  const [activeTab, setActiveTab] = useState("about");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // Post creation states
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isPostingInProgress, setIsPostingInProgress] = useState(false);

  // Text input ref for focus management
  const postInputRef = useRef(null);

  // Authentication and membership tracking
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        // Check if user is a member of this community
        setIsMember(community.members && community.members.includes(user.uid));
        
        // Check if user is the community owner
        setIsOwner(community.createdBy === user.uid);
      }
    });
    
    return () => unsubscribe();
  }, [community.members, community.createdBy]);

  // Fetch posts when tab and membership change
  useEffect(() => {
    const fetchPosts = async () => {
      if (!isMember || activeTab !== "posts") return;
      
      try {
        setIsLoading(true);
        const postsRef = collection(db, "Communities", community.id, "Posts");
        const q = query(postsRef, orderBy("timestamp", "desc"));
        
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [community.id, activeTab, isMember]);

  // Join/Leave community handler
  const handleJoinCommunity = async () => {
    if (!currentUser) return;
    
    try {
      setIsJoining(true);
      const communityRef = doc(db, "Communities", community.id);
      
      if (isMember) {
        // Leave community
        await updateDoc(communityRef, {
          members: arrayRemove(currentUser.uid)
        });
        setIsMember(false);
      } else {
        // Join community
        await updateDoc(communityRef, {
          members: arrayUnion(currentUser.uid)
        });
        setIsMember(true);
      }
    } catch (error) {
      console.error("Error updating membership:", error);
    } finally {
      setIsJoining(false);
    }
  };

  // Create post handler
  const handleCreatePost = async () => {
    if (!currentUser || !isOwner || !postContent.trim()) return;

    try {
      setIsPostingInProgress(true);
      const postsRef = collection(db, "Communities", community.id, "Posts");
      
      const newPost = {
        content: postContent.trim(),
        authorId: currentUser.uid,
        authorName: currentUser.displayName || "Community Owner",
        authorPhoto: currentUser.photoURL || null,
        timestamp: serverTimestamp(),
        likesCount: 0,
        commentsCount: 0
      };

      // Add post to Firestore
      const docRef = await addDoc(postsRef, newPost);

      // Reset state and close modal
      setPostContent("");
      setIsCreatePostModalOpen(false);

      // Add the new post to local state
      setPosts(prevPosts => [
        { ...newPost, id: docRef.id, timestamp: new Date() },
        ...prevPosts
      ]);

    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsPostingInProgress(false);
    }
  };

  // Date formatting utility
  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (error) {
      return "Unknown date";
    }
  };

  // Create Post Modal Component
  const CreatePostModal = () => {
    // Local ref for the input
    const localPostInputRef = useRef(null);

    // Use useEffect to focus the input when modal opens
    useEffect(() => {
      if (localPostInputRef.current) {
        localPostInputRef.current.focus();
      }
    }, []);

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-[#222] rounded-xl w-full max-w-lg">
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold">Create Post</h2>
            <button 
              onClick={() => setIsCreatePostModalOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-4">
            <input 
              ref={localPostInputRef}
              type="text"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write your post..."
              className="w-full bg-[#111] rounded-lg p-3 text-white border border-gray-700 h-12"
            />
            
            <button 
              onClick={handleCreatePost}
              disabled={!postContent.trim() || isPostingInProgress}
              className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg disabled:opacity-50"
            >
              {isPostingInProgress ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Post item rendering
  const renderPostItem = (post) => (
    <div key={post.id} className="bg-[#252525] rounded-lg p-4 mb-4 border border-gray-700 hover:border-purple-500 cursor-pointer transition-all">
      <div className="flex items-start gap-3">
        <img 
          src={"/Mellow_Icon.jpeg"} 
          alt="Author" 
          className="w-10 h-10 rounded-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/api/placeholder/40/40";
          }}
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-white">{post.authorName || "Anonymous"}</h3>
            <span className="text-xs text-gray-400">{formatDate(post.timestamp)}</span>
          </div>
          <p className="mt-2 text-gray-300">{post.content}</p>
          
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
            <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
              <MessageCircle size={16} />
              <span>{post.commentsCount || 0}</span>
            </button>
            <button className="flex items-center gap-1 hover:text-purple-400 transition-colors">
              <Award size={16} />
              <span>{post.likesCount || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header with background image */}
      <div 
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${community.image || "/api/placeholder/1200/400"})`,
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
        
        {/* Back button */}
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 bg-black/40 hover:bg-black/60 p-2 rounded-full text-white backdrop-blur-sm transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        
        {/* Community info on top of image */}
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-white">{community.name}</h1>
              <p className="text-gray-300">{community.tagline}</p>
              <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                <Users size={14} />
                <span>{community.membersCount?.toLocaleString() || 0} members</span>
              </div>
            </div>
            
            <button 
              onClick={handleJoinCommunity}
              disabled={isJoining}
              className={`px-5 py-2 rounded-full text-white font-medium transition-all ${
                isMember 
                  ? "bg-gray-600 hover:bg-gray-700" 
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isJoining 
                ? "Processing..." 
                : isMember 
                  ? "Leave Community" 
                  : "Join Community"
              }
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex">
            <button 
              onClick={() => setActiveTab("about")}
              className={`py-4 px-6 font-medium transition-all relative ${
                activeTab === "about" 
                  ? "text-purple-400" 
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              About Community
              {activeTab === "about" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("posts")}
              className={`py-4 px-6 font-medium transition-all relative ${
                activeTab === "posts" 
                  ? "text-purple-400" 
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Journey So Far
              {activeTab === "posts" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></div>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === "about" ? (
          <div className="bg-[#111] rounded-xl p-6 shadow-xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info size={18} className="text-purple-400" />
              About {community.name}
            </h2>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              {community.description || "No description provided."}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#222] rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
                  <Users size={16} className="text-purple-400" />
                  Community Stats
                </h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>Members:</span>
                    <span className="font-medium">{community.membersCount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Category:</span>
                    <span className="font-medium">{community.category || "General"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Created:</span>
                    <span className="font-medium">{formatDate(community.timestamp)}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#222] rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-medium mb-3 text-white flex items-center gap-2">
                  <Calendar size={16} className="text-purple-400" />
                  Recent Activity
                </h3>
                <div className="space-y-3 text-gray-300">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <span>New posts this week</span>
                      </div>
                      <span className="font-medium">{Math.floor(Math.random() * 20) + 5}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4 text-white flex items-center gap-2">
                <Award size={16} className="text-yellow-500" />
                Community Guidelines
              </h3>
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-gray-800">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-purple-400 mt-1 flex-shrink-0" />
                    <span>Be respectful and supportive of other community members.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-purple-400 mt-1 flex-shrink-0" />
                    <span>Share relevant content that contributes to our community focus.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-purple-400 mt-1 flex-shrink-0" />
                    <span>Engage constructively in discussions and provide helpful feedback.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {!isMember ? (
              <div className="bg-[#111] rounded-xl p-8 shadow-xl border border-gray-800 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center">
                  <Users size={28} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Please Join Community First</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  You need to be a member of this community to view and interact with posts.
                </p>
                <button 
                  onClick={handleJoinCommunity}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-lg text-white font-medium transition-all"
                >
                  Join Community
                </button>
              </div>
            ) : (
              <div>
                {/* Create Post Button for Community Owner */}
                {isOwner && (
                  <div className="mb-6">
                    <button 
                      onClick={() => setIsCreatePostModalOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-lg text-white font-medium transition-all flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Create Post
                    </button>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map(post => renderPostItem(post))}
                  </div>
                ) : (
                  <div className="bg-[#111] rounded-xl p-8 shadow-xl border border-gray-800 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-900/30 flex items-center justify-center">
                      <MessageCircle size={28} className="text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {isOwner 
                        ? "Be the first to post in this community!" 
                        : "No Posts Yet"
                      }
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      {isOwner 
                        ? "Click 'Create Post' to start the conversation." 
                        : "The community owner hasn't created any posts yet."
                      }
                    </p>
                    {isOwner && (
                      <button 
                        onClick={() => setIsCreatePostModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 px-6 py-2.5 rounded-lg text-white font-medium transition-all"
                      >
                        Create Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {isCreatePostModalOpen && <CreatePostModal />}
    </div>
  );
};

export default CommunityDetails;