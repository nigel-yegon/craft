// app/admin/actions/journal-constants.ts
// ⚠️ NO "use server" here. This is a plain module.
// Both the server actions file and the client form import from here.

export const JOURNAL_CATEGORIES = [
  "STUDIO",
  "PROCESS",
  "TECH",
  "CASE_STUDY",
  "CULTURE",
  "ANNOUNCEMENT",
] as const;

export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number];