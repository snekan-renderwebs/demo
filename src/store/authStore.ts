import { create } from "zustand";
import { persist } from "zustand/middleware";
export type UserRole =
  | "admin"
  | "manager"
  | "staff";
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;

  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;

  qualification?: string | null;
  college?: string | null;
  course?: string | null;
  department?: string | null;
  graduationYear?: string | null;
  cgpa?: string | null;
  tenthPercentage?: string | null;
  twelfthPercentage?: string | null;

  resumePath?: string | null;
  identityProofPath?: string | null;
  termsAccepted?: boolean;

  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;

  setUser: (user: User) => void;

  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => {
        set({
          user,
        });
      },

      clearUser: () => {
        set({
          user: null,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);