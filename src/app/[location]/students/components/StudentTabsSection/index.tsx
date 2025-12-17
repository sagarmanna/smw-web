"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/redux/hooks";
import {
  STUDENT_TAB_CONFIGS,
  STUDENT_TAB_ORDER,
} from "../../[id]/studentTabConfigs";
import {
  PrivateLessonsTab,
  GroupLessonsTab,
  AbsentLessonsTab,
  UnscheduledLessonsTab,
  CommentsTab,
  HistoryTab,
} from "./tabs";

interface StudentTabsSectionProps {
  location: string;
  studentId: string;
}

const TAB_COMPONENTS: Record<string, React.ComponentType<{ location: string; studentId: string }>> = {
  "private-lessons": PrivateLessonsTab,
  "group-lessons": GroupLessonsTab,
  "absent-lessons": AbsentLessonsTab,
  "unscheduled-lessons": UnscheduledLessonsTab,
  "comments": CommentsTab,
  "history": HistoryTab,
};

export function StudentTabsSection({ location, studentId }: StudentTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<string>(STUDENT_TAB_ORDER[0]);
  const isLoading = useAppSelector((state) => state.studentTabs.isLoading);
  const error = useAppSelector((state) => state.studentTabs.error);
  const privateLessonLoading = useAppSelector((state) => state.studentTabs.privateLessonLoading);
  const privateLessonError = useAppSelector((state) => state.studentTabs.privateLessonError);

  // Data is fetched once in page.tsx on initial load and stored in Redux
  // No caching on UI side - just read from Redux state

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-muted p-1.5 text-muted-foreground w-full overflow-x-auto gap-1">
          {STUDENT_TAB_ORDER.map((tabKey) => (
            <TabsTrigger
              key={tabKey}
              value={tabKey}
              className="whitespace-nowrap px-6 py-2 text-sm font-medium min-w-fit"
            >
              {STUDENT_TAB_CONFIGS[tabKey].title}
            </TabsTrigger>
          ))}
        </TabsList>

        {STUDENT_TAB_ORDER.map((tabKey) => {
          const TabComponent = TAB_COMPONENTS[tabKey];
          
          if (!TabComponent) {
            return null;
          }

          return (
            <TabsContent key={tabKey} value={tabKey} className="mt-4">
              {(isLoading || (tabKey === 'private-lessons' && privateLessonLoading)) && activeTab === tabKey ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-gray-500">Loading...</div>
                </div>
              ) : (error || (tabKey === 'private-lessons' && privateLessonError)) && activeTab === tabKey ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-red-500">{error || privateLessonError}</div>
                </div>
              ) : (
                <TabComponent location={location} studentId={studentId} />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

