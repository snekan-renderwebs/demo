"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { createUserSchema } from "@/src/lib/validation/user";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ==================================================
// FORM TYPE
// ==================================================

type CreateUserFormData =
  z.infer<typeof createUserSchema>;


interface CreateUserResponse {
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
  };

  message?: string;
}


export default function CreateUserPage() {

  const router = useRouter();
 const queryClient =
    useQueryClient();


  const [apiError, setApiError] =
    useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(
      createUserSchema
    ),

    mode: "onTouched",

    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "staff",
    },
  });


  const createUserMutation =
    useMutation<
      CreateUserResponse,
      Error,
      CreateUserFormData
    >({

      mutationFn: async (
        data: CreateUserFormData
      ) => {

        const response =
          await fetch(
            "/api/users",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials: "include",

              body:
                JSON.stringify(data),
            }
          );

        const result =
          await response.json();

        
        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to create user"
          );
        }

        return result;
      },

      
      onSuccess: () => {

        
        queryClient.invalidateQueries({
          queryKey: ["users"],
        });

        
        router.push("/users");
      },

     
      onError: (error) => {

        console.error(
          "Create user error:",
          error
        );

        setApiError(
          error.message ||
            "Something went wrong while creating the user."
        );
      },
    });

 
  const onSubmit = (
    data: CreateUserFormData
  ) => {

    setApiError("");

    createUserMutation.mutate(
      data
    );
  };

 
  const submitting =
    createUserMutation.isPending;


  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mx-auto max-w-3xl">

       
        <div className="mb-8">

          

          <div className="mb-5">

            <Link href="/users">

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={submitting}
              >
                ← Back to Users
              </Button>

            </Link>

          </div>

          

          <h1 className="text-3xl font-bold text-slate-900">
            Create User
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a new user account.
          </p>

        </div>

        
        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="border bg-white p-6 shadow-sm"
        >

          <div>

            <div className="mb-6 border-b pb-5">

              <h2 className="text-xl font-semibold text-slate-900">
                User Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the account details below.
              </p>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              
              <div className="space-y-2">

                <Label htmlFor="name">
                  Full Name
                </Label>

                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  {...register("name")}
                  disabled={submitting}
                />

                {errors.name && (
                  <p className="text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}

              </div>

              <div className="space-y-2">

                <Label htmlFor="email">
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  {...register("email")}
                  disabled={submitting}
                />

                {errors.email && (
                  <p className="text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}

              </div>

              
              <div className="space-y-2">

                <Label htmlFor="password">
                  Password
                </Label>

                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  {...register("password")}
                  disabled={submitting}
                />

                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}

              </div>

             
              <div className="space-y-2">

                <Label htmlFor="phone">
                  Phone Number
                </Label>

                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10 digit phone number"
                  {...register("phone")}
                  disabled={submitting}
                />

                {errors.phone && (
                  <p className="text-sm text-red-500">
                    {errors.phone.message}
                  </p>
                )}

              </div>

              <div className="space-y-2 md:col-span-2">

                <Label htmlFor="role">
                  Role
                </Label>

                <select
                  id="role"
                  {...register("role")}
                  disabled={submitting}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <option value="staff">
                    Staff
                  </option>

                  <option value="manager">
                    Manager
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                </select>

                {errors.role && (
                  <p className="text-sm text-red-500">
                    {errors.role.message}
                  </p>
                )}

              </div>

            </div>

          </div>

          
          {apiError && (

            <div className="mt-6 border border-red-200 bg-red-50 p-4">

              <p className="text-sm font-medium text-red-700">
                {apiError}
              </p>

            </div>

          )}

          
          <div className="mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">

            
            <Link href="/users">

              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>

            </Link>

           
            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto"
            >

              {submitting
                ? "Creating..."
                : "Create User"}

            </Button>

          </div>

        </form>

      </div>

    </div>
  );
}