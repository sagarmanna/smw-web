"use client";

import * as React from "react";
import { Settings } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LocationAvailabilityCalendar, type LocationTimeBlock } from "../LocationAvailabilityCalendar";

type AvailabilityTabKey = "operation" | "visibility";

const makeCopyId = (
  prefix: string,
  b: Pick<LocationTimeBlock, "resourceId" | "fromTime" | "toTime">
) => `${prefix}-${b.resourceId}-${b.fromTime}-${b.toTime}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

interface LocationAvailabilityTabsSectionProps {
  operationBlocks: LocationTimeBlock[];
  setOperationBlocks: React.Dispatch<React.SetStateAction<LocationTimeBlock[]>>;
  visibilityBlocks: LocationTimeBlock[];
  setVisibilityBlocks: React.Dispatch<React.SetStateAction<LocationTimeBlock[]>>;
}

export function LocationAvailabilityTabsSection({
  operationBlocks,
  setOperationBlocks,
  visibilityBlocks,
  setVisibilityBlocks,
}: LocationAvailabilityTabsSectionProps) {
  const [activeTab, setActiveTab] = React.useState<AvailabilityTabKey>("operation");

  const copyOperationalToVisibility = React.useCallback(() => {
    const copied = operationBlocks.map((b) => ({
      ...b,
      id: makeCopyId("sv-copy", b),
    }));
    setVisibilityBlocks(copied);
    toast.success("Copied operational hours to schedule visibility");
  }, [operationBlocks, setVisibilityBlocks]);

  return (
    <div className="mt-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AvailabilityTabKey)}>
        <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto gap-1">
          {(
            [
              { key: "operation", label: "Operation Time Availability" },
              { key: "visibility", label: "Schedule Visibility" },
            ] as const
          ).map((t) => (
            <TabsTrigger
              key={t.key}
              value={t.key}
              className="whitespace-nowrap px-4 py-2 text-sm font-medium min-w-fit"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="operation" className="mt-4">
          <LocationAvailabilityCalendar
            blocks={operationBlocks}
            onBlocksChange={setOperationBlocks}
            editable={true}
            height="650px"
          />
        </TabsContent>

        <TabsContent value="visibility" className="mt-4">
          <div className="flex items-center justify-end mb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  aria-label="Schedule visibility options"
                >
                  <Settings className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={copyOperationalToVisibility}>
                  Copy From Operational Hours
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <LocationAvailabilityCalendar
            blocks={visibilityBlocks}
            onBlocksChange={setVisibilityBlocks}
            editable={true}
            height="650px"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}


