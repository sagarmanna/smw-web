import type { Metadata } from "next";
import { formatLocationName } from "@/utils/textUtils";

interface ReportLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    location: string;
  }>;
}

export async function generateMetadata({ params }: ReportLayoutProps): Promise<Metadata> {
  const { location } = await params;

  const formattedLocation = formatLocationName(location);
  
  return {
    title: `Accounts Receivable - ${formattedLocation} | SMW`,
    description: `Track outstanding balances, customer payments, and account receivables for ${formattedLocation} location`,
    keywords: ['Accounts Receivable', 'AR Report', 'Outstanding Balance', 'Customer Payments', 'Aging Report', location],
    openGraph: {
      title: `${formattedLocation} Accounts Receivable`,
      description: `Track outstanding balances and customer payments for ${formattedLocation} location`,
      type: 'website',
    },
  };
}

export default function ReportLayout({ children }: ReportLayoutProps) {
  return <div>{children}</div>;
}

