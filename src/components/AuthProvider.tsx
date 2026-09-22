"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore(
    (state) => state.setUser
  );

  const clearUser = useAuthStore(
    (state) => state.clearUser
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const response = await fetch(
          "/api/auth/me"
        );

        if (!response.ok) {
          clearUser();
          return;
        }

        const data = await response.json();

        setUser(data.user);
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        clearUser();
      } finally {
        setLoading(false);
      }
    }

    checkAuthentication();
  }, [setUser, clearUser]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}