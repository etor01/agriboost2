"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, Package, Sparkles, CreditCard, ClipboardList } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import type { Notification } from "@/lib/database.types";
import { toast } from "@/components/ui/Toast";

export default function NotificationBell({ userId }: { userId?: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((c) => c + 1);
          toast.success(`New Notification: ${newNotif.title}`);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
          );
          setUnreadCount((prev) => {
            const isReadNow = payload.new.read;
            const wasRead = payload.old?.read;
            if (!wasRead && isReadNow) return Math.max(0, prev - 1);
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order_placed":
        return <Package className="h-4 w-4 text-emerald-500" />;
      case "escrow_released":
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case "scan_complete":
        return <Sparkles className="h-4 w-4 text-purple-500" />;
      case "task_due":
        return <ClipboardList className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 border-2 border-white rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex justify-end">
          {/* Drawer Panel */}
          <div
            ref={drawerRef}
            className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col transform transition-transform"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bell className="h-6 w-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 flex gap-3 transition-colors ${
                        !n.read ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5 bg-gray-100 p-2 rounded-full h-8 w-8 flex items-center justify-center">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p
                            className={`text-sm ${
                              !n.read ? "font-bold text-gray-900" : "font-medium text-gray-700"
                            }`}
                          >
                            {n.title}
                          </p>
                          {!n.read && (
                            <button
                              onClick={(e) => handleMarkRead(n.id, e)}
                              className="flex-shrink-0 text-[10px] text-gray-400 hover:text-emerald-600"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        {n.message && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {n.message}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1.5 uppercase font-semibold">
                          {new Date(n.created_at).toLocaleDateString("en-GH", {
                            day: "numeric",
                            month: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
