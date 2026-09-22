"use client";

import { usePathname } from "next/navigation";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useAuthStore } from "@/src/store/authStore";
import LogoutButton from "@/src/components/logoutButton";


interface DashboardLayoutProps {
  children: ReactNode;
}


export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const user = useAuthStore(
    (state) => state.user
  );

  const setUser = useAuthStore(
    (state) => state.setUser
  );

 
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (
          response.ok &&
          result.user
        ) {
          setUser(result.user);
        }
      } catch (error) {
        console.error(
          "Fetch current user error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setUser]);

  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

 
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />

          <p className="mt-3 text-sm text-slate-500">
            Loading...
          </p>

        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-slate-50">

      
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-64
          flex-col
          border-r
          bg-white
          transition-transform
          duration-200
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >

        
        <div className="flex h-16 shrink-0 items-center border-b px-6">

          <Link
            href="/dashboard"
            onClick={closeSidebar}
            className="text-xl font-bold text-slate-900"
          >
            UserPortal
          </Link>

        </div>

        
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">

          <SidebarLink
            href="/dashboard"
            label="Dashboard"
            active={pathname === "/dashboard"}
            onClick={closeSidebar}
          />

          <SidebarLink
            href="/profile"
            label="My Profile"
            active={pathname === "/profile"}
            onClick={closeSidebar}
          />

          <SidebarLink
            href="/onboarding"
            label="Onboarding"
            active={pathname.startsWith("/onboarding")}
            onClick={closeSidebar}
          />

          
          {(user?.role === "admin" ||
            user?.role === "manager") && (
            <SidebarLink
              href="/users"
              label="Users"
               active={pathname.startsWith("/users")}
              onClick={closeSidebar}
            />
          )}

        </nav>

       
        <div className="shrink-0 border-t bg-white p-4">

          {/* USER INFO */}

          <div className="mb-3">

            <p className="truncate text-sm font-semibold text-slate-900">
              {user?.name || "User"}
            </p>

            <p className="truncate text-xs text-slate-500">
              {user?.email || "-"}
            </p>

          </div>

          

          <Badge
            variant="secondary"
            className="mb-3 capitalize"
          >
            {user?.role || "staff"}
          </Badge>

          {/* LOGOUT */}

          <LogoutButton />

        </div>

      </aside>

      
      <div className="lg:pl-64">

        
        <header className="sticky top-0 z-30 border-b bg-white">

          <div className="flex h-16 items-center justify-between px-4 sm:px-6">

          

            <div className="flex items-center gap-3">

             

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() =>
                  setSidebarOpen(true)
                }
                aria-label="Open sidebar"
              >
                ☰
              </Button>

             

              <div>

                <p className="text-sm font-medium text-slate-500">
                  UserPortal
                </p>

                <p className="text-xs text-slate-400">
                  Manage your account
                </p>

              </div>

            </div>

           

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">

                <p className="text-sm font-medium text-slate-900">
                  {user?.name || "User"}
                </p>

                <p className="text-xs capitalize text-slate-500">
                  {user?.role || "staff"}
                </p>

              </div>

              

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {user?.name
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </div>

            </div>

          </div>

        </header>

       
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">

          {children}

        </main>

      </div>

    </div>
  );
}


interface SidebarLinkProps {
  href: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarLink({
  href,
  label,
  active = false,
  onClick,
}: SidebarLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex
        items-center
        rounded-lg
        px-4
        py-2.5
        text-sm
        font-medium
        text-slate-600
        transition
        hover:bg-slate-100
        hover:text-slate-900
        ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }
      `}
    >
      {label}
    </Link>
  );
}