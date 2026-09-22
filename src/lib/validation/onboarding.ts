import { z } from "zod";


export const generalInformationSchema = z.object({
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
    .min(5, "Address is required"),

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
});


export const academicInformationSchema = z.object({
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
  .regex(
    /^(10|[0-9](\.[0-9]{1,2})?)$/,
    "Enter a valid CGPA"
  ),

  tenthPercentage: z
  .string()
  .regex(
    /^(100|[0-9]{1,2}(\.[0-9]{1,2})?)$/,
    "Enter a valid percentage"
  ),

twelfthPercentage: z
  .string()
  .regex(
    /^(100|[0-9]{1,2}(\.[0-9]{1,2})?)$/,
    "Enter a valid percentage"
  ),
});



const MAX_FILE_SIZE = 5 * 1024 * 1024;


const RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];


const IDENTITY_PROOF_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];


export const documentsVerificationSchema = z.object({

  
  resume: z
    .any()

    // Required
    .refine(
      (files) =>
        files instanceof FileList &&
        files.length > 0,
      "Resume is required"
    )

    // File type
    .refine(
      (files) =>
        files instanceof FileList &&
        files.length > 0 &&
        RESUME_TYPES.includes(
          files[0].type
        ),
      "Resume must be PDF, DOC or DOCX"
    )

    // File size
    .refine(
      (files) =>
        files instanceof FileList &&
        files.length > 0 &&
        files[0].size <= MAX_FILE_SIZE,
      "Resume must be less than 5 MB"
    ),

 
  identityProof: z
    .any()

    // Required
    .refine(
      (files) =>
        files instanceof FileList &&
        files.length > 0,
      "Identity proof is required"
    )

    // File type
    .refine(
      (files) =>
        files instanceof FileList &&
        files.length > 0 &&
        IDENTITY_PROOF_TYPES.includes(
          files[0].type
        ),
      "Identity proof must be PDF, JPG or PNG"
    )

    // File size
    .refine(
      (files) =>
        files instanceof FileList &&
        files.length > 0 &&
        files[0].size <= MAX_FILE_SIZE,
      "Identity proof must be less than 5 MB"
    ),

 
  termsAccepted: z
    .boolean()
    .refine(
      (value) => value === true,
      "You must accept the terms"
    ),
});


export const onboardingSchema =
  generalInformationSchema
    .merge(academicInformationSchema)
    .merge(documentsVerificationSchema);


export type OnboardingFormData =
  z.infer<typeof onboardingSchema>;