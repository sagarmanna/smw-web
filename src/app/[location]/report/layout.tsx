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
    title: `Report - ${formattedLocation} | SMW`,
    description: `Report for ${location} location`,
    keywords: ['Report', 'admin', 'management', location],
    openGraph: {
      title: `${formattedLocation} Report`,
      description: `the report for ${location} location`,
      type: 'website',
    },
  };
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return <div>{children}</div>;
}

