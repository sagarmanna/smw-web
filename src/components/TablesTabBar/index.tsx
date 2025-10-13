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

// ============================================
// USAGE EXAMPLE IN StudentDetailClient
// ============================================

/*
import { ReusableTabBar, TabItem } from "@/components/ui/reusable-tab-bar";
import { CustomTable } from "@/components/CustomTable";

// Inside your component:
const lessonTabs: TabItem[] = [
  {
    value: "private",
    label: "Private Lessons",
    content: (
      <CustomTable
        data={student.privateLessons}
        columns={privateLessonColumns}
        enableSearch={false}
        enableExport={true}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={false}
        enableSorting={false}
      />
    ),
  },
  {
    value: "group",
    label: "Group Lessons",
    content: (
      <CustomTable
        data={student.groupLessons}
        columns={groupLessonColumns}
        enableSearch={false}
        enableExport={true}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={false}
        enableSorting={false}
      />
    ),
  },
  {
    value: "absent",
    label: "Absent Lessons",
    content: (
      <CustomTable
        data={student.absentLessons}
        columns={absentLessonColumns}
        enableSearch={false}
        enableExport={true}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={false}
        enableSorting={false}
      />
    ),
  },
  {
    value: "unscheduled",
    label: "Unscheduled Lessons",
    content: (
      <CustomTable
        data={student.unscheduledLessons}
        columns={unscheduledLessonColumns}
        enableSearch={false}
        enableExport={false}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={false}
        enableSorting={false}
      />
    ),
  },
  {
    value: "comments",
    label: "Comments",
    content: (
      <CustomTable
        data={student.comments}
        columns={commentColumns}
        enableSearch={false}
        enableExport={false}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={false}
        enableSorting={false}
      />
    ),
  },
  {
    value: "history",
    label: "History",
    content: (
      <CustomTable
        data={student.history}
        columns={historyColumns}
        enableSearch={false}
        enableExport={false}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={false}
        enableSorting={false}
      />
    ),
  },
];

// Then use it in your JSX:
<ReusableCard
  title="Lessons"
  actions={[
    { icon: Plus, onClick: () => setIsAddLessonModalOpen(true), label: 'Add lesson' },
  ]}
>
  <ReusableTabBar
    tabs={lessonTabs}
    defaultValue="private"
    onTabChange={(value) => console.log('Tab changed to:', value)}
  />
</ReusableCard>
*/

// ============================================
// MORE USAGE EXAMPLES
// ============================================

/*
// Example 1: Simple tabs with text content
const simpleTabs: TabItem[] = [
  {
    value: "overview",
    label: "Overview",
    content: <div>Overview content here</div>,
  },
  {
    value: "details",
    label: "Details",
    content: <div>Details content here</div>,
  },
  {
    value: "settings",
    label: "Settings",
    content: <div>Settings content here</div>,
    disabled: true, // Optional: disable a tab
  },
];

<ReusableTabBar tabs={simpleTabs} defaultValue="overview" />

// Example 2: Tabs with custom styling
<ReusableTabBar
  tabs={simpleTabs}
  defaultValue="overview"
  className="bg-gray-50 p-4 rounded-lg"
  tabListClassName="grid w-full mb-6 bg-white rounded-md"
  tabTriggerClassName="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
/>

// Example 3: Tabs with callback
<ReusableTabBar
  tabs={simpleTabs}
  defaultValue="overview"
  onTabChange={(value) => {
    console.log('Active tab:', value);
    // Fetch data, update state, etc.
  }}
/>

// Example 4: Dynamic tabs based on data
const dynamicTabs: TabItem[] = categories.map((category) => ({
  value: category.id,
  label: category.name,
  content: <CategoryContent data={category.items} />,
}));

<ReusableTabBar tabs={dynamicTabs} />

// Example 5: Tabs with complex content
const complexTabs: TabItem[] = [
  {
    value: "analytics",
    label: "Analytics",
    content: (
      <div className="space-y-4">
        <ChartComponent />
        <DataTable />
      </div>
    ),
  },
  {
    value: "reports",
    label: "Reports",
    content: (
      <div className="space-y-4">
        <ReportFilters />
        <ReportResults />
      </div>
    ),
  },
];

<ReusableTabBar tabs={complexTabs} defaultValue="analytics" />
*/