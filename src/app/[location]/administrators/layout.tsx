import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface AdministratorsLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>; 
}

export async function generateMetadata({ params }: AdministratorsLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Administrators - ${formattedLocation} | SMW`,
    description: `Browse and manage administrators for ${formattedLocation}.`,
    keywords: ["administrators", "admin", "staff", location],
    openGraph: {
      title: `${formattedLocation} Administrators`,
      description: `Administrators directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function AdministratorsLayout({ children }: AdministratorsLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}

