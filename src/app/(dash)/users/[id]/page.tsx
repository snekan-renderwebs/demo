"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;

  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;

  qualification: string | null;
  college: string | null;
  course: string | null;
  department: string | null;
  graduationYear: string | null;
  cgpa: string | null;
  tenthPercentage: string | null;
  twelfthPercentage: string | null;

  resumePath: string | null;
  identityProofPath: string | null;
  termsAccepted: boolean;

  createdAt: string;
  updatedAt: string;
}


interface UserResponse {
  user?: User;
  message?: string;
}


async function fetchUser(
  id: string
): Promise<User> {
  const response = await fetch(
    `/api/users/${id}`,
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
      "User not found"
    );
  }

  return result.user;
}


export default function UserDetailsPage() {

  const params = useParams();

  const id = params.id as string;


  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user", id],

    queryFn: () => fetchUser(id),

    enabled: !!id,

    staleTime: 1000 * 60 * 5,
  });


  const formatDate = (
    value: string | null
  ) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  const getRoleBadge = (
    role: string
  ) => {
    switch (
      role.toLowerCase()
    ) {
      case "admin":
        return (
          <Badge variant="destructive">
            Admin
          </Badge>
        );

      case "manager":
        return (
          <Badge>
            Manager
          </Badge>
        );

      case "staff":
        return (
          <Badge variant="secondary">
            Staff
          </Badge>
        );

      default:
        return (
          <Badge variant="outline">
            {role}
          </Badge>
        );
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">

          <Link
            href="/users"
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            ← Back to Users
          </Link>

          <div className="mt-8">
            <p className="text-slate-500">
              Loading user details...
            </p>
          </div>

        </div>
      </div>
    );
  }


  if (isError || !user) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">

          <Link
            href="/users"
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            ← Back to Users
          </Link>

          <div className="mt-8 border border-red-200 bg-red-50 p-5">

            <p className="font-medium text-red-700">
              {error instanceof Error
                ? error.message
                : "User not found"}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
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

      <div className="mx-auto max-w-6xl">

      
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <Link
              href="/users"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
            >
              <span className="text-xl">
                ←
              </span>

              <span>
                Back to Users
              </span>
            </Link>

            <h1 className="mt-5 text-3xl font-bold text-slate-900">
              User Details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View complete user information.
            </p>

          </div>

          {/* EDIT */}

          <Link
            href={`/users/${user.id}/edit`}
          >
            <Button>
              Edit User
            </Button>
          </Link>

        </div>

    
        <Card className="mb-6">

          <CardHeader>
            <CardTitle>
              Basic Information
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                label="Name"
                value={user.name}
              />

              <InfoItem
                label="Email"
                value={user.email}
              />

              <InfoItem
                label="Phone"
                value={user.phone}
              />

              <div>
                <p className="text-sm text-slate-500">
                  Role
                </p>

                <div className="mt-2">
                  {getRoleBadge(
                    user.role
                  )}
                </div>
              </div>

              <InfoItem
                label="Date of Birth"
                value={formatDate(
                  user.dateOfBirth
                )}
              />

              <InfoItem
                label="Gender"
                value={user.gender}
              />

            </div>

          </CardContent>

        </Card>

 
        <Card className="mb-6">

          <CardHeader>
            <CardTitle>
              Address Information
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

              <div className="md:col-span-2">

                <InfoItem
                  label="Address"
                  value={user.address}
                />

              </div>

              <InfoItem
                label="City"
                value={user.city}
              />

              <InfoItem
                label="State"
                value={user.state}
              />

              <InfoItem
                label="Pincode"
                value={user.pincode}
              />

            </div>

          </CardContent>

        </Card>

        <Card className="mb-6">

          <CardHeader>
            <CardTitle>
              Academic Information
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              <InfoItem
                label="Qualification"
                value={user.qualification}
              />

              <InfoItem
                label="College"
                value={user.college}
              />

              <InfoItem
                label="Course"
                value={user.course}
              />

              <InfoItem
                label="Department"
                value={user.department}
              />

              <InfoItem
                label="Graduation Year"
                value={
                  user.graduationYear
                }
              />

              <InfoItem
                label="CGPA"
                value={user.cgpa}
              />

              <InfoItem
                label="10th Percentage"
                value={
                  user.tenthPercentage
                    ? `${user.tenthPercentage}%`
                    : null
                }
              />

              <InfoItem
                label="12th Percentage"
                value={
                  user.twelfthPercentage
                    ? `${user.twelfthPercentage}%`
                    : null
                }
              />

            </div>

          </CardContent>

        </Card>

      
        <Card className="mb-6">

          <CardHeader>
            <CardTitle>
              Documents & Verification
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="grid gap-6 md:grid-cols-2">

              <InfoItem
                label="Resume"
                value={
                  user.resumePath
                    ? "Uploaded"
                    : "Not uploaded"
                }
              />

              <InfoItem
                label="Identity Proof"
                value={
                  user.identityProofPath
                    ? "Uploaded"
                    : "Not uploaded"
                }
              />

              <InfoItem
                label="Terms Accepted"
                value={
                  user.termsAccepted
                    ? "Yes"
                    : "No"
                }
              />

            </div>

          </CardContent>

        </Card>

        
        <Card>

          <CardHeader>
            <CardTitle>
              Account Information
            </CardTitle>
          </CardHeader>

          <CardContent>

            <div className="grid gap-6 md:grid-cols-2">

              <InfoItem
                label="Created At"
                value={formatDate(
                  user.createdAt
                )}
              />

              <InfoItem
                label="Last Updated"
                value={formatDate(
                  user.updatedAt
                )}
              />

            </div>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}


function InfoItem({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | null
    | undefined;
}) {
  return (
    <div>

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-medium text-slate-900">
        {value || "-"}
      </p>

    </div>
  );
}