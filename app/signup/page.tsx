// app/signup/page.tsx
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(registerUser, null);

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-2xl border border-deep-200 bg-cream-50 p-8 dark:border-deep-800 dark:bg-deep-900">
        <h1 className="text-2xl font-semibold text-deep-900 dark:text-cream-100">
          Create an account
        </h1>
        <p className="mt-2 text-sm text-deep-500 dark:text-cream-400">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600 hover:underline dark:text-brand-400">
            Sign in
          </Link>
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-deep-700 dark:text-cream-300">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-deep-200 bg-cream-100 px-3 py-2 text-sm text-deep-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-deep-700 dark:bg-deep-950 dark:text-cream-100"
            />
            {state?.errors?.name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-deep-700 dark:text-cream-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-deep-200 bg-cream-100 px-3 py-2 text-sm text-deep-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-deep-700 dark:bg-deep-950 dark:text-cream-100"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-deep-700 dark:text-cream-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="mt-1 w-full rounded-lg border border-deep-200 bg-cream-100 px-3 py-2 text-sm text-deep-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-deep-700 dark:bg-deep-950 dark:text-cream-100"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.errors.password[0]}</p>
            )}
          </div>

          {state?.message && (
            <p className={`text-sm ${state.success ? "text-emerald-600" : "text-red-600"} dark:text-emerald-400`}>
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-500 dark:text-deep-900"
          >
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}