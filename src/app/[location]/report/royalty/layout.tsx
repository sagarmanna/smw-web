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
    title: `Royalty Report - ${formattedLocation} | SMW`,
    description: `View royalty report for ${formattedLocation}.`,
    keywords: ['Royalty Report', location],
    openGraph: {
      title: `${formattedLocation} Royalty Report`,
      description: `View royalty report for ${formattedLocation}.`,
      type: 'website',
    },
  };
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return <div>{children}</div>;
}
