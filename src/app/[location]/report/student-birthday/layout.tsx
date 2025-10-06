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
    title: `Student Birthdays - ${formattedLocation} | SMW`,
    description: `View upcoming student birthdays for ${formattedLocation}.`,
    keywords: ['Student Birthdays', 'Birthday Report', 'Upcoming Birthdays', location],
    openGraph: {
      title: `${formattedLocation} Student Birthdays`,
      description: `View upcoming student birthdays for ${formattedLocation}.`,
      type: 'website',
    },
  };
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return <div>{children}</div>;
}
