"use client";

import { cn } from "@/lib/utils";
import { PieChart } from "./chart";

type PropsType = {
  className?: string;
  title?: string;
  type?: string;
  location: string;
  data?: Array<{ name: string; count: number }>;
};

export function PieChartGraph({ className, title, type, location, data = [] }: PropsType) {
  // Calculate total from data
  const total = data.reduce((sum, item) => sum + Number(item.count), 0);

  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm p-6", className)}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Total: {total}
        </div>
      </div>
      <div className="flex w-full justify-center min-h-[450px]">
        <PieChart
          key={`${type}-${location}`}
          data={
            data && data.length > 0
              ? data.map((item) => ({ name: item.name, amount: Number(item.count) }))
              : []
          }
          type={type || 'enrolment-gains'}
        />
      </div>
    </div>
  );
}
