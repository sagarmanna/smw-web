import { DateRangeProvider } from "./DateRangeContext";
import { DashboardClient } from "./DashboardClient";

interface DashboardPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { location } = await params;
  
  return (
    <DateRangeProvider>
      <DashboardClient location={location} />
    </DateRangeProvider>
  );
}

