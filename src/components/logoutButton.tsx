"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";

export default function LogoutButton() {
  const router = useRouter();

  const clearUser = useAuthStore(
    (state) => state.clearUser
  );

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        alert("Logout failed");
        return;
      }

      // Clear Zustand user
      clearUser();

      // Redirect to login
      router.replace("/login");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      alert("Something went wrong during logout");
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
    >
      Logout
    </button>
  );
}