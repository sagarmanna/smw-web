"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff, Pencil } from "lucide-react";
import type { GroupLessonCost, PrivateLessonDetails } from "../../types";
import { EditCostModal } from "../modals/EditCostModal";

interface CostItem {
  name: string;
  amount: string;
}

interface PrivateLessonCostCardProps {
  details: PrivateLessonDetails | null;
  groupCost?: GroupLessonCost;
  onSaveCost: (data: { costPerHour?: string; cost?: string; price?: string }) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
}

export const PrivateLessonCostCard = React.memo(function PrivateLessonCostCard({
  details,
  groupCost,
  onSaveCost,
  savingDetails = false,
  isLoading = false,
}: PrivateLessonCostCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const costData = React.useMemo<CostItem[]>(() => {
    if (!details?.cost) return [];

    if (details?.isGroup) {
      return [
        { name: "Cost/hr", amount: groupCost?.costPerHour || details.cost.costPerHour || "N/A" },
        { name: "Cost", amount: groupCost?.cost || details.cost.cost || "N/A" },
        { name: "Cost Per Student", amount: groupCost?.costPerStudent || "N/A" },
      ];
    }

    return [
      { name: "Cost/hr", amount: details.cost.costPerHour || "N/A" },
      { name: "Cost", amount: details.cost.cost || "N/A" },
      { name: "Price", amount: details.cost.price || "N/A" },
      { name: "Profit", amount: details.cost.profit || "N/A" },
    ];
  }, [details, groupCost]);

  const handleEditClick = React.useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleEditClose = React.useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleViewToggle = React.useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSubmit = React.useCallback(
    async (data: { costPerHour?: string; cost?: string; price?: string }): Promise<boolean> => {
      return await onSaveCost(data);
    },
    [onSaveCost]
  );

  return (
    <>
      <Card className="self-start h-fit">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Cost</CardTitle>
          <div className="flex items-center gap-1">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground"
                  onClick={handleViewToggle}
                  aria-label={isExpanded ? "Hide details" : "Show details"}
                >
                  {isExpanded ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={handleEditClick}
                  aria-label="Edit cost"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isExpanded && (
            <div className="w-full">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 pb-2 border-b">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="grid grid-cols-2 gap-4 py-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : costData.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4">No cost data available</div>
              ) : (
                <>
                  {/* Table Header */}
                  <div className="grid grid-cols-2 gap-4 pb-2 border-b font-semibold text-sm">
                    <div className="text-left">Name</div>
                    <div className="text-right">Amount</div>
                  </div>
                  
                  {/* Table Rows */}
                  <div className="divide-y">
                    {costData.map((item, index) => (
                      <div
                        key={item.name}
                        className={`grid grid-cols-2 gap-4 py-2 transition-colors ${
                          index % 2 === 0 ? "bg-white dark:bg-black" : "bg-gray-50 dark:bg-gray-900"
                        }`}
                      >
                        <div className="text-left">
                          <span>{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span>{item.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <EditCostModal
        open={isEditModalOpen}
        onClose={handleEditClose}
        costPerHour={details?.cost.costPerHour || ""}
        onSubmit={handleSubmit}
        saving={savingDetails}
      />
    </>
  );
});

