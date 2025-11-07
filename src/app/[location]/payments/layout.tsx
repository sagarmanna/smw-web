import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface PaymentsLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export async function generateMetadata({ params }: PaymentsLayoutProps): Promise<Metadata> {
  const { location } = await params;

  const formattedLocation = formatLocationName(location);
  
  return {
    title: `Payments - ${formattedLocation} | SMW`,
    description: `View and manage payments for ${formattedLocation} location.`,
    keywords: ["payments", "transactions", "billing", "receipts", location],
    openGraph: {
      title: `${formattedLocation} Payments`,
      description: `Review and export payments for ${formattedLocation}`,
      type: "website",
    },
  };
}

export default function PaymentsLayout({ children }: PaymentsLayoutProps) {
  return (
    <div className="min-h-screen">
      <div>
        {children}
      </div>
    </div>
  );
}


