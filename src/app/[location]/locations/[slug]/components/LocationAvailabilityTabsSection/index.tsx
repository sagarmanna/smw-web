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
import {
  copyLocationAvailability,
  getLocationRenderEvents,
  type LocationRenderEventRow,
} from "../../locationAvailability.api";

type AvailabilityTabKey = "operation" | "visibility";

const AVAILABILITY_TYPE = 1 as const;
const SCHEDULE_VISIBILITY_TYPE = 2 as const;

const extractTimeHHmm = (value: string): string => {
  // Supports "YYYY-MM-DD HH:mm:ss" and ISO strings.
  const timePart = value.includes(" ")
    ? value.split(" ")[1] || ""
    : value.includes("T")
      ? value.split("T")[1] || ""
      : value;
  const [hhRaw = "00", mmRaw = "00"] = timePart.split(":");
  const hh = hhRaw.padStart(2, "0");
  const mm = mmRaw.padStart(2, "0");
  return `${hh}:${mm}`;
};

const toTimeBlocks = (rows: LocationRenderEventRow[]): LocationTimeBlock[] =>
  rows.map((r) => ({
    id: String(r.id),
    resourceId: Number.parseInt(String(r.resourceId), 10) || 1,
    fromTime: extractTimeHHmm(r.start),
    toTime: extractTimeHHmm(r.end),
    backgroundColor: r.backgroundColor,
    className: r.className,
  }));

interface LocationAvailabilityTabsSectionProps {
  location: string;
  operationBlocks: LocationTimeBlock[];
  setOperationBlocks: React.Dispatch<React.SetStateAction<LocationTimeBlock[]>>;
  visibilityBlocks: LocationTimeBlock[];
  setVisibilityBlocks: React.Dispatch<React.SetStateAction<LocationTimeBlock[]>>;
}

export function LocationAvailabilityTabsSection({
  location,
  operationBlocks,
  setOperationBlocks,
  visibilityBlocks,
  setVisibilityBlocks,
}: LocationAvailabilityTabsSectionProps) {
  const [activeTab, setActiveTab] = React.useState<AvailabilityTabKey>("operation");
  const [isCopying, setIsCopying] = React.useState(false);

  const fetchAndSetBlocks = React.useCallback(
    async (
      type: 1 | 2,
      setBlocks: React.Dispatch<React.SetStateAction<LocationTimeBlock[]>>,
      errorMessage: string
    ) => {
      const rows = await getLocationRenderEvents(location, type);
      if (!rows) {
        toast.error(errorMessage);
        return false;
      }
      setBlocks(toTimeBlocks(rows));
      return true;
    },
    [location]
  );

  React.useEffect(() => {
    const load = async () => {
      await Promise.all([
        fetchAndSetBlocks(AVAILABILITY_TYPE, setOperationBlocks, "Failed to load operation time availability"),
        fetchAndSetBlocks(SCHEDULE_VISIBILITY_TYPE, setVisibilityBlocks, "Failed to load schedule visibility"),
      ]);
    };

    load();
  }, [fetchAndSetBlocks, setOperationBlocks, setVisibilityBlocks]);

  const copyOperationalToVisibility = React.useCallback(async () => {
    if (isCopying) return;
    setIsCopying(true);
    try {
      const result = await copyLocationAvailability(location);
      if (!result.success) {
        toast.error(result.message || "Failed to copy availability");
        return;
      }

      // After backend copy, reload schedule visibility from API (type=2)
      const ok = await fetchAndSetBlocks(
        SCHEDULE_VISIBILITY_TYPE,
        setVisibilityBlocks,
        "Copied but failed to refresh schedule visibility"
      );
      if (!ok) {
        return;
      }

      toast.success(result.message || "Copied operational hours to schedule visibility");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to copy availability");
    } finally {
      setIsCopying(false);
    }
  }, [fetchAndSetBlocks, isCopying, location, setVisibilityBlocks]);

  return (
    <div className="mt-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AvailabilityTabKey)}>
        <TabsList className="inline-flex h-auto min-h-10 items-center justify-start flex-wrap rounded-md bg-muted p-1 text-muted-foreground w-full gap-1 overflow-x-hidden">
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
                <DropdownMenuItem onClick={copyOperationalToVisibility} disabled={isCopying}>
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


