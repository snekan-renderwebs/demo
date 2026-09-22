"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useAuthStore } from "@/src/store/authStore";

import { useQuery } from "@tanstack/react-query";


interface DashboardUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  qualification: string | null;
  termsAccepted: boolean;
  createdAt: string;
}

interface DashboardResponse {
  statistics?: {
    totalUsers: number;
    adminCount: number;
    managerCount: number;
    staffCount: number;
    completedOnboarding: number;
    pendingOnboarding: number;
  };

  recentUsers?: DashboardUser[];

  message?: string;
}


async function fetchDashboard(): Promise<DashboardResponse> {
  const response = await fetch(
    "/api/dashboard",
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load dashboard"
    );
  }

  return data;
}


export default function DashboardPage() {

  
  const user = useAuthStore(
    (state) => state.user
  );

  
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  
  const statistics =
    data?.statistics;

  const recentUsers =
    data?.recentUsers ?? [];

  const formatDate = (
    value: string
  ) => {

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
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

  
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />

          <p className="mt-3 text-sm text-slate-500">
            Loading dashboard...
          </p>

        </div>

      </div>
    );
  }

  
  if (isError) {
    return (
      <div className="mx-auto max-w-7xl">

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">

          <p className="text-sm font-medium text-red-700">
            {error instanceof Error
              ? error.message
              : "Failed to load dashboard"}
          </p>

        </div>

      </div>
    );
  }

  
  return (
    <div className="mx-auto max-w-7xl">

      

      <section className="mb-8">

        <p className="text-sm font-medium text-slate-500">
          Overview
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome,{" "}
          {user?.name || "User"} 👋
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Manage your profile, onboarding information
          and users from one place.
        </p>

      </section>

      
      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatItem
          title="Total Users"
          value={
            statistics?.totalUsers ?? 0
          }
          description="Registered users"
        />

        <StatItem
          title="Admins"
          value={
            statistics?.adminCount ?? 0
          }
          description="Administrator accounts"
        />

        <StatItem
          title="Managers"
          value={
            statistics?.managerCount ?? 0
          }
          description="Manager accounts"
        />

        <StatItem
          title="Staff"
          value={
            statistics?.staffCount ?? 0
          }
          description="Staff accounts"
        />

      </section>

     
      <section className="mb-8">

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-slate-900">
            Onboarding
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current onboarding status.
          </p>

        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          

          <div className="rounded-xl border bg-white p-5">

            <p className="text-sm font-medium text-slate-500">
              Completed
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {
                statistics
                  ?.completedOnboarding ??
                0
              }
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Users who completed onboarding
            </p>

          </div>

          

          <div className="rounded-xl border bg-white p-5">

            <p className="text-sm font-medium text-slate-500">
              Pending
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {
                statistics
                  ?.pendingOnboarding ??
                0
              }
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Users with pending onboarding
            </p>

          </div>

        </div>

      </section>

      <section className="mb-8">

        <div className="mb-4">

          <h2 className="text-lg font-semibold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Quickly access important sections.
          </p>

        </div>

        <div className="grid gap-4 md:grid-cols-3">

          

          <ActionItem
            title="View Profile"
            description="View your complete personal and academic information."
            href="/profile"
          />

          

          <ActionItem
            title="Complete Onboarding"
            description="Update your general, academic and document information."
            href="/onboarding"
          />

          

          {(user?.role === "admin" ||
            user?.role === "manager") && (

            <ActionItem
              title="Manage Users"
              description="View and manage users according to your role."
              href="/users"
            />

          )}

        </div>

      </section>

      {(user?.role === "admin" ||
        user?.role === "manager") && (

        <section>

          

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Recent Users
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recently registered users.
              </p>

            </div>

            <Link href="/users">

              <Button
                variant="outline"
                size="sm"
              >
                View All
              </Button>

            </Link>

          </div>

          

          <div className="overflow-hidden rounded-xl border bg-white">

            {recentUsers.length === 0 ? (

              <div className="p-8 text-center">

                <p className="font-medium text-slate-700">
                  No users found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Recently registered users
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="divide-y">

                {recentUsers.map(
                  (recentUser) => (

                    <div
                      key={
                        recentUser.id
                      }
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >

                      

                      <div>

                        <p className="font-medium text-slate-900">
                          {
                            recentUser.name
                          }
                        </p>

                        <p className="text-sm text-slate-500">
                          {
                            recentUser.email
                          }
                        </p>

                      </div>

                      

                      <div className="flex items-center gap-4">

                        <Badge
                          variant="secondary"
                          className="capitalize"
                        >
                          {
                            recentUser.role
                          }
                        </Badge>

                        <span className="text-xs text-slate-400">
                          {formatDate(
                            recentUser.createdAt
                          )}
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>

      )}

    </div>
  );
}


interface StatItemProps {
  title: string;
  value: number;
  description: string;
}

function StatItem({
  title,
  value,
  description,
}: StatItemProps) {

  return (
    <div className="rounded-xl border bg-white p-5">

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}


interface ActionItemProps {
  title: string;
  description: string;
  href: string;
}

function ActionItem({
  title,
  description,
  href,
}: ActionItemProps) {

  return (
    <div className="rounded-xl border bg-white p-5 transition hover:border-slate-400 hover:shadow-sm">

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
        {description}
      </p>

      <Link
        href={href}
        className="mt-4 inline-flex text-sm font-semibold text-slate-900 hover:underline"
      >
        Open →
      </Link>

    </div>
  );
}