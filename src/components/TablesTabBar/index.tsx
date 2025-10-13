// components/tablesTabBar/index.tsx
"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

interface ReusableTabBarProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  tabListClassName?: string;
  tabTriggerClassName?: string;
  onTabChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
}

export function ReusableTabBar({
  tabs,
  defaultValue,
  className,
  tabListClassName,
  tabTriggerClassName,
  onTabChange,
  orientation = "horizontal",
}: ReusableTabBarProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0]?.value);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange?.(value);
  };

  return (
    <Tabs
      defaultValue={defaultValue || tabs[0]?.value}
      value={activeTab}
      onValueChange={handleTabChange}
      className={`w-full ${className || ""}`}
      orientation={orientation}
    >
      <TabsList className={`${tabListClassName || "grid w-full mb-4"}`} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={tabTriggerClassName}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

