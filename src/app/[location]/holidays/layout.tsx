import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface HolidaysLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export async function generateMetadata({ params }: HolidaysLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Holidays - ${formattedLocation} | SMW`,
    description: `Browse and manage holidays for ${formattedLocation}.`,
    keywords: ["holidays", "holiday", "calendar", location],
    openGraph: {
      title: `${formattedLocation} Holidays`,
      description: `Holidays directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function HolidaysLayout({ children }: HolidaysLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}
