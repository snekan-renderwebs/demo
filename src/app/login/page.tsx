"use client";

import { useAuthStore } from "../../store/authStore";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const setUser = useAuthStore(
    (state) => state.setUser
  );

  async function handleLogin(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {


      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();


      if (!response.ok) {
        setMessage(
          data.message || "Invalid email or password"
        );
        return;
      }



      const meResponse = await fetch(
        "/api/auth/me",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const meData =
        await meResponse.json();

      
      if (!meResponse.ok) {
        setMessage(
          meData.message ||
            "Failed to get user information"
        );
        return;
      }

      
      setUser(meData.user);

      
      router.push("/dashboard");
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">

      
      <div className="hidden w-1/2 bg-slate-900 lg:flex">

        <div className="flex w-full flex-col justify-between p-12 text-white">

          {/* BRAND */}

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-slate-900">
                U
              </div>

              <span className="text-xl font-bold">
                UserPortal
              </span>

            </div>
          </div>

          {/* CENTER CONTENT */}

          <div className="max-w-lg">

            <p className="mb-3 text-sm font-medium text-slate-400">
              USER MANAGEMENT PLATFORM
            </p>

            <h1 className="text-4xl font-bold leading-tight">
              Manage your profile,
              onboarding and account
              information in one place.
            </h1>

            <p className="mt-5 text-base leading-7 text-slate-400">
              A simple and secure platform for
              managing user information,
              academic details and onboarding.
            </p>

          </div>

          {/* FOOTER */}

          <p className="text-sm text-slate-500">
            © 2026 UserPortal
          </p>

        </div>

      </div>

      
      <div className="flex w-full items-center justify-center px-5 py-10 lg:w-1/2">

        <div className="w-full max-w-md">

          {/* MOBILE BRAND */}

          <div className="mb-8 text-center lg:hidden">

            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
              U
            </div>

            <h1 className="text-xl font-bold text-slate-900">
              UserPortal
            </h1>

          </div>

          {/* LOGIN CARD */}

          <div className="rounded-2xl border bg-white p-7 shadow-sm sm:p-9">

            {/* HEADER */}

            <div className="mb-8">

              <h2 className="text-2xl font-bold text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to access your account.
              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  required
                  autoComplete="email"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                  autoComplete="current-password"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />

              </div>

              {/* ERROR / MESSAGE */}

              {message && (
                <div
                  className={`rounded-lg border px-3 py-2.5 text-sm ${
                    message
                      .toLowerCase()
                      .includes("successful")
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </button>

            </form>

            {/* INFO */}

            <div className="mt-7 border-t pt-5">

              <p className="text-center text-xs leading-5 text-slate-400">
                Access is provided by your
                administrator. If you don't have
                an account, contact your
                administrator.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}