import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .email("Enter a valid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),

  phone: z
    .string()
    .regex(
      /^[0-9]{10}$/,
      "Phone must be 10 digits"
    ),

  role: z.enum([
    "admin",
    "manager",
    "staff",
  ]),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  email: z
    .string()
    .email("Enter a valid email"),

  phone: z
    .string()
    .regex(
      /^[0-9]{10}$/,
      "Phone must be 10 digits"
    ),

  role: z.enum([
    "admin",
    "manager",
    "staff",
  ]),
});