import type { Metadata } from "next";
import type { ReactNode } from "react";

// Shared-expense groups are private user data; keep them out of search.
export const metadata: Metadata = {
  title: "Split Expenses",
  robots: { index: false, follow: false },
};

export default function GroupsLayout({ children }: { children: ReactNode }) {
  return children;
}
