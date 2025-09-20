import { DateRangeProvider } from "./DateRangeContext";
import { DashboardClient } from "./DashboardClient";
import { DashboardProtection } from "@/components/DashboardProtection";

interface DashboardPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { location } = await params;
  
  return (
    <DashboardProtection location={location}>
      <DateRangeProvider>
        <DashboardClient location={location} />
      </DateRangeProvider>
    </DashboardProtection>
  );
}

