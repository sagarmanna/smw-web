"use client";
import { cn } from "@/lib/utils";
import { PaymentsOverviewChart } from "./chart";

type PropsType = {
  className?: string;
  location: string;
  data?: Array<{ x: string; y: number }>;
};

export function PaymentsOverview({ className, data = [] }: PropsType) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm p-6",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">
          Monthly Revenue
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="-ml-4 -mr-5 h-[310px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <div className="text-4xl">📊</div>
            <div className="text-center">
              <div className="font-semibold">No Data Available</div>
              <div className="text-sm">No revenue data found for the selected date range</div>
            </div>
          </div>
        </div>
      ) : (
        <PaymentsOverviewChart data={data} />
      )}
    </div>
  );
}
