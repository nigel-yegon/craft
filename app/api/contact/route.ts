// app/contact/contact-form.tsx
"use client";

import { useState } from "react";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);

    const data = new FormData(e.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setErrors(body.errors ?? ["Something went wrong. Try again."]);
      setSubmitting(false);
      return;
    }

    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-deep-200 bg-cream-50 p-8 dark:border-deep-800 dark:bg-deep-900">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-accent-mint"
          />
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-deep-500 dark:text-cream-400">
            Received
          </p>
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-deep-900 dark:text-cream-100">
          Message sent.
        </h2>
        <p className="mt-3 text-sm leading-6 text-deep-600 dark:text-cream-400">
          Thanks — we'll reply within two working days. If it's urgent, the
          phone number on the left is the fastest route.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <fieldset disabled={submitting} className="space-y-4">
        <legend className="sr-only">Your details</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="name" label="Name" required autoComplete="name" />
          <Field
            name="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
          />
        </div>

        <Field
          name="company"
          label="Company or project"
          hint="Optional — helps us route the message."
        />

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-deep-700 dark:text-cream-300">
            Message
            <span
              className="ml-1 text-brand-600 dark:text-brand-400"
              aria-hidden="true"
            >
              *
            </span>
          </span>
          <textarea
            name="message"
            required
            rows={6}
            placeholder="What are you trying to build, and where are you starting from?"
            className="w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm text-deep-800 outline-none transition placeholder:text-deep-400 focus:border-brand-500 focus:bg-cream-50 focus:ring-2 focus:ring-brand-500/15 dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100 dark:placeholder:text-cream-500 dark:focus:border-brand-500 dark:focus:bg-deep-950"
          />
        </label>
      </fieldset>

      {errors.length > 0 && (
        <ul
          role="alert"
          className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
        >
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-md bg-deep-800 px-5 py-3 text-sm font-medium text-cream-100 transition hover:bg-brand-700 disabled:opacity-60 dark:bg-brand-500 dark:text-deep-900 dark:hover:bg-accent-mint"
      >
        {submitting ? "Sending…" : "Send message"}
        <span aria-hidden>→</span>
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  autoComplete,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-deep-700 dark:text-cream-300">
        {label}
        {required && (
          <span
            className="ml-1 text-brand-600 dark:text-brand-400"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-deep-200 bg-cream-100 px-3.5 py-3 text-sm text-deep-800 outline-none transition placeholder:text-deep-400 focus:border-brand-500 focus:bg-cream-50 focus:ring-2 focus:ring-brand-500/15 dark:border-deep-800 dark:bg-deep-950 dark:text-cream-100 dark:placeholder:text-cream-500 dark:focus:border-brand-500 dark:focus:bg-deep-950"
      />
      {hint && (
        <span className="mt-1 block text-xs text-deep-500 dark:text-cream-500">
          {hint}
        </span>
      )}
    </label>
  );
}