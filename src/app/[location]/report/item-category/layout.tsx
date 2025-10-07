import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface ReportLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export async function generateMetadata({ params }: ReportLayoutProps): Promise<Metadata> {
  const { location } = await params;

  const formattedLocation = formatLocationName(location);

  return {
    title: `Items Sold by Category - ${formattedLocation} | SMW`,
    description: `View items sold by category for ${formattedLocation}.`,
    keywords: ['Items Sold', 'Category Report', 'Sales Report', location],
    openGraph: {
      title: `${formattedLocation} Items Sold by Category`,
      description: `View items sold by category for ${formattedLocation}.`,
      type: 'website',
    },
  };
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return <div>{children}</div>;
}
