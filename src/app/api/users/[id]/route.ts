import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";

import {
  getAuthUser,
  requireRole,
} from "@/src/lib/auth";

import { updateUserSchema } from "@/src/lib/validation/user";



export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
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

    
    if (
      !requireRole(user, [
        "admin",
        "manager",
      ])
    ) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to view users",
        },
        {
          status: 403,
        }
      );
    }

    
    const { id } = await context.params;

    
    const existingUser =
      await db.user.findUnique({
        where: {
          id,
        },

        
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,

          address: true,
          city: true,
          state: true,
          pincode: true,
          dateOfBirth: true,
          gender: true,

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

    
    if (!existingUser) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    
    return NextResponse.json(
      {
        user: existingUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Get single user error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch user",
      },
      {
        status: 500,
      }
    );
  }
}



export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
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

    
    if (
      !requireRole(user, [
        "admin",
        "manager",
      ])
    ) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to update users",
        },
        {
          status: 403,
        }
      );
    }

   
    const { id } = await context.params;

   
    const existingUser =
      await db.user.findUnique({
        where: {
          id,
        },
      });

    if (!existingUser) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

  
    const body = await request.json();

   
    const validation =
      updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validation.error.flatten()
            .fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

    const {
      name,
      email,
      phone,
      role,
    } = validation.data;

   
    if (
      user.role === "manager" &&
      role !== existingUser.role
    ) {
      return NextResponse.json(
        {
          message:
            "Manager cannot change user role",
        },
        {
          status: 403,
        }
      );
    }

   
    const emailUser =
      await db.user.findUnique({
        where: {
          email: email.toLowerCase(),
        },
      });

    if (
      emailUser &&
      emailUser.id !== id
    ) {
      return NextResponse.json(
        {
          message:
            "Email already exists",
        },
        {
          status: 409,
        }
      );
    }

    
    const updatedUser =
      await db.user.update({
        where: {
          id,
        },

        data: {
          name: name.trim(),

          email:
            email.trim().toLowerCase(),

          phone:
            phone.trim() || null,

          role,
        },

       
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
        message:
          "User updated successfully",

        user: updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Update user error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update user",
      },
      {
        status: 500,
      }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
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

    
    if (
      !requireRole(user, ["admin"])
    ) {
      return NextResponse.json(
        {
          message:
            "Only admin can delete users",
        },
        {
          status: 403,
        }
      );
    }

    
    const { id } = await context.params;

   
    const existingUser =
      await db.user.findUnique({
        where: {
          id,
        },
      });

    if (!existingUser) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    
    if (user.userId === id) {
      return NextResponse.json(
        {
          message:
            "You cannot delete your own account",
        },
        {
          status: 400,
        }
      );
    }

    
    await db.user.delete({
      where: {
        id,
      },
    });

   
    return NextResponse.json(
      {
        message:
          "User deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Delete user error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to delete user",
      },
      {
        status: 500,
      }
    );
  }
}