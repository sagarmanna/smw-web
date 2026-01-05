"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/redux/hooks";
import {
  OWNER_TAB_CONFIGS,
  OWNER_TAB_ORDER,
} from "../../[id]/config/ownerTabConfigs";
import { HistoryTab } from "@/components/tabs/HistoryTab";
import { HistoryData } from "../../[id]/config/ownerTabConfigs";
import { createOwnerHistoryTabConfig } from "../../[id]/config/ownerTabConfigs";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface OwnerTabsSectionProps {
  location: string;
  ownerId: number;
}

export function OwnerTabsSection({ location, ownerId }: OwnerTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<string>(OWNER_TAB_ORDER[0]);
  const isLoading = useAppSelector((state) => state.ownerTabs.isLoading);
  const error = useAppSelector((state) => state.ownerTabs.error);

  // Memoize config to prevent recreation on every render
  const historyTabConfig = useMemo(
    () => createOwnerHistoryTabConfig(),
    []
  );

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-muted p-1.5 text-muted-foreground w-full overflow-x-auto gap-1">
          {OWNER_TAB_ORDER.map((tabKey: string) => (
            <TabsTrigger
              key={tabKey}
              value={tabKey}
              className="whitespace-nowrap px-6 py-2 text-sm font-medium min-w-fit"
            >
              {OWNER_TAB_CONFIGS[tabKey].title}
            </TabsTrigger>
          ))}
        </TabsList>

        {OWNER_TAB_ORDER.map((tabKey: string) => {
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
                      entityId={ownerId}
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

