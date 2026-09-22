import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export function getAuthUser(
  request: NextRequest
): AuthUser | null {
  try {
    // 1. Get JWT from cookie
    const token =
      request.cookies.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    // 2. Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as AuthUser;

    // 3. Return authenticated user
    return decoded;
  } catch (error) {
    console.error("Auth error:", error);

    return null;
  }
}

export function requireRole(
  user: AuthUser | null,
  allowedRoles: string[]
): boolean {
  if (!user) {
    return false;
  }

  return allowedRoles.includes(user.role);
}