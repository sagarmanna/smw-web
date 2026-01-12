import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface TermsOfServiceLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export async function generateMetadata({ params }: TermsOfServiceLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Terms Of Service - ${formattedLocation} | SMW`,
    description: `Terms of Service for ${formattedLocation}.`,
    keywords: ["Terms of Service", "terms", "legal", "agreement", location],
    openGraph: {
      title: `${formattedLocation} Terms Of Service`,
      description: `Terms of Service for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function TermsOfServiceLayout({ children }: TermsOfServiceLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}
