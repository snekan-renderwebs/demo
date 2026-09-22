import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "../../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Get JWT from cookie
    const token =
      request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // 2. Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      userId: string;
      email: string;
      role: string;
    };

    // 3. Get user from database
    const user = await db.user.findUnique({
      where: {
        id: decoded.userId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,

        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        pincode: true,

        qualification: true,
        college: true,
        course: true,
        department: true,
        graduationYear: true,
        cgpa: true,
        tenthPercentage: true,
        twelfthPercentage: true,

        resumePath: true,
        identityProofPath: true,

        termsAccepted: true,

        createdAt: true,
        updatedAt: true,
      },
    });

    // 4. User not found
    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    // 5. Return user
    return NextResponse.json(
      {
        user,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Get current user error:",
      error
    );

    if (
      error instanceof jwt.TokenExpiredError
    ) {
      return NextResponse.json(
        {
          message: "Token expired",
        },
        {
          status: 401,
        }
      );
    }

    if (
      error instanceof jwt.JsonWebTokenError
    ) {
      return NextResponse.json(
        {
          message: "Invalid token",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        message: "Failed to get current user",
      },
      {
        status: 500,
      }
    );
  }
}