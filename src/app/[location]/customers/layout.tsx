import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface CustomersLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>; 
}

export async function generateMetadata({ params }: CustomersLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Customers - ${formattedLocation} | SMW`,
    description: `Browse and manage customers for ${formattedLocation}.`,
    keywords: ["customers", "contacts", "balances", location],
    openGraph: {
      title: `${formattedLocation} Customers`,
      description: `Customers directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function CustomersLayout({ children }: CustomersLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div>
        {children}
      </div>
    </div>
  );
}


