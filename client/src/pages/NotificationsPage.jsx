import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      const { data } = await api.get("/notifications/my");
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? { ...notification, readAt: new Date().toISOString() }
            : notification,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to mark notification as read.",
      );
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          readAt: new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to mark notifications as read.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-700">
              BloodCare
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Notifications{" "}
              <span className="text-cyan-700">({unreadCount})</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!unreadCount}
              onClick={markAllRead}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-cyan-700 disabled:opacity-50"
            >
              Mark all read
            </button>
            <Link
              to="/dashboard"
              className="rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-700"
            >
              Dashboard
            </Link>
          </div>
        </header>
        {error && (
          <p className="mb-4 rounded-xl bg-rose-50 p-4 text-rose-700">
            {error}
          </p>
        )}
        {loading ? (
          <div className="rounded-2xl bg-white p-7 shadow-sm">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl bg-white p-7 text-slate-700 shadow-sm">
            You are all caught up.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`rounded-2xl bg-white p-5 shadow-sm ${notification.readAt ? "opacity-70" : "border-l-4 border-cyan-600"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      {notification.title}
                    </h2>
                    <p className="mt-1 text-slate-600">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.readAt && (
                    <button
                      type="button"
                      onClick={() => markRead(notification._id)}
                      className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-cyan-700"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default NotificationsPage;
