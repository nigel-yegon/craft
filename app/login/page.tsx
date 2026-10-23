// app/login/page.tsx
"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-2xl border border-deep-200 bg-cream-50 p-8 dark:border-deep-800 dark:bg-deep-900">
        <h1 className="text-2xl font-semibold text-deep-900 dark:text-cream-100">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-deep-500 dark:text-cream-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-brand-600 hover:underline dark:text-brand-400"
          >
            Create one
          </Link>
        </p>

        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Default destination after sign-in is the admin dashboard.
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-deep-700 dark:text-cream-300"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-deep-200 bg-cream-100 px-3 py-2 text-sm text-deep-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-deep-700 dark:bg-deep-950 dark:text-cream-100"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-deep-700 dark:text-cream-300"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded-lg border border-deep-200 bg-cream-100 px-3 py-2 text-sm text-deep-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-deep-700 dark:bg-deep-950 dark:text-cream-100"
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-500 dark:text-deep-900"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-hidden>
      <div className="h-16 animate-pulse rounded-lg bg-cream-200 dark:bg-deep-800" />
      <div className="h-16 animate-pulse rounded-lg bg-cream-200 dark:bg-deep-800" />
      <div className="h-10 animate-pulse rounded-lg bg-cream-200 dark:bg-deep-800" />
    </div>
  );
}