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
    title: `Items Report - ${formattedLocation} | SMW`,
    description: `View items and transactions for ${formattedLocation}.`,
    keywords: ['Items Report', 'Transactions', 'Lessons', 'Items', location],
    openGraph: {
      title: `${formattedLocation} Items Report`,
      description: `View items and transactions for ${formattedLocation}.`,
      type: 'website',
    },
  };
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return <div>{children}</div>;
}
