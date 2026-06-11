"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

export interface ToastItem {
  id: string;
  title: string;
  message: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  targetRole: string; // "Administrador" | "Docente" | "Estudiante" | "Técnico" | "ALL"
  targetEmail?: string; // target a specific user
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  sendNotification: (title: string, message: string, targetRole: string, targetEmail?: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const STORAGE_KEY = "fisei_notifications_v1";

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "seed-1",
    title: "Bienvenido al Sistema",
    message: "Bienvenido al Sistema Web de Gestión Tecnológica FISEI.",
    date: new Date().toISOString(),
    read: false,
    targetRole: "ALL"
  }
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Load notifications from localStorage
  const loadNotifications = () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      setAllNotifications(DEFAULT_NOTIFICATIONS);
    } else {
      try {
        setAllNotifications(JSON.parse(raw));
      } catch {
        setAllNotifications(DEFAULT_NOTIFICATIONS);
      }
    }
  };

  useEffect(() => {
    loadNotifications();

    // Listen to localStorage changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        loadNotifications();
      }
    };

    // Listen to local custom events for instant updates in the same tab
    const handleLocalUpdate = (e: any) => {
      loadNotifications();
      if (e.detail && e.detail.title) {
        showToast(e.detail.title, e.detail.message);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("fisei_notifications_changed", handleLocalUpdate as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("fisei_notifications_changed", handleLocalUpdate as EventListener);
    };
  }, []);

  const showToast = (title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Filter notifications for current user
  const notifications = useMemo(() => {
    if (!user) return [];
    const role = user.role || "";
    const email = user.email || "";

    return allNotifications.filter((n) => {
      // Role matching
      const matchesRole = n.targetRole === "ALL" || n.targetRole.toUpperCase() === role.toUpperCase();
      // Email matching (if targetEmail is set, must match user's email)
      const matchesEmail = !n.targetEmail || n.targetEmail.toLowerCase() === email.toLowerCase();
      
      return matchesRole && matchesEmail;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allNotifications, user]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const sendNotification = (title: string, message: string, targetRole: string, targetEmail?: string) => {
    if (typeof window === "undefined") return;
    const newNotif: NotificationItem = {
      id: "notif_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      targetRole,
      targetEmail
    };

    const updated = [newNotif, ...allNotifications];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setAllNotifications(updated);

    // Dispatch local custom event for immediate UI updates
    window.dispatchEvent(new CustomEvent("fisei_notifications_changed", { detail: newNotif }));
  };

  const markAllAsRead = () => {
    if (typeof window === "undefined" || !user) return;
    const role = user.role || "";
    const email = user.email || "";

    const updated = allNotifications.map((n) => {
      const matchesRole = n.targetRole === "ALL" || n.targetRole.toUpperCase() === role.toUpperCase();
      const matchesEmail = !n.targetEmail || n.targetEmail.toLowerCase() === email.toLowerCase();
      if (matchesRole && matchesEmail) {
        return { ...n, read: true };
      }
      return n;
    });

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setAllNotifications(updated);
    window.dispatchEvent(new Event("fisei_notifications_changed"));
  };

  const clearAll = () => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    setAllNotifications([]);
    window.dispatchEvent(new Event("fisei_notifications_changed"));
  };

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      sendNotification,
      markAllAsRead,
      clearAll
    }),
    [notifications, unreadCount]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 9999,
        pointerEvents: "none"
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: "#1e293b",
            color: "#ffffff",
            padding: "16px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            borderLeft: "4px solid #3b82f6",
            maxWidth: "350px",
            pointerEvents: "auto",
            animation: "slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards"
          }}>
            <strong style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>{toast.title}</strong>
            <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{toast.message}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications debe usarse dentro de NotificationProvider");
  }
  return context;
}
