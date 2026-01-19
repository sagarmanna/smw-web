"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchGroupCourseTabsData,
  fetchGroupCourseStudents,
  fetchGroupCourseHistory,
} from "../../[id]/groupCourseTabs.slice";
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

  // Track which tabs have been loaded to prevent duplicate API calls
  const loadingTabsRef = useRef<Set<string>>(new Set());

  const isLoading = useAppSelector((state) => state.groupCourseTabs.isLoading);
  const error = useAppSelector((state) => state.groupCourseTabs.error);
  const studentsLoading = useAppSelector((state) => state.groupCourseTabs.studentsLoading);
  const studentsError = useAppSelector((state) => state.groupCourseTabs.studentsError);
  const historyLoading = useAppSelector((state) => state.groupCourseTabs.historyLoading);
  const historyError = useAppSelector((state) => state.groupCourseTabs.historyError);
  const currentCourseId = useAppSelector((state) => state.groupCourseTabs.currentCourseId);
  const hasData = useAppSelector((state) => state.groupCourseTabs.lessonData.length > 0);
  // Get courseLessons from main slice to sync tabs data
  const courseLessons = useAppSelector((state) => state.groupCourse.courseLessons);
  const mainCourseId = useAppSelector((state) => state.groupCourse.currentCourseId);
  const mainIsLoading = useAppSelector((state) => state.groupCourse.isLoading);

  // Fetch lessons data only if we don't have data for this course in Redux
  // Also sync when main course data is loaded
  useEffect(() => {
    if (location && courseId && !mainIsLoading) {
      // Only fetch if we don't have data or it's a different course
      // Or if main course data has been loaded and we need to sync lessons
      if (currentCourseId !== courseId || (!hasData && courseLessons.length > 0 && mainCourseId === courseId)) {
        dispatch(fetchGroupCourseTabsData({ location, courseId }));
      }
    }
  }, [location, courseId, dispatch, currentCourseId, hasData, courseLessons.length, mainCourseId, mainIsLoading]);

  // Lazy-load per-tab data when a tab is first accessed
  const loadTabData = useCallback(
    async (tabKey: string) => {
      if (loadingTabsRef.current.has(tabKey)) {
        return;
      }
      loadingTabsRef.current.add(tabKey);

      try {
        switch (tabKey) {
          case "lessons":
            // Lessons are already synced by the effect above
            break;
          case "students":
            await dispatch(fetchGroupCourseStudents({ location, courseId, page: 1 })).unwrap();
            break;
          case "history":
            await dispatch(fetchGroupCourseHistory({ location, courseId, page: 1 })).unwrap();
            break;
          default:
            break;
        }
      } catch (e) {
        console.error(`Error loading ${tabKey} data:`, e);
      }
    },
    [dispatch, location, courseId]
  );

  useEffect(() => {
    if (activeTab) {
      loadTabData(activeTab);
    }
  }, [activeTab, loadTabData]);

  const getTabLoadingState = (tabKey: string) => {
    // Only show full-tab loading for lessons; students/history handle loading inside the table
    switch (tabKey) {
      case "lessons":
        return isLoading;
      case "students":
      case "history":
      default:
        return false;
    }
  };

  const getTabErrorState = (tabKey: string) => {
    switch (tabKey) {
      case "lessons":
        return error;
      case "students":
        return studentsError;
      case "history":
        return historyError;
      default:
        return null;
    }
  };

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

          const tabLoading = getTabLoadingState(tabKey);
          const tabError = getTabErrorState(tabKey);

          return (
            <TabsContent key={tabKey} value={tabKey} className="mt-4">
              {tabLoading && activeTab === tabKey ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-gray-500">Loading...</div>
                </div>
              ) : tabError && activeTab === tabKey ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-red-500">{tabError}</div>
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

