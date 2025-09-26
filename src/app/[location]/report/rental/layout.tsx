import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface RentalLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export async function generateMetadata({ params }: RentalLayoutProps): Promise<Metadata> {
  const { location } = await params;

  const formattedLocation = formatLocationName(location);
  
  return {
    title: `Rental Report - ${formattedLocation} | SMW`,
    description: `View and manage rental reports for ${formattedLocation} location. Track equipment rentals and returns.`,
    keywords: ['rental', 'report', 'equipment', 'rentals', 'returns', location],
    openGraph: {
      title: `${formattedLocation} Rental Report`,
      description: `Manage rental reports and track equipment for ${formattedLocation}`,
      type: 'website',
    },
  };
}

export default function RentalLayout({ children }: RentalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  );
}
