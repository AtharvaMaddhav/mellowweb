import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { ArrowLeft, Calendar, Users, CheckCircle, Clock, Send } from "lucide-react";
import { ViewOtherProfile } from "../Profile/ViewOtherProfile";
import { useAuth } from "../../context/AuthContext"; // Import Auth context to check current user
import { subscribeToGoalChat, sendGoalChatMessage } from "../../services/goalChatService";
import { uploadMediaToCloudinary } from "../../services/mediaService.js";
import { profileService } from "../../services/profileService.js";
import { notificationService } from "../../services/notificationService.js";

const GoalDetails = () => {
  const [goalData, setGoalData] = useState(null);
  const [memberDetails, setMemberDetails] = useState([]);
  const [creatorDetails, setCreatorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserAvatar, setCurrentUserAvatar] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCandidates, setInviteCandidates] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [invitedIds, setInvitedIds] = useState([]);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [userNamesById, setUserNamesById] = useState({});
  const userNamesByIdRef = useRef({});
  const fileInputRef = useRef(null);
  const { goalId } = useParams(); // This is correct - extracting goalId from URL params
  const navigate = useNavigate();

  // Safely access the auth context with fallback
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    const loadCurrentUserProfile = async () => {
      if (!user?.uid) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        setCurrentUserName(user.displayName || userData.name || "Anonymous");
        setCurrentUserAvatar(user.photoURL || userData.profilePic || "/download.png");
      } catch (error) {
        console.error("Error loading current user profile:", error);
      }
    };

    loadCurrentUserProfile();
  }, [user]);

  useEffect(() => {
    const fetchGoalAndMembers = async () => {
      try {
        if (!goalId) {
          console.error("Goal ID is missing");
          setLoading(false);
          return;
        }

        // Fetch goal data
        const goalDoc = await getDoc(doc(db, "goals", goalId));

        if (!goalDoc.exists()) {
          console.error("Goal not found");
          setLoading(false);
          return;
        }

        const goal = goalDoc.data();
        setGoalData(goal);

        let creator = null;
        if (goal.userId) {
          const creatorDoc = await getDoc(doc(db, "users", goal.userId));
          if (creatorDoc.exists()) {
            creator = {
              id: goal.userId,
              ...creatorDoc.data(),
              hasCompleted: goal.completedBy?.includes(goal.userId) || false,
            };
            setCreatorDetails(creator);
          }
        }

        const membersData = [];
        if (goal.members && Array.isArray(goal.members)) {
          for (const memberId of goal.members) {
            const memberDoc = await getDoc(doc(db, "users", memberId));
            if (memberDoc.exists()) {
              membersData.push({
                id: memberId,
                ...memberDoc.data(),
                hasCompleted: goal.completedBy?.includes(memberId) || false,
              });
            }
          }
        }

        if (creator && !membersData.some((member) => member.id === creator.id)) {
          membersData.unshift(creator);
        }

        setMemberDetails(membersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchGoalAndMembers();
  }, [goalId, user]);

  useEffect(() => {
    if (!goalData) return;
    setInvitedIds(goalData.invited || []);
  }, [goalData]);

  // Subscribe to goal chat messages and resolve missing sender names
  useEffect(() => {
    if (!goalId) return;

    const resolveSenderNames = async (messages) => {
      const unresolvedIds = [
        ...new Set(
          messages
            .filter((m) => {
              const name = m.userName?.trim();
              return (
                !name ||
                ["anonymous", "anonymous user", "unknown user", "unknown"].includes(
                  name.toLowerCase()
                )
              );
            })
            .map((m) => m.userId)
            .filter(Boolean)
        ),
      ];

      const namesToResolve = unresolvedIds.filter((id) => !userNamesByIdRef.current[id]);
      const resolved = {};

      await Promise.all(
        namesToResolve.map(async (userId) => {
          try {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              resolved[userId] = userData.name || userData.displayName || userId;
            } else {
              resolved[userId] = userId;
            }
          } catch (error) {
            console.error("Error resolving chat user name:", error);
            resolved[userId] = userId;
          }
        })
      );

      if (Object.keys(resolved).length > 0) {
        userNamesByIdRef.current = { ...userNamesByIdRef.current, ...resolved };
        setUserNamesById((prev) => ({ ...prev, ...resolved }));
      }

      setChatMessages(messages);
    };

    const unsubscribe = subscribeToGoalChat(goalId, (messages) => {
      resolveSenderNames(messages);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [goalId]);

  const handleProfileClick = (userId) => {
    // Check if the clicked profile is the current user's profile
    if (user && userId === user.uid) {
      // Navigate to the user's profile page with the correct path
      navigate("/profile"); // According to your routes, profile doesn't have a parameter
    } else {
      // For other users, show the ViewOtherProfile modal
      setSelectedProfileId(userId);
    }
  };

  const handleCloseProfile = () => {
    setSelectedProfileId(null);
  };

  const loadInviteCandidates = async () => {
    if (!user || !user.uid || !goalData) return;
    setInviteError(null);
    setInviteLoading(true);

    try {
      const [followers, following] = await Promise.all([
        profileService.getFollowersDetails(user.uid),
        profileService.getFollowingDetails(user.uid),
      ]);

      const cumulative = [...followers];
      following.forEach((person) => {
        if (!cumulative.some((item) => item.uid === person.uid)) {
          cumulative.push(person);
        }
      });

      const filtered = cumulative
        .filter((candidate) => candidate.uid !== user.uid)
        .map((candidate) => ({
          ...candidate,
          alreadyMember: goalData.members?.includes(candidate.uid),
          alreadyInvited: goalData.invited?.includes(candidate.uid),
        }));

      setInviteCandidates(filtered);
    } catch (error) {
      console.error("Error loading invite candidates:", error);
      setInviteError("Unable to load invite list. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleOpenInviteModal = async () => {
    setShowInviteModal(true);
    if (inviteCandidates.length > 0) return;
    await loadInviteCandidates();
  };

  const handleInviteUser = async (inviteeId) => {
    if (!user || !goalData) return;

    setInviteError(null);
    setInviteLoading(true);

    try {
      await notificationService.sendGoalInviteNotification(inviteeId, {
        type: "goalInvite",
        fromUserId: user.uid,
        fromUserName: currentUserName || user.displayName || user.email || "Anonymous",
        fromUserAvatar: currentUserAvatar || user.photoURL || "/download.png",
        goalId,
        goalTitle: goalData.title,
      });

      await updateDoc(doc(db, "goals", goalId), {
        invited: arrayUnion(inviteeId),
      });

      setInvitedIds((prev) => [...new Set([...(prev || []), inviteeId])]);
      setGoalData((prev) => ({
        ...prev,
        invited: Array.from(new Set([...(prev?.invited || []), inviteeId])),
      }));
      setInviteCandidates((prev) =>
        prev.map((candidate) =>
          candidate.uid === inviteeId
            ? { ...candidate, alreadyInvited: true }
            : candidate
        )
      );
    } catch (error) {
      console.error("Error sending invite:", error);
      setInviteError("Unable to send invite. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleMediaSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setMediaError("Please select an image or video file.");
      setMediaFile(null);
      setMediaPreview(null);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setMediaError("File size must be 50MB or less.");
      setMediaFile(null);
      setMediaPreview(null);
      return;
    }

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setMediaError(null);
  };

  const handleRemoveMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaFile(null);
    setMediaPreview(null);
    setMediaError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleJoinGoal = async () => {
    if (!user || !goalData) return;

    setIsJoining(true);
    setJoinError(null);

    try {
      const goalRef = doc(db, "goals", goalId);
      await updateDoc(goalRef, {
        members: arrayUnion(user.uid),
      });

      setGoalData((prev) => ({
        ...prev,
        members: Array.from(new Set([...(prev?.members || []), user.uid])),
      }));

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setMemberDetails((prev) => {
          if (prev.some((member) => member.id === user.uid)) return prev;
          return [
            ...prev,
            {
              id: user.uid,
              ...userDoc.data(),
              hasCompleted: false,
            },
          ];
        });
      }
    } catch (error) {
      console.error("Error joining goal:", error);
      setJoinError("Unable to join goal. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !mediaFile) {
      return;
    }

    if (!user || !goalData) {
      return;
    }

    setIsSendingMessage(true);
    setMediaError(null);

    try {
      let mediaUrl = null;
      let mediaType = null;

      if (mediaFile) {
        setUploadingMedia(true);
        const uploadResult = await uploadMediaToCloudinary(mediaFile);
        setUploadingMedia(false);

        if (!uploadResult.success) {
          setMediaError(uploadResult.error || "Unable to upload media.");
          return;
        }

        mediaUrl = uploadResult.url;
        mediaType = mediaFile.type.startsWith("video/") ? "video" : "image";
      }

      await sendGoalChatMessage(
        goalId,
        user.uid,
        newMessage.trim(),
        currentUserName || "Anonymous",
        currentUserAvatar || "/download.png",
        mediaType,
        mediaUrl
      );

      setNewMessage("");
      handleRemoveMedia();
    } catch (error) {
      console.error("Error sending message:", error);
      setMediaError("Failed to send message. Please try again.");
    } finally {
      setIsSendingMessage(false);
      setUploadingMedia(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!goalData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <h1 className="text-2xl font-bold text-red-500">Goal not found</h1>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const goalMemberIds = Array.from(
    new Set([...(goalData.members || []), goalData.userId].filter(Boolean))
  );
  const completedCount = goalData.completedBy?.length || 0;
  const membersCount = goalMemberIds.length;
  const completionPercentage =
    membersCount > 0 ? Math.round((completedCount / membersCount) * 100) : 0;
  const isCurrentUserMember = user && goalMemberIds.includes(user.uid);

  // Format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-purple-400 hover:text-purple-300"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </button>

        <div className="w-full">
          {/* Goal Image Banner */}
          {goalData.goalImage && (
            <div className="h-96 w-full overflow-hidden rounded-xl mb-8">
              <img
                src={goalData.goalImage}
                alt={goalData.title}
                className="w-full h-full object-contain bg-[#1A1A1A]"
              />
            </div>
          )}

          {/* Header section with title, type, and completion status */}
          <div className="flex flex-wrap items-center justify-between mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-4 lg:mb-0">
              <h1 className="text-4xl font-bold text-white">
                {goalData.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  goalData.goalType === "Private"
                    ? "bg-purple-900 text-purple-200"
                    : "bg-green-900 text-green-200"
                }`}
              >
                {goalData.goalType}
              </span>
            </div>

            {/* Completion Status Pill - moved here */}
            <div className="flex items-center bg-[#2A2A2A] rounded-full py-2 px-4">
              <div className="mr-3">
                <span className="text-base font-medium text-gray-300">
                  {completedCount} of {membersCount} completed
                </span>
              </div>
              <div className="w-24 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <span className="ml-3 text-base font-medium text-purple-400">
                {completionPercentage}%
              </span>
            </div>
          </div>

          {user && !isCurrentUserMember && (
            <div className="mb-6">
              <button
                onClick={handleJoinGoal}
                disabled={isJoining}
                className="inline-flex items-center justify-center rounded-full bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
              >
                {isJoining ? "Joining..." : "Join Goal"}
              </button>
              {joinError && (
                <p className="mt-2 text-sm text-red-400">{joinError}</p>
              )}
            </div>
          )}

          {user && goalData.goalType === "Private" && user.uid === goalData.userId && (
            <div className="mb-6">
              <button
                onClick={handleOpenInviteModal}
                className="inline-flex items-center justify-center rounded-full bg-[#111827] border border-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
              >
                Invite Others
              </button>
            </div>
          )}

          {showInviteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
              <div className="w-full max-w-3xl rounded-3xl bg-[#111827] border border-gray-800 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Invite Followers & Following</h3>
                    <p className="text-sm text-gray-400">Invite people to join this private goal.</p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                {inviteLoading ? (
                  <div className="rounded-2xl bg-[#181818] p-10 text-center text-gray-400">
                    Loading invite list...
                  </div>
                ) : inviteError ? (
                  <div className="rounded-2xl bg-[#181818] p-6 text-center text-red-400">
                    {inviteError}
                  </div>
                ) : inviteCandidates.length === 0 ? (
                  <div className="rounded-2xl bg-[#181818] p-10 text-center text-gray-400">
                    No followers or following to invite.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {inviteCandidates.map((candidate) => {
                      const disabled = candidate.alreadyMember || candidate.alreadyInvited;
                      return (
                        <div
                          key={candidate.uid}
                          className="flex items-center justify-between gap-4 rounded-2xl bg-[#16161d] p-4"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={candidate.profilePic || "/download.png"}
                              alt={candidate.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-semibold text-white">{candidate.name}</p>
                              <p className="text-sm text-gray-400">{candidate.bio || "Follower / Following"}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleInviteUser(candidate.uid)}
                            disabled={disabled || inviteLoading}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                              disabled
                                ? "bg-gray-700 text-gray-300 cursor-not-allowed"
                                : "bg-purple-600 text-white hover:bg-purple-700"
                            }`}
                          >
                            {candidate.alreadyMember
                              ? "Member"
                              : candidate.alreadyInvited
                              ? "Invited"
                              : "Invite"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main content area */}
          <div className="mb-8">
            <div className="flex flex-wrap">
              <div className="w-full lg:w-3/4 pr-0 lg:pr-12">
                {/* Creator Info */}
                {creatorDetails && (
                  <div className="mb-8 flex items-center">
                    <div
                      className="mr-4 cursor-pointer"
                      onClick={() => handleProfileClick(creatorDetails.id)}
                    >
                      {creatorDetails.profilePic ? (
                        <img
                          src={creatorDetails.profilePic}
                          alt={creatorDetails.name}
                          className="w-12 h-12 rounded-full object-cover border border-purple-500 hover:border-purple-300 transition-colors"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center hover:bg-purple-600 transition-colors">
                          <span className="text-lg text-white font-bold">
                            {creatorDetails.name?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Created by</p>
                      <p
                        className="text-purple-400 font-medium text-lg cursor-pointer"
                        onClick={() => handleProfileClick(creatorDetails.id)}
                      >
                        {creatorDetails.name}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mb-10">
                  <p className="text-gray-300 text-xl leading-relaxed">
                    {goalData.description}
                  </p>
                </div>

                {/* Timeline section for dates - redesigned */}
                <div className="mb-10 relative">
                  <div className="flex items-center mb-6">
                    <Clock className="text-purple-400 mr-3" size={24} />
                    <h3 className="text-2xl font-semibold text-white">
                      Timeline
                    </h3>
                  </div>

                  <div className="relative pl-8 before:content-[''] before:absolute before:left-3 before:top-0 before:h-full before:w-px before:bg-purple-800">
                    <div className="relative mb-8">
                      <div className="absolute left-[-32px] w-6 h-6 rounded-full bg-purple-700 border-4 border-black flex items-center justify-center"></div>
                      <div className="bg-[#1A1A1A] p-5 rounded-lg">
                        <p className="text-sm text-purple-400 mb-1">
                          Start Date
                        </p>
                        <p className="text-xl font-medium text-white">
                          {formatDate(goalData.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute left-[-32px] w-6 h-6 rounded-full bg-purple-700 border-4 border-black flex items-center justify-center"></div>
                      <div className="bg-[#1A1A1A] p-5 rounded-lg">
                        <p className="text-sm text-purple-400 mb-1">End Date</p>
                        <p className="text-xl font-medium text-white">
                          {formatDate(goalData.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/4 mt-6 lg:mt-0">
                {/* Categories section */}
                {goalData.categories && goalData.categories.length > 0 && (
                  <div className="bg-[#1A1A1A] p-6 rounded-lg mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Categories
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {goalData.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#2A2A2A] text-sm rounded-md text-purple-300"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Members Section - vertically scrollable */}
            <div className="mt-12">
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Users className="text-purple-400 mr-3" size={24} />
                Members
              </h2>
              <div className="h-96 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  {memberDetails.map((member) => (
                    <div
                      key={member.id}
                      className="bg-[#1A1A1A] rounded-lg p-5 flex items-center hover:bg-[#222] transition-colors"
                    >
                      <div
                        className="flex-shrink-0 mr-5 cursor-pointer"
                        onClick={() => handleProfileClick(member.id)}
                      >
                        {member.profilePic ? (
                          <img
                            src={member.profilePic}
                            alt={member.name}
                            className="w-16 h-16 rounded-full object-cover border border-gray-600 hover:border-purple-400 transition-colors"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-purple-700 flex items-center justify-center hover:bg-purple-600 transition-colors">
                            <span className="text-2xl text-white font-bold">
                              {member.name?.charAt(0) || "?"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold text-white text-xl">
                          <span
                            className="cursor-pointer hover:text-purple-400 transition"
                            onClick={() => handleProfileClick(member.id)}
                          >
                            {member.name}
                          </span>
                        </h3>
                        <p className="text-base text-gray-400 truncate">
                          {member.email}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {member.hasCompleted ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-200">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-800 text-gray-300">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Goal Chat Section */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              Goal Chat
            </h2>

            {/* Chat Container */}
            <div className="bg-[#1A1A1A] rounded-lg border border-gray-800 flex flex-col h-96">
              {/* Messages Section */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <p className="text-gray-400">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  chatMessages.map((message) => {
                    const isMine = user && message.userId === user.uid;
                    const senderName = isMine
                      ? currentUserName || user.displayName || user.email || "You"
                      : message.userName?.trim() || userNamesById[message.userId] || message.userId || "Unknown User";
                    const avatarSrc =
                      message.userAvatar ||
                      (isMine ? currentUserAvatar || "/download.png" : "/download.png");
                    const timestamp = message.timestamp
                      ? new Date(message.timestamp.toDate?.() || message.timestamp)
                      : null;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex max-w-[85%] ${
                            isMine ? "flex-row-reverse" : "flex-row"
                          } items-end gap-3`}
                        >
                          <img
                            src={avatarSrc}
                            alt={senderName}
                            className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                          />
                          <div
                            className={`rounded-3xl p-4 shadow-sm ${
                              isMine
                                ? "bg-purple-600 text-white rounded-br-none"
                                : "bg-[#242424] text-gray-200 rounded-bl-none"
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold">
                                {senderName}
                              </span>
                              <span className="text-xs text-gray-300">
                                {timestamp
                                  ? timestamp.toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Now"}
                              </span>
                            </div>
                            {message.mediaUrl && (
                              <div className="mb-3">
                                {message.mediaType === "video" ? (
                                  <video
                                    controls
                                    src={message.mediaUrl}
                                    className="max-h-64 w-full rounded-2xl object-cover"
                                  />
                                ) : (
                                  <img
                                    src={message.mediaUrl}
                                    alt="Chat media"
                                    className="max-h-64 w-full rounded-2xl object-cover"
                                  />
                                )}
                              </div>
                            )}
                            {message.message ? (
                              <p className="text-sm leading-6 break-words">
                                {message.message}
                              </p>
                            ) : (
                              !message.mediaUrl && (
                                <p className="text-sm leading-6 break-words">
                                  {message.message}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Section */}
              {user && isCurrentUserMember ? (
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-gray-800 p-4"
                >
                  <div className="space-y-3">
                    {mediaPreview && (
                      <div className="rounded-2xl border border-gray-700 bg-[#111111] p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="max-w-[70%]">
                            {mediaFile?.type.startsWith("video/") ? (
                              <video
                                controls
                                src={mediaPreview}
                                className="max-h-40 w-full rounded-2xl object-cover"
                              />
                            ) : (
                              <img
                                src={mediaPreview}
                                alt="Preview"
                                className="max-h-40 w-full rounded-2xl object-cover"
                              />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveMedia}
                            className="text-sm text-purple-300 hover:text-white"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer rounded-full bg-[#2A2A2A] px-4 py-2 text-sm text-gray-200 hover:bg-[#333333] transition">
                        Attach
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleMediaSelect}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 min-w-[220px] bg-[#2A2A2A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        disabled={isSendingMessage || uploadingMedia}
                      />
                      <button
                        type="submit"
                        disabled={
                          isSendingMessage || uploadingMedia ||
                          (!newMessage.trim() && !mediaFile)
                        }
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Send size={18} />
                      </button>
                    </div>

                    {(mediaError || uploadingMedia) && (
                      <p className="text-sm text-red-400">
                        {uploadingMedia ? "Uploading media..." : mediaError}
                      </p>
                    )}
                  </div>
                </form>
              ) : (
                <div className="border-t border-gray-800 p-4 text-center text-gray-400 text-sm">
                  Join this goal to participate in the chat
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ViewOtherProfile Modal - only shown for other users */}
      {selectedProfileId && (
        <ViewOtherProfile
          userId={selectedProfileId}
          onClose={handleCloseProfile}
        />
      )}

      {/* Custom scrollbar style */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8b5cf6;
        }
      `}</style>
    </div>
  );
};

export default GoalDetails;
