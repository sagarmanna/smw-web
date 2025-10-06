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
    title: `All Locations Report - ${formattedLocation} | SMW`,
    description: `View statistics and financial data for all locations.`,
    keywords: ['All Locations', 'Financial Report', 'Location Stats', location],
    openGraph: {
      title: `${formattedLocation} - All Locations Report`,
      description: `View statistics and financial data for all locations.`,
      type: 'website',
    },
  };
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return <div>{children}</div>;
}
