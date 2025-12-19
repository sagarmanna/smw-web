"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
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
import { 
  fetchPrivateLessonsData,
  fetchGroupLessonsData,
  fetchAbsentLessonsData,
  fetchUnscheduledLessonsData,
  fetchCommentsData,
  fetchHistoryData,
} from "../../[id]/studentTabs.slice";

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
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<string>(STUDENT_TAB_ORDER[0]);
  
  // Track which tabs have been loaded to prevent duplicate API calls
  const loadingTabsRef = useRef<Set<string>>(new Set());
  
  // Redux state
  const isLoading = useAppSelector((state) => state.studentTabs.isLoading);
  const error = useAppSelector((state) => state.studentTabs.error);
  const privateLessonLoading = useAppSelector((state) => state.studentTabs.privateLessonLoading);
  const privateLessonError = useAppSelector((state) => state.studentTabs.privateLessonError);
  const groupLessonLoading = useAppSelector((state) => state.studentTabs.groupLessonLoading);
  const groupLessonError = useAppSelector((state) => state.studentTabs.groupLessonError);
  const absentLessonLoading = useAppSelector((state) => state.studentTabs.absentLessonLoading);
  const absentLessonError = useAppSelector((state) => state.studentTabs.absentLessonError);
  const unscheduledLessonLoading = useAppSelector((state) => state.studentTabs.unscheduledLessonLoading);
  const unscheduledLessonError = useAppSelector((state) => state.studentTabs.unscheduledLessonError);
  const commentsLoading = useAppSelector((state) => state.studentTabs.commentsLoading);
  const commentsError = useAppSelector((state) => state.studentTabs.commentsError);
  const historyLoading = useAppSelector((state) => state.studentTabs.historyLoading);
  const historyError = useAppSelector((state) => state.studentTabs.historyError);

  // Function to load tab data when tab is first accessed (lazy loading)
  const loadTabData = useCallback(
    async (tabKey: string) => {
      // Prevent duplicate calls if already loading
      if (loadingTabsRef.current.has(tabKey)) {
        return;
      }
      loadingTabsRef.current.add(tabKey);

      try {
        switch (tabKey) {
          case "private-lessons":
            // Fetch private lessons (lazy loaded when tab is clicked)
            await dispatch(fetchPrivateLessonsData({ location, studentId })).unwrap();
            break;

          case "group-lessons":
            // Fetch group lessons with pagination (only page parameter, no limit)
            await dispatch(fetchGroupLessonsData({ 
              location, 
              studentId, 
              page: 1
            })).unwrap();
            break;

          case "absent-lessons":
            // Fetch absent lessons with pagination (only page parameter, no limit)
            await dispatch(fetchAbsentLessonsData({ 
              location, 
              studentId, 
              page: 1
            })).unwrap();
            break;

          case "unscheduled-lessons":
            // Fetch unscheduled lessons with pagination (only page parameter, no limit)
            // showAll defaults to false (only non-expired lessons)
            await dispatch(fetchUnscheduledLessonsData({ 
              location, 
              studentId, 
              page: 1,
              showAll: false
            })).unwrap();
            break;

          case "comments":
            // Fetch comments with pagination (only page parameter, no limit)
            await dispatch(fetchCommentsData({ 
              location, 
              studentId, 
              page: 1
            })).unwrap();
            break;

          case "history":
            // Fetch history with pagination (only page parameter, no limit)
            await dispatch(fetchHistoryData({ 
              location, 
              studentId, 
              page: 1
            })).unwrap();
            break;

          default:
            break;
        }
      } catch (error) {
        console.error(`Error loading ${tabKey} data:`, error);
      }
    },
    [dispatch, location, studentId]
  );

  // Load data when tab changes
  useEffect(() => {
    if (activeTab) {
      loadTabData(activeTab);
    }
  }, [activeTab, loadTabData]);

  // Helper function to get loading state for a specific tab
  const getTabLoadingState = (tabKey: string) => {
    switch (tabKey) {
      case "private-lessons":
        return privateLessonLoading;
      case "group-lessons":
        return groupLessonLoading;
      case "absent-lessons":
        return absentLessonLoading;
      case "unscheduled-lessons":
        return unscheduledLessonLoading;
      case "comments":
        return commentsLoading;
      case "history":
        return historyLoading;
      default:
        return false;
    }
  };

  // Helper function to get error state for a specific tab
  const getTabErrorState = (tabKey: string) => {
    switch (tabKey) {
      case "private-lessons":
        return privateLessonError;
      case "group-lessons":
        return groupLessonError;
      case "absent-lessons":
        return absentLessonError;
      case "unscheduled-lessons":
        return unscheduledLessonError;
      case "comments":
        return commentsError;
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

          const isTabLoading = getTabLoadingState(tabKey);
          const tabError = getTabErrorState(tabKey);

          return (
            <TabsContent key={tabKey} value={tabKey} className="mt-4">
              {(error || tabError) && activeTab === tabKey && !(isLoading || isTabLoading) ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-red-500">{error || tabError}</div>
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
