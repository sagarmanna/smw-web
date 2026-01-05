"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/redux/hooks";
import {
  STAFF_MEMBER_TAB_CONFIGS,
  STAFF_MEMBER_TAB_ORDER,
} from "../../[id]/config/staffMemberTabConfigs";
import { HistoryTab } from "@/components/tabs/HistoryTab";
import { HistoryData } from "../../[id]/config/staffMemberTabConfigs";
import { createStaffMemberHistoryTabConfig } from "../../[id]/config/staffMemberTabConfigs";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface StaffMemberTabsSectionProps {
  location: string;
  staffMemberId: number;
}

export function StaffMemberTabsSection({ location, staffMemberId }: StaffMemberTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<string>(STAFF_MEMBER_TAB_ORDER[0]);
  const isLoading = useAppSelector((state) => state.staffMemberTabs.isLoading);
  const error = useAppSelector((state) => state.staffMemberTabs.error);

  // Memoize config to prevent recreation on every render
  const historyTabConfig = useMemo(
    () => createStaffMemberHistoryTabConfig(),
    []
  );

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-muted p-1.5 text-muted-foreground w-full overflow-x-auto gap-1">
          {STAFF_MEMBER_TAB_ORDER.map((tabKey: string) => (
            <TabsTrigger
              key={tabKey}
              value={tabKey}
              className="whitespace-nowrap px-6 py-2 text-sm font-medium min-w-fit"
            >
              {STAFF_MEMBER_TAB_CONFIGS[tabKey].title}
            </TabsTrigger>
          ))}
        </TabsList>

        {STAFF_MEMBER_TAB_ORDER.map((tabKey: string) => {
          if (tabKey === "history") {
            return (
              <TabsContent key={tabKey} value={tabKey} className="mt-4">
                <ErrorBoundary>
                  {isLoading && activeTab === tabKey ? (
                    <div className="flex items-center justify-center h-[400px]">
                      <div className="text-gray-500">Loading...</div>
                    </div>
                  ) : error && activeTab === tabKey ? (
                    <div className="flex items-center justify-center h-[400px]">
                      <div className="text-red-500">{error}</div>
                    </div>
                  ) : (
                    <HistoryTab<HistoryData>
                      location={location}
                      entityId={staffMemberId}
                      config={historyTabConfig}
                    />
                  )}
                </ErrorBoundary>
              </TabsContent>
            );
          }
          return null;
        })}
      </Tabs>
    </div>
  );
}

