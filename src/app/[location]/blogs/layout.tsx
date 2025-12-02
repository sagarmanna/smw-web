import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface BlogsLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>; 
}

export async function generateMetadata({ params }: BlogsLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Blogs - ${formattedLocation} | SMW`,
    description: `Browse all blogs for ${formattedLocation}.`,
    keywords: ["blogs", "posts", "articles", location],
    openGraph: {
      title: `${formattedLocation} Blogs`,
      description: `Blogs directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function BlogsLayout({ children }: BlogsLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}

