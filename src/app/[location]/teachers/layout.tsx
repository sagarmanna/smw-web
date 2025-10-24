import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface TeachersLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>; 
}

export async function generateMetadata({ params }: TeachersLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Teachers - ${formattedLocation} | SMW`,
    description: `Browse and manage teachers for ${formattedLocation}.`,
    keywords: ["teachers", "instructors", "staff", location],
    openGraph: {
      title: `${formattedLocation} Teachers`,
      description: `Teachers directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function TeachersLayout({ children }: TeachersLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}
