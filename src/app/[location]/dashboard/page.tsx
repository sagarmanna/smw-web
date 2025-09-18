import { DateRangeProvider } from "./DateRangeContext";
import { DashboardClient } from "./DashboardClient";
import { DashboardProtection } from "@/components/DashboardProtection";
import { GlobalDataProvider } from "@/providers/GlobalDataProvider";

interface DashboardPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { location } = await params;
  
  return (
    <GlobalDataProvider location={location}>
      <DashboardProtection location={location}>
        <DateRangeProvider>
          <DashboardClient location={location} />
        </DateRangeProvider>
      </DashboardProtection>
    </GlobalDataProvider>
  );
}

