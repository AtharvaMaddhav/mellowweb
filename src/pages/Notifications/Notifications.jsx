import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService.js";
import { ArrowLeft } from "lucide-react";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);

    try {
      const data = await notificationService.getUserNotifications(user.uid);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleAccept = async (notification) => {
    if (!user?.uid || actionLoading) return;
    setActionLoading(true);
    setError(null);

    try {
      await notificationService.acceptGoalInvite(user.uid, notification.id, notification.goalId);
      await loadNotifications();
      navigate(`/goals/${notification.goalId}`);
    } catch (err) {
      console.error("Failed to accept invitation:", err);
      setError("Unable to accept invitation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleIgnore = async (notification) => {
    if (!user?.uid || actionLoading) return;
    setActionLoading(true);
    setError(null);

    try {
      await notificationService.ignoreGoalInvite(user.uid, notification.id);
      await loadNotifications();
    } catch (err) {
      console.error("Failed to ignore invitation:", err);
      setError("Unable to ignore invitation.");
    } finally {
      setActionLoading(false);
    }
  };

  const pendingInvites = notifications.filter((notification) => notification.status === "pending");

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center text-purple-400 hover:text-purple-300"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="mx-auto max-w-4xl rounded-3xl border border-gray-800 bg-[#0f0f11] p-6 shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="mb-6 text-gray-400">See recent invites and respond to private goal invitations.</p>

        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading notifications...</div>
        ) : error ? (
          <div className="rounded-2xl bg-[#16161d] p-6 text-red-400">{error}</div>
        ) : pendingInvites.length === 0 ? (
          <div className="rounded-2xl bg-[#16161d] p-10 text-center text-gray-400">
            No pending invitations at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingInvites.map((notification) => (
              <div
                key={notification.id}
                className="rounded-3xl border border-gray-800 bg-[#141417] p-5"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Invitation</p>
                    <h2 className="text-xl font-semibold text-white">
                      {notification.fromUserName || "Someone"} invited you to join <span className="text-purple-300">{notification.goalTitle}</span>
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                      From {notification.fromUserName || "Unknown"} — {notification.goalId}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleAccept(notification)}
                      disabled={actionLoading}
                      className="rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleIgnore(notification)}
                      disabled={actionLoading}
                      className="rounded-full border border-gray-700 bg-transparent px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-white/5 disabled:opacity-50"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
