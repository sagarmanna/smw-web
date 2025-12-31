"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/redux/hooks";
import {
  ADMINISTRATOR_TAB_CONFIGS,
  ADMINISTRATOR_TAB_ORDER,
} from "../../administratorTabConfigs";
import {
  HistoryTab,
} from "./tabs";

interface AdministratorTabsSectionProps {
  location: string;
  administratorId: number;
}

const TAB_COMPONENTS: Record<string, React.ComponentType<{ location: string; administratorId: number }>> = {
  "history": HistoryTab,
};

export function AdministratorTabsSection({ location, administratorId }: AdministratorTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<string>(ADMINISTRATOR_TAB_ORDER[0]);
  const isLoading = useAppSelector((state) => state.administratorTabs.isLoading);
  const error = useAppSelector((state) => state.administratorTabs.error);

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-muted p-1.5 text-muted-foreground w-full overflow-x-auto gap-1">
          {ADMINISTRATOR_TAB_ORDER.map((tabKey) => (
            <TabsTrigger
              key={tabKey}
              value={tabKey}
              className="whitespace-nowrap px-6 py-2 text-sm font-medium min-w-fit"
            >
              {ADMINISTRATOR_TAB_CONFIGS[tabKey].title}
            </TabsTrigger>
          ))}
        </TabsList>

        {ADMINISTRATOR_TAB_ORDER.map((tabKey) => {
          const TabComponent = TAB_COMPONENTS[tabKey];
          
          if (!TabComponent) {
            return null;
          }

          return (
            <TabsContent key={tabKey} value={tabKey} className="mt-4">
              {isLoading && activeTab === tabKey ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-gray-500">Loading...</div>
                </div>
              ) : error && activeTab === tabKey ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-red-500">{error}</div>
                </div>
              ) : (
                <TabComponent location={location} administratorId={administratorId} />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

