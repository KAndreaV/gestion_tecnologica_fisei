"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/constants";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) : null;
    
    if (!token && !storedToken) {
      router.replace("/login");
    } else {
      setIsChecking(false);
    }
  }, [token, router]);

  if (isChecking) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "var(--bg-main)", color: "#fff" }}>
        <p>Cargando sesión...</p>
      </div>
    );
  }

  const role = user?.role || "";
  const isUser = role === "Docente" || role === "Estudiante";

  return (
    <div className={`dashboard-shell ${isUser ? "no-sidebar" : ""}`}>
      {!isUser && <Sidebar />}
      <div className="dashboard-main">
        <div style={{ padding: "16px 18px 0" }}>
          <Navbar />
        </div>
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}