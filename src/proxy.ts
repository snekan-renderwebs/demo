import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export default function proxy(request: NextRequest) {
  
  const token = request.cookies.get("auth_token")?.value;

  
  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  try {
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      userId: string;
      email: string;
      role: string;
    };

    const pathname = request.nextUrl.pathname;
    const role = decoded.role;

    // 4. Users page
    // Admin + Manager only
    if (pathname.startsWith("/users")) {
      if (
        role !== "admin" &&
        role !== "manager"
      ) {
        return NextResponse.redirect(
          new URL("/dashboard", request.url)
        );
      }
    }

    // 5. Dashboard
    // Admin + Manager + Staff
    if (pathname.startsWith("/dashboard")) {
      if (
        role !== "admin" &&
        role !== "manager" &&
        role !== "staff"
      ) {
        return NextResponse.redirect(
          new URL("/login", request.url)
        );
      }
    }

    // 6. Profile
    // All three roles
    if (pathname.startsWith("/profile")) {
      if (
        role !== "admin" &&
        role !== "manager" &&
        role !== "staff"
      ) {
        return NextResponse.redirect(
          new URL("/login", request.url)
        );
      }
    }

    // 7. Onboarding
    // All three roles
    if (pathname.startsWith("/onboarding")) {
      if (
        role !== "admin" &&
        role !== "manager" &&
        role !== "staff"
      ) {
        return NextResponse.redirect(
          new URL("/login", request.url)
        );
      }
    }

    // 8. Allow request
    return NextResponse.next();

  } catch (error) {
    console.error("Authorization error:", error);

    // Invalid / expired JWT
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/users/:path*",
    "/onboarding/:path*",
  ],
};