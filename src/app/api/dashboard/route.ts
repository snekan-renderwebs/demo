import { NextRequest, NextResponse } from "next/server";

import { db } from "../../../lib/db";

import {
  getAuthUser,
  requireRole,
} from "@/src/lib/auth";


export async function GET(
  request: NextRequest
) {
  try {
    
    const user = getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    
    const totalUsers = await db.user.count();

    
    const adminCount = await db.user.count({
      where: {
        role: "admin",
      },
    });

    const managerCount = await db.user.count({
      where: {
        role: "manager",
      },
    });

    const staffCount = await db.user.count({
      where: {
        role: "staff",
      },
    });

    
    const completedOnboarding =
      await db.user.count({
        where: {
          termsAccepted: true,
        },
      });

    
    const pendingOnboarding =
      await db.user.count({
        where: {
          termsAccepted: false,
        },
      });

    
    const recentUsers =
      await db.user.findMany({
        orderBy: {
          createdAt: "desc",
        },

        take: 5,

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          qualification: true,
          termsAccepted: true,
          createdAt: true,
        },
      });

    return NextResponse.json(
      {
        user: {
          id: user.userId,
          role: user.role,
        },

        statistics: {
          totalUsers,
          adminCount,
          managerCount,
          staffCount,
          completedOnboarding,
          pendingOnboarding,
        },

        recentUsers,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Dashboard API error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch dashboard data",
      },
      {
        status: 500,
      }
    );
  }
}