"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/features/auth/auth.service";
import { useAuth } from "@/hooks/useAuth";
import type { LoginCredentials } from "@/features/auth/auth.types";

export function useLogin() {
  const router = useRouter();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await authService.login(credentials);
      auth.login(session);
      router.push("/dashboard");
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.";
      setError(message);
      throw loginError;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}