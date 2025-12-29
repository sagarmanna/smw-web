import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface PrivateLessonsLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>; 
}

export async function generateMetadata({ params }: PrivateLessonsLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Private Lessons - ${formattedLocation} | SMW`,
    description: `Browse and manage Private Lessons for ${formattedLocation}.`,
    keywords: ["Private Lessons", "lessons", "students", "teachers", location],
    openGraph: {
      title: `${formattedLocation} Private Lessons`,
      description: `Private Lessons directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function PrivateLessonsLayout({ children }: PrivateLessonsLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}

