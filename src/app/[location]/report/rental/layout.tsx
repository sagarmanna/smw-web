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
    title: `Rental Report - ${formattedLocation} | SMW`,
    description: `View and manage equipment rentals for ${formattedLocation}.`,
    keywords: ['Rental Report', 'Equipment Rental', 'Manage Rentals', location],
    openGraph: {
      title: `${formattedLocation} Rental Report`,
      description: `View and manage equipment rentals for ${formattedLocation}.`,
      type: 'website',
    },
  };
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return <div>{children}</div>;
}
