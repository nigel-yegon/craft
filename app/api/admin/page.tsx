// app/admin/notifications/page.tsx
import NotificationsClient from "./notifications-client";

export const metadata = {
  title: "Notifications — Admin",
};

export default function AdminNotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-deep-900 dark:text-cream-100">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-deep-500 dark:text-cream-500">
          Publish announcements, subscription reminders, and alerts to Craft
          POS devices.
        </p>
      </div>
      <NotificationsClient />
    </div>
  );
}