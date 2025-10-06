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
    title: `Royalty Free Items Report - ${formattedLocation} | SMW`,
    description: `View royalty free items and transactions for ${formattedLocation}.`,
    keywords: ['Royalty Free Items Report', 'Transactions', 'Royalty Free', 'Items', location],
    openGraph: {
      title: `${formattedLocation} Royalty Free Items Report`,
      description: `View royalty free items and transactions for ${formattedLocation}.`,
      type: 'website',
    },
  };
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return <div>{children}</div>;
}
