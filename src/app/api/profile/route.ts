import { NextRequest, NextResponse } from "next/server";

import { db } from "@/src/lib/db";

import {
  getAuthUser,
} from "@/src/lib/auth";


export async function GET(
  request: NextRequest
) {
  try {
    
    const authUser =
      getAuthUser(request);

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

    
    const user =
      await db.user.findUnique({
        where: {
          id: authUser.userId,
        },

        
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,

          // Personal
          dateOfBirth: true,
          gender: true,
          address: true,
          city: true,
          state: true,
          pincode: true,

          // Academic
          qualification: true,
          college: true,
          course: true,
          department: true,
          graduationYear: true,
          cgpa: true,
          tenthPercentage: true,
          twelfthPercentage: true,

          // Documents
          resumePath: true,
          identityProofPath: true,
          termsAccepted: true,

          // Account
          createdAt: true,
          updatedAt: true,
        },
      });

    
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
      "Get profile error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to fetch profile",
      },
      {
        status: 500,
      }
    );
  }
}


export async function PUT(
  request: NextRequest
) {
  try {
    
    const authUser =
      getAuthUser(request);

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

    
    const body =
      await request.json();

    const {
      name,
      phone,

      dateOfBirth,
      gender,
      address,
      city,
      state,
      pincode,

      qualification,
      college,
      course,
      department,
      graduationYear,
      cgpa,
      tenthPercentage,
      twelfthPercentage,
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

    
    const existingUser =
      await db.user.findUnique({
        where: {
          id: authUser.userId,
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

    
    const updatedUser =
      await db.user.update({
        where: {
          id: authUser.userId,
        },

        data: {
         
          name: name.trim(),

          // Email intentionally NOT updated.
          // Email belongs to authentication account.

          phone:
            typeof phone === "string" &&
            phone.trim()
              ? phone.trim()
              : null,

          
          dateOfBirth:
            typeof dateOfBirth === "string" &&
            dateOfBirth.trim()
              ? dateOfBirth.trim()
              : null,

          gender:
            typeof gender === "string" &&
            gender.trim()
              ? gender.trim()
              : null,

          address:
            typeof address === "string" &&
            address.trim()
              ? address.trim()
              : null,

          city:
            typeof city === "string" &&
            city.trim()
              ? city.trim()
              : null,

          state:
            typeof state === "string" &&
            state.trim()
              ? state.trim()
              : null,

          pincode:
            typeof pincode === "string" &&
            pincode.trim()
              ? pincode.trim()
              : null,

         
          qualification:
            typeof qualification === "string" &&
            qualification.trim()
              ? qualification.trim()
              : null,

          college:
            typeof college === "string" &&
            college.trim()
              ? college.trim()
              : null,

          course:
            typeof course === "string" &&
            course.trim()
              ? course.trim()
              : null,

          department:
            typeof department === "string" &&
            department.trim()
              ? department.trim()
              : null,

          graduationYear:
            typeof graduationYear === "string" &&
            graduationYear.trim()
              ? graduationYear.trim()
              : null,

          cgpa:
            typeof cgpa === "string" &&
            cgpa.trim()
              ? cgpa.trim()
              : null,

          tenthPercentage:
            typeof tenthPercentage === "string" &&
            tenthPercentage.trim()
              ? tenthPercentage.trim()
              : null,

          twelfthPercentage:
            typeof twelfthPercentage === "string" &&
            twelfthPercentage.trim()
              ? twelfthPercentage.trim()
              : null,
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

    
    return NextResponse.json(
      {
        message:
          "Profile updated successfully",

        user: updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Failed to update profile",
      },
      {
        status: 500,
      }
    );
  }
}