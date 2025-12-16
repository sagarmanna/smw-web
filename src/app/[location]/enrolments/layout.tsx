import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface EnrolmentsLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>; 
}

export async function generateMetadata({ params }: EnrolmentsLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Enrolments - ${formattedLocation} | SMW`,
    description: `Browse and manage Enrolments for ${formattedLocation}.`,
    keywords: ["Enrolments", "programs", "students", location],
    openGraph: {
      title: `${formattedLocation} Enrolments`,
      description: `Enrolments directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function EnrolmentsLayout({ children }: EnrolmentsLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}


