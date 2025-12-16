import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface GroupCoursesLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>; 
}

export async function generateMetadata({ params }: GroupCoursesLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Group Courses - ${formattedLocation} | SMW`,
    description: `Browse and manage group courses for ${formattedLocation}.`,
    keywords: ["group courses", "courses", "training", location],
    openGraph: {
      title: `${formattedLocation} Group Courses`,
      description: `Group courses directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function GroupCoursesLayout({ children }: GroupCoursesLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}

