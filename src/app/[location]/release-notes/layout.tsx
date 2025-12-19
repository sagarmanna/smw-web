import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface ReleaseNotesLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export async function generateMetadata({ params }: ReleaseNotesLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Release Notes - ${formattedLocation} | SMW`,
    description: `Browse and manage Release Notes for ${formattedLocation}.`,
    keywords: ["Release Notes", "releases", "updates", location],
    openGraph: {
      title: `${formattedLocation} Release Notes`,
      description: `Release Notes directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function ReleaseNotesLayout({ children }: ReleaseNotesLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}

