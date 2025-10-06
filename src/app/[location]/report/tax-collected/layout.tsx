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
    title: `Tax Collected Report - ${formattedLocation} | SMW`,
    description: `View tax collected transactions and details for ${formattedLocation}.`,
    keywords: ['Tax Collected Report', 'Tax', 'Transactions', 'Financial', location],
    openGraph: {
      title: `${formattedLocation} Tax Collected Report`,
      description: `View tax collected transactions and details for ${formattedLocation}.`,
      type: 'website',
    },
  };
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return <div>{children}</div>;
}
