"use client";

import { AuthProvider } from "@/context/AuthContext";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthProvider>{children}</AuthProvider>;
}