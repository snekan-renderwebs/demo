"use client";

import {
  useEffect,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  updateUserSchema,
} from "@/src/lib/validation/user";

import type {
  z,
} from "zod";

import {
  useAuthStore,
} from "@/src/store/authStore";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type UpdateUserFormData =
  z.infer<typeof updateUserSchema>;


interface User {
  id: string;

  name: string;

  email: string;

  phone: string | null;

  role:
    | "admin"
    | "manager"
    | "staff";

  createdAt: string;

  updatedAt: string;
}


interface UserResponse {
  user?: User;

  message?: string;
}


async function fetchUser(
  userId: string
): Promise<User> {

  const response =
    await fetch(
      `/api/users/${userId}`,
      {
        method: "GET",

        credentials: "include",

        cache: "no-store",
      }
    );

  const result: UserResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to fetch user"
    );
  }

  if (!result.user) {
    throw new Error(
      "User data not found"
    );
  }

  return result.user;
}


async function updateUser(
  userId: string,
  data: UpdateUserFormData
): Promise<User> {

  const response =
    await fetch(
      `/api/users/${userId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials: "include",

        body: JSON.stringify(data),
      }
    );

  const result: UserResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to update user"
    );
  }

  if (!result.user) {
    throw new Error(
      "Updated user data not found"
    );
  }

  return result.user;
}


export default function EditUserPage() {

  
  const router =
    useRouter();

  const params =
    useParams();

  const userId =
    typeof params.id === "string"
      ? params.id
      : "";

  
  const queryClient =
    useQueryClient();

  
  const currentUser =
    useAuthStore(
      (state) => state.user
    );

  
  const {
    register,

    handleSubmit,

    setValue,

    reset,

    formState: {
      errors,
    },
  } =
    useForm<UpdateUserFormData>({
      resolver:
        zodResolver(
          updateUserSchema
        ),

      defaultValues: {
        name: "",

        email: "",

        phone: "",

        role: "staff",
      },
    });

  
  const {
    data: user,

    isLoading,

    isError,

    error,

    refetch,
  } =
    useQuery({
      queryKey: [
        "user",
        userId,
      ],

      queryFn: () =>
        fetchUser(userId),

      enabled:
        Boolean(userId),

      staleTime:
        1000 * 60 * 5,
    });

  
  useEffect(() => {

    if (!user) {
      return;
    }

    reset({
      name:
        user.name,

      email:
        user.email,

      phone:
        user.phone || "",

      role:
        user.role,
    });

  }, [
    user,
    reset,
  ]);

 
  const {
    mutate:
      updateUserMutation,

    isPending:
      saving,

    isError:
      isUpdateError,

    error:
      updateError,

    isSuccess:
      isUpdateSuccess,
  } =useMutation({
      mutationFn: (
        data: UpdateUserFormData
      ) =>
        updateUser(
          userId,
          data
        ),

      onSuccess: (
        updatedUser
      ) => {  queryClient.setQueryData(
          [
            "user",
            userId,
          ],
          updatedUser
        );

       
        queryClient.invalidateQueries({
          queryKey: [
            "users",
          ],
        });

        
        router.push(
          "/users"
        );
      },
    });

 
  const onSubmit = (
    data: UpdateUserFormData
  ) => {

    updateUserMutation(
      data
    );
  };

 
  if (isLoading) {

    return (
      <div className="min-h-screen bg-slate-50 p-6">

        <div className="mx-auto max-w-3xl">

          <Button
            type="button"
            variant="ghost"
            className="mb-4 px-0"
            onClick={() =>
              router.push(
                "/users"
              )
            }
          >
            ← Back to Users
          </Button>

          <p className="text-sm text-slate-500">
            Loading user...
          </p>

        </div>

      </div>
    );
  }

 
  if (
    isError ||
    !user
  ) {

    return (
      <div className="min-h-screen bg-slate-50 p-6">

        <div className="mx-auto max-w-3xl">

          <Button
            type="button"
            variant="ghost"
            className="mb-4 px-0"
            onClick={() =>
              router.push(
                "/users"
              )
            }
          >
            ← Back to Users
          </Button>

          <div className="border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-medium text-red-700">
              {error instanceof Error
                ? error.message
                : "Failed to fetch user"}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() =>
                refetch()
              }
            >
              Try Again
            </Button>

          </div>

        </div>

      </div>
    );
  }

 
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="mx-auto max-w-3xl">

        
        <div className="mb-8">

          <Button
            type="button"
            variant="ghost"
            className="mb-4 px-0"
            onClick={() =>
              router.push(
                "/users"
              )
            }
          >
            ← Back to Users
          </Button>

          <h1 className="text-3xl font-bold text-slate-900">
            Edit User
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Update user account information.
          </p>

        </div>

        
        {isUpdateError && (
          <div className="mb-6 border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-medium text-red-700">
              {updateError instanceof Error
                ? updateError.message
                : "Failed to update user"}
            </p>

          </div>
        )}

       
        {isUpdateSuccess && (
          <div className="mb-6 border border-green-200 bg-green-50 p-4">

            <p className="text-sm font-medium text-green-700">
              User updated successfully
            </p>

          </div>
        )}

        
        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="border bg-white p-6 shadow-sm"
        >

          
          <div className="mb-8">

            <h2 className="text-xl font-semibold text-slate-900">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the user's basic account details.
            </p>

          </div>

          <div className="space-y-6">

           
            <div className="space-y-2">

              <Label htmlFor="name">
                Name
              </Label>

              <Input
                id="name"
                placeholder="Enter name"
                {...register(
                  "name"
                )}
                disabled={saving}
              />

              {errors.name && (
                <p className="text-sm text-red-500">
                  {
                    errors.name
                      .message
                  }
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
                placeholder="Enter email"
                {...register(
                  "email"
                )}
                disabled={saving}
              />

              {errors.email && (
                <p className="text-sm text-red-500">
                  {
                    errors.email
                      .message
                  }
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
                placeholder="Enter 10 digit phone number"
                {...register(
                  "phone"
                )}
                disabled={saving}
              />

              {errors.phone && (
                <p className="text-sm text-red-500">
                  {
                    errors.phone
                      .message
                  }
                </p>
              )}

            </div>

           
            <div className="space-y-2">

              <Label htmlFor="role">
                Role
              </Label>

              <Select
                value={user.role}
                onValueChange={(
                  value
                ) =>
                  setValue(
                    "role",
                    value as UpdateUserFormData["role"],
                    {
                      shouldValidate:
                        true,

                      shouldDirty:
                        true,
                    }
                  )
                }
                disabled={
                  saving ||
                  currentUser?.role ===
                    "manager"
                }
              >

                <SelectTrigger
                  id="role"
                  className="w-full"
                >

                  <SelectValue placeholder="Select role" />

                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="admin">
                    Admin
                  </SelectItem>

                  <SelectItem value="manager">
                    Manager
                  </SelectItem>

                  <SelectItem value="staff">
                    Staff
                  </SelectItem>

                </SelectContent>

              </Select>

              {currentUser?.role ===
                "manager" && (
                <p className="text-xs text-slate-500">
                  Managers cannot change user roles.
                </p>
              )}

              {errors.role && (
                <p className="text-sm text-red-500">
                  {
                    errors.role
                      .message
                  }
                </p>
              )}

            </div>

          </div>

         
          <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(
                  "/users"
                )
              }
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </Button>

          </div>

        </form>

      </div>

    </div>
  );
}