import { z } from "zod";


export const onboardingServerSchema = z.object({
  // Step 1 - General Information

  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),



  phone: z
    .string()
    .regex(
      /^[0-9]{10}$/,
      "Phone number must be 10 digits"
    ),

  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required"),

  gender: z
    .string()
    .min(1, "Gender is required"),

  address: z
    .string()
    .min(5, "Address must be at least 5 characters"),

  city: z
    .string()
    .min(2, "City is required"),

  state: z
    .string()
    .min(2, "State is required"),

  pincode: z
    .string()
    .regex(
      /^[0-9]{6}$/,
      "Pincode must be 6 digits"
    ),

  // Step 2 - Academic Information

  qualification: z
    .string()
    .min(2, "Qualification is required"),

  college: z
    .string()
    .min(2, "College is required"),

  course: z
    .string()
    .min(2, "Course is required"),

  department: z
    .string()
    .min(2, "Department is required"),

  graduationYear: z
    .string()
    .regex(
      /^[0-9]{4}$/,
      "Enter a valid graduation year"
    ),

  cgpa: z
    .string()
    .min(1, "CGPA is required"),

  tenthPercentage: z
    .string()
    .min(1, "10th percentage is required"),

  twelfthPercentage: z
    .string()
    .min(1, "12th percentage is required"),

  // Step 3 - Files
  // Server receives file names, not FileList

  resumePath: z
    .string()
    .min(1, "Resume is required"),

  identityProofPath: z
    .string()
    .min(1, "Identity proof is required"),

  termsAccepted: z
    .boolean()
    .refine(
      (value) => value === true,
      "You must accept the terms"
    ),
});

export type OnboardingServerData =
  z.infer<typeof onboardingServerSchema>;