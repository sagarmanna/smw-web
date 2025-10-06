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
    title: `Payments Report - ${formattedLocation} | SMW`,
    description: `View and export payment records for ${formattedLocation}.`,
    keywords: ['Payments Report', 'Payment History', 'Transactions', location],
    openGraph: {
      title: `${formattedLocation} Payments Report`,
      description: `View and export payment records for ${formattedLocation}.`,
      type: 'website',
    },
  };
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return <div>{children}</div>;
}
