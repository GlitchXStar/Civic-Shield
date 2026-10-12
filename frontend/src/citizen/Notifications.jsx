import { useState, useEffect } from "react";
import { Bell, CheckCheck, Loader2, AlertCircle, Check } from "lucide-react";
import { PortalPage } from "./Dashboard";
import { citizenApi } from "../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await citizenApi.getNotifications();
      const list = res.data?.notifications || (Array.isArray(res.data) ? res.data : []);
      setNotifications(list);
    } catch (err) {
      setError(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await citizenApi.readNotification(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  return (
    <PortalPage eyebrow="Citizen / Notifications" title="Notifications" subtitle="Important updates from your reporting workspace will appear here.">
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Bell size={20} />
            </span>
            <h2 className="font-extrabold text-slate-950">Your notifications</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {notifications.filter((n) => !n.isRead).length} unread
          </span>
        </div>

        {loading ? (
          <div className="mt-8 flex h-36 items-center justify-center">
            <Loader2 size={28} className="animate-spin text-teal-700" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="mt-6 divide-y divide-slate-100">
            {notifications.map((n) => {
              const notifId = n._id || n.id;
              return (
                <div
                  key={notifId}
                  className={`flex items-start justify-between gap-4 py-4 transition ${
                    !n.isRead ? "bg-teal-50/30 px-3 rounded-xl" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                      {!n.isRead && (
                        <span className="size-2 rounded-full bg-teal-600" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{n.message}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : "Just now"}
                    </p>
                  </div>
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notifId)}
                      className="shrink-0 flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      title="Mark as read"
                    >
                      <Check size={14} /> Read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <CheckCheck className="mx-auto text-slate-400" />
            <p className="mt-3 font-bold text-slate-700">No notifications</p>
            <p className="mt-1 text-sm text-slate-500">There are no notifications to display at this time.</p>
          </div>
        )}
      </div>
    </PortalPage>
  );
}
