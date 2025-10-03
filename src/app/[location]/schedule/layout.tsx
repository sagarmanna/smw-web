import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface ScheduleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export async function generateMetadata({ params }: ScheduleLayoutProps): Promise<Metadata> {
  const { location } = await params;

  const formattedLocation = formatLocationName(location);
  
  return {
    title: `Schedule - ${formattedLocation} | SMW`,
    description: `View and manage schedules for ${formattedLocation} location. Teacher and classroom views available.`,
    keywords: ['schedule', 'calendar', 'teacher', 'classroom', 'lessons', location],
    openGraph: {
      title: `${formattedLocation} Schedule`,
      description: `Manage schedules and view lessons for ${formattedLocation}`,
      type: 'website',
    },
  };
}

export default function ScheduleLayout({ children }: ScheduleLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div>
        {children}
      </div>
    </div>
  );
}
