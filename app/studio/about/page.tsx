// app/studio/about/page.tsx
import type { Metadata } from "next";
import { PageHeader } from "../../components/page-header";
export const metadata: Metadata = { title: "About" };
export default function Page() {
  return <PageHeader eyebrow="Studio" title="About" lede="More detail on the studio is being written. This page is a placeholder." />;
}