import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "../../../lib/db";

import {
  getAuthUser,
  requireRole,
} from "@/src/lib/auth";


export async function GET(request: NextRequest) {
  try {
    
    const authUser = getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    
    if (!requireRole(authUser, ["admin", "manager"])) {
      return NextResponse.json(
        {
          message: "Only admin and manager can view users",
        },
        {
          status: 403,
        }
      );
    }

    
    const { searchParams } = new URL(request.url);

    const name = searchParams.get("name") || "";
    const email = searchParams.get("email") || "";
    const phone = searchParams.get("phone") || "";

   
    const requestedSortBy =
      searchParams.get("sortBy") || "createdAt";

    const requestedSortOrder =
      searchParams.get("sortOrder") || "desc";

    const allowedSortFields = [
      "name",
      "email",
      "phone",
      "role",
      "createdAt",
    ] as const;

    const sortBy = allowedSortFields.includes(
      requestedSortBy as (typeof allowedSortFields)[number]
    )
      ? requestedSortBy
      : "createdAt";

    const sortOrder =
      requestedSortOrder === "asc"
        ? "asc"
        : "desc";

    
    const requestedPage =
      Number(searchParams.get("page")) || 1;

    const requestedPageSize =
      Number(searchParams.get("pageSize")) || 10;

    const page = Math.max(requestedPage, 1);

    const pageSize = Math.min(
      Math.max(requestedPageSize, 1),
      100
    );

    const skip = (page - 1) * pageSize;

    
    const where = {
      AND: [
        name
          ? {
              name: {
                contains: name,
                mode: "insensitive" as const,
              },
            }
          : {},

        email
          ? {
              email: {
                contains: email,
                mode: "insensitive" as const,
              },
            }
          : {},

        phone
          ? {
              phone: {
                contains: phone,
              },
            }
          : {},
      ],
    };

   
    const users = await db.user.findMany({
      where,

      skip,

      take: pageSize,

      orderBy: {
        [sortBy]: sortOrder,
      },

      // Never return password
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    
    const totalUsers = await db.user.count({
      where,
    });

    
    const totalPages = Math.ceil(
      totalUsers / pageSize
    );

    
    return NextResponse.json(
      {
        users,

        pagination: {
          page,
          pageSize,
          totalUsers,
          totalPages,
        },

        sorting: {
          sortBy,
          sortOrder,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("GET /api/users error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch users",
      },
      {
        status: 500,
      }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
   
    const authUser = getAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    
    if (!requireRole(authUser, ["admin"])) {
      return NextResponse.json(
        {
          message: "Only admin can create users",
        },
        {
          status: 403,
        }
      );
    }

   
    const body = await request.json();

    const {
      name,
      email,
      password,
      phone,
      role,
    } = body;

    
    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          message: "Name is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return NextResponse.json(
        {
          message: "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof password !== "string" ||
      password.length < 6
    ) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 6 characters",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof phone !== "string" ||
      !/^[0-9]{10}$/.test(phone)
    ) {
      return NextResponse.json(
        {
          message: "Phone must be 10 digits",
        },
        {
          status: 400,
        }
      );
    }

    
    const allowedRoles = [
      "admin",
      "manager",
      "staff",
    ];

    if (
      typeof role !== "string" ||
      !allowedRoles.includes(role)
    ) {
      return NextResponse.json(
        {
          message:
            "Role must be admin, manager or staff",
        },
        {
          status: 400,
        }
      );
    }

    
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

   
    const existingEmail =
      await db.user.findUnique({
        where: {
          email: cleanEmail,
        },
      });

    if (existingEmail) {
      return NextResponse.json(
        {
          message: "Email already exists",
        },
        {
          status: 409,
        }
      );
    }

    const existingPhone =
      await db.user.findFirst({
        where: {
          phone: cleanPhone,
        },
      });

    if (existingPhone) {
      return NextResponse.json(
        {
          message: "Phone already exists",
        },
        {
          status: 409,
        }
      );
    }

    
    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

   
    const newUser =
      await db.user.create({
        data: {
          name: cleanName,

          email: cleanEmail,

          password: hashedPassword,

          phone: cleanPhone,

          role,
        },

        // Password is NEVER returned
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    
    return NextResponse.json(
      {
        message: "User created successfully",

        user: newUser,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST /api/users error:", error);

    return NextResponse.json(
      {
        message: "Failed to create user",
      },
      {
        status: 500,
      }
    );
  }
}