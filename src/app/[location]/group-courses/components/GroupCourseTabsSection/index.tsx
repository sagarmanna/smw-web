"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchGroupCourseTabsData } from "../../[id]/groupCourseTabs.slice";
import {
  GROUP_COURSE_TAB_CONFIGS,
  GROUP_COURSE_TAB_ORDER,
} from "../../[id]/groupCourseTabConfigs";
import {
  LessonsTab,
  StudentsTab,
  HistoryTab,
} from "./tabs";

interface GroupCourseTabsSectionProps {
  location: string;
  courseId: number;
}

const TAB_COMPONENTS: Record<string, React.ComponentType<{ location: string; courseId: number }>> = {
  "lessons": LessonsTab,
  "students": StudentsTab,
  "history": HistoryTab,
};

export function GroupCourseTabsSection({ location, courseId }: GroupCourseTabsSectionProps) {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<string>(GROUP_COURSE_TAB_ORDER[0]);
  const isLoading = useAppSelector((state) => state.groupCourseTabs.isLoading);
  const error = useAppSelector((state) => state.groupCourseTabs.error);
  const currentCourseId = useAppSelector((state) => state.groupCourseTabs.currentCourseId);
  const hasData = useAppSelector((state) => state.groupCourseTabs.lessonData.length > 0);

  // Fetch tabs data only if we don't have data for this course in Redux
  useEffect(() => {
    if (location && courseId) {
      // Only fetch if we don't have data or it's a different course
      if (currentCourseId !== courseId || !hasData) {
        dispatch(fetchGroupCourseTabsData({ location, courseId }));
      }
    }
  }, [location, courseId, dispatch, currentCourseId, hasData]);

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-muted p-1.5 text-muted-foreground w-full overflow-x-auto gap-1">
          {GROUP_COURSE_TAB_ORDER.map((tabKey) => (
            <TabsTrigger
              key={tabKey}
              value={tabKey}
              className="whitespace-nowrap px-6 py-2 text-sm font-medium min-w-fit"
            >
              {GROUP_COURSE_TAB_CONFIGS[tabKey].title}
            </TabsTrigger>
          ))}
        </TabsList>

        {GROUP_COURSE_TAB_ORDER.map((tabKey) => {
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
                <TabComponent location={location} courseId={courseId} />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

