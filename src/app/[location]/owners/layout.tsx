import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface OwnersLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>; 
}

export async function generateMetadata({ params }: OwnersLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Owners - ${formattedLocation} | SMW`,
    description: `Browse and manage owners for ${formattedLocation}.`,
    keywords: ["owners", "management", "staff", location],
    openGraph: {
      title: `${formattedLocation} Owners`,
      description: `Owners directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function OwnersLayout({ children }: OwnersLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}

