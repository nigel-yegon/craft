// app/contact/page.tsx
import type { Metadata } from "next";
import { PageHeader } from "../components/page-header";
import { ContactForm } from "../components/contact-form";

export const metadata: Metadata = { title: "Contact" };

const DETAILS = [
  { label: "Email", value: "studio@craft.studio" },
  { label: "Phone", value: "+254 (0) 700 000 000" },
  { label: "Studio", value: "Nairobi, Kenya" },
  { label: "Hours", value: "Mon–Fri · 09:00–17:00 EAT" },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Start a project.
            <br />
            <span className="text-brand-700 dark:text-brand-300">
              Or just say hello.
            </span>
          </>
        }
        lede="Tell us a bit about the work. We read every message and reply within two working days. No form-filling theatre."
      />

      <div className="mx-auto grid max-w-7xl gap-16 px-4 py-20 lg:grid-cols-[0.4fr_1fr] lg:gap-20 lg:px-8 lg:py-28">
        {/* Left: details */}
        <aside>
          <dl className="space-y-8">
            {DETAILS.map((d) => (
              <div key={d.label}>
                <dt className="text-[10px] font-mono uppercase tracking-[0.22em] text-deep-400 dark:text-cream-600">
                  {d.label}
                </dt>
                <dd className="mt-2 text-base text-deep-800 dark:text-cream-200">
                  {d.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 border-t border-deep-200 pt-8 dark:border-deep-800">
            <p className="text-sm leading-6 text-deep-600 dark:text-cream-400">
              For press, careers and general enquiries, use the same form and
              mark the topic in the first line — it routes internally either
              way.
            </p>
          </div>
        </aside>

        {/* Right: form */}
        <ContactForm />
      </div>
    </>
  );
}