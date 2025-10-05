import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SMW",
  robots: { index: false, follow: false },
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}


