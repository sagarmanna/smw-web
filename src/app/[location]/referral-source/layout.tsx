import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface ReferralSourceLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export async function generateMetadata({ params }: ReferralSourceLayoutProps): Promise<Metadata> {
  const { location } = await params;
  const formattedLocation = formatLocationName(location);

  return {
    title: `Referral Source - ${formattedLocation} | SMW`,
    description: `Browse and manage referral sources for ${formattedLocation}.`,
    keywords: ["referral source", "referral", "sources", location],
    openGraph: {
      title: `${formattedLocation} Referral Sources`,
      description: `Referral sources directory for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function ReferralSourceLayout({ children }: ReferralSourceLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}
