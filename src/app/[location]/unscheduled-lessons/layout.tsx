import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface UnscheduledLessonsLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>; 
}

export async function generateMetadata({ params }: UnscheduledLessonsLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Unscheduled Lessons - ${formattedLocation} | SMW`,
    description: `Browse and manage Unscheduled Lessons for ${formattedLocation}.`,
    keywords: ["Unscheduled Lessons", "lessons", "students", location],
    openGraph: {
      title: `${formattedLocation} Unscheduled Lessons`,
      description: `Unscheduled Lessons directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function UnscheduledLessonsLayout({ children }: UnscheduledLessonsLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}


