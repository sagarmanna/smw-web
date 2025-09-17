import { PaymentsOverview } from "@/components/Charts/payments-overview";

interface DashboardPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { location } = await params;
  const formattedLocation = location.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  return (
    <div className="space-y-6 border-2 border-white">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the {formattedLocation} dashboard
        </p>
      </div>
 
      
      {/* Monthly Revenue Chart */}
      <PaymentsOverview location={location} />
      
      
    </div>
  );
}

