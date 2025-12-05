import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface StudentsLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>; 
}

export async function generateMetadata({ params }: StudentsLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Students - ${formattedLocation} | SMW`,
    description: `Browse and manage Students for ${formattedLocation}.`,
    keywords: ["Students", "instructors", "staff", location],
    openGraph: {
      title: `${formattedLocation} Students`,
      description: `Students directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function StudentsLayout({ children }: StudentsLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}
