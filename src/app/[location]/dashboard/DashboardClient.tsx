"use client";

import { PaymentsOverview } from "@/components/Charts/payments-overview";
import { PieChartGraph } from "@/components/Charts/pie-chart-graph";
import { DateRangePicker } from "@/components/DateRangePicker";
import { useDateRange } from "./DateRangeContext";

interface DashboardClientProps {
  location: string;
}

export function DashboardClient({ location }: DashboardClientProps) {
  const { dateRange, setDateRange } = useDateRange();
  const formattedLocation = location.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  
  return (
    <div className="space-y-6 border-2 border-white dark:border-black">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to the {formattedLocation} dashboard
          </p>
        </div>
        <div className="flex justify-end">
          <DateRangePicker 
            value={dateRange}
            onChange={setDateRange}
          />
        </div>
      </div>

      
      {/* Monthly Revenue Chart */}
      <PaymentsOverview location={location} />
      
      {/* Pie Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PieChartGraph 
          location={location}
          title="Enrolment Gains"
          type="enrolment-gains"
        />
        <PieChartGraph 
          location={location}
          title="Enrolment Losses"
          type="enrolment-losses"
        />
        <PieChartGraph 
          location={location}
          title="Instruction Hours"
          type="instruction-hours"
        />
      </div>
      
    </div>
  );
}
