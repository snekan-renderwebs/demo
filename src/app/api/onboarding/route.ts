import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { db } from "../../../lib/db";

import {
  onboardingServerSchema,
} from "@/src/lib/validation/onboardingserver";

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";


// Maximum file size = 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;


const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];


const ALLOWED_IDENTITY_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];


export async function POST(
  request: NextRequest
) {
  try {
   
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

    
    let decoded: {
      userId: string;
      email: string;
      role: string;
    };

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as {
        userId: string;
        email: string;
        role: string;
      };
    } catch (error) {
      
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

      throw error;
    }

    
    const existingUser =
      await db.user.findUnique({
        where: {
          id: decoded.userId,
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

    
    const formData =
      await request.formData();

    
    const name = String(
      formData.get("name") || ""
    );

    

    const phone = String(
      formData.get("phone") || ""
    );

    const dateOfBirth = String(
      formData.get("dateOfBirth") || ""
    );

    const gender = String(
      formData.get("gender") || ""
    );

    const address = String(
      formData.get("address") || ""
    );

    const city = String(
      formData.get("city") || ""
    );

    const state = String(
      formData.get("state") || ""
    );

    const pincode = String(
      formData.get("pincode") || ""
    );

    
    const qualification = String(
      formData.get("qualification") || ""
    );

    const college = String(
      formData.get("college") || ""
    );

    const course = String(
      formData.get("course") || ""
    );

    const department = String(
      formData.get("department") || ""
    );

    const graduationYear = String(
      formData.get("graduationYear") || ""
    );

    const cgpa = String(
      formData.get("cgpa") || ""
    );

    const tenthPercentage = String(
      formData.get("tenthPercentage") || ""
    );

    const twelfthPercentage = String(
      formData.get("twelfthPercentage") || ""
    );

    
    const resume =
      formData.get("resume");

    const identityProof =
      formData.get("identityProof");

    
    const termsAccepted =
      formData.get("termsAccepted") === "true";

    
    if (!(resume instanceof File)) {
      return NextResponse.json(
        {
          message: "Resume is required",
        },
        {
          status: 400,
        }
      );
    }

    
    if (
      !(identityProof instanceof File)
    ) {
      return NextResponse.json(
        {
          message:
            "Identity proof is required",
        },
        {
          status: 400,
        }
      );
    }

    
    if (
      !ALLOWED_RESUME_TYPES.includes(
        resume.type
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Resume must be PDF, DOC or DOCX",
        },
        {
          status: 400,
        }
      );
    }

    
    if (
      !ALLOWED_IDENTITY_TYPES.includes(
        identityProof.type
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Identity proof must be PDF, JPG or PNG",
        },
        {
          status: 400,
        }
      );
    }

    
    if (
      resume.size > MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          message:
            "Resume must be 5 MB or less",
        },
        {
          status: 400,
        }
      );
    }

    
    if (
      identityProof.size > MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          message:
            "Identity proof must be 5 MB or less",
        },
        {
          status: 400,
        }
      );
    }

    
    const validation =
      onboardingServerSchema.safeParse({
        
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

        
        resumePath: resume.name,

        identityProofPath:
          identityProof.name,

        
        termsAccepted,
      });

    
    if (!validation.success) {
      return NextResponse.json(
        {
          message:
            "Validation failed",

          errors:
            validation.error.flatten()
              .fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

   
    const resumesDirectory =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "resumes"
      );

    await fs.mkdir(
      resumesDirectory,
      {
        recursive: true,
      }
    );

    
    const identityDirectory =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "identity-proofs"
      );

    await fs.mkdir(
      identityDirectory,
      {
        recursive: true,
      }
    );

    
    const resumeExtension =
      path.extname(resume.name);

    const identityExtension =
      path.extname(
        identityProof.name
      );

    
    const uniqueId =
      crypto.randomUUID();

    
    const resumeFileName =
      `${decoded.userId}-${uniqueId}-resume${resumeExtension}`;

    const identityFileName =
      `${decoded.userId}-${uniqueId}-identity${identityExtension}`;

    
    const resumeFilePath =
      path.join(
        resumesDirectory,
        resumeFileName
      );

    const identityFilePath =
      path.join(
        identityDirectory,
        identityFileName
      );

    
    const resumeBuffer =
      Buffer.from(
        await resume.arrayBuffer()
      );

   
    const identityBuffer =
      Buffer.from(
        await identityProof.arrayBuffer()
      );

    
    await fs.writeFile(
      resumeFilePath,
      resumeBuffer
    );

    
    await fs.writeFile(
      identityFilePath,
      identityBuffer
    );

   
    const resumePath =
      `/uploads/resumes/${resumeFileName}`;

    const identityProofPath =
      `/uploads/identity-proofs/${identityFileName}`;

    
    const updatedUser =
      await db.user.update({
        where: {
          id: decoded.userId,
        },

        data: {
         
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

          
          resumePath,

          identityProofPath,

          
          termsAccepted,
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
          "Onboarding completed successfully",

        user: updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    
    console.error(
      "Onboarding error:",
      error
    );

    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "Something went wrong while completing onboarding",
      },
      {
        status: 500,
      }
    );
  }
}