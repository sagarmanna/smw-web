"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchTeacherTabsData } from "../../[id]/teacherTabs.slice";
import {
  TEACHER_TAB_CONFIGS,
  TEACHER_TAB_ORDER,
} from "../../teacherTabConfigs";
import {
  AvailabilityCalendarTab,
  UnavailabilitiesTab,
  StudentsTab,
  ScheduleTab,
  InvoicedLessonsTab,
  UnscheduledLessonTab,
  TimeVoucherTab,
  CommentsTab,
  HistoryTab,
} from "./tabs";

interface TeacherTabsSectionProps {
  location: string;
  teacherId: number;
}

const TAB_COMPONENTS: Record<string, React.ComponentType<{ location: string; teacherId: number }>> = {
  "availability": AvailabilityCalendarTab,
  "unavailabilities": UnavailabilitiesTab,
  "students": StudentsTab,
  "schedule": ScheduleTab,
  "invoiced-lessons": InvoicedLessonsTab,
  "unscheduled-lesson": UnscheduledLessonTab,
  "time-voucher": TimeVoucherTab,
  "comments": CommentsTab,
  "history": HistoryTab,
};

export function TeacherTabsSection({ location, teacherId }: TeacherTabsSectionProps) {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<string>(TEACHER_TAB_ORDER[0]);
  const isLoading = useAppSelector((state) => state.teacherTabs.isLoading);
  const error = useAppSelector((state) => state.teacherTabs.error);
  const currentTeacherId = useAppSelector((state) => state.teacherTabs.currentTeacherId);
  const hasData = useAppSelector((state) => state.teacherTabs.studentData.length > 0);

  // Fetch tabs data only if we don't have data for this teacher in Redux
  useEffect(() => {
    if (location && teacherId) {
      // Only fetch if we don't have data or it's a different teacher
      if (currentTeacherId !== teacherId || !hasData) {
        dispatch(fetchTeacherTabsData({ location, teacherId }));
      }
    }
  }, [location, teacherId, dispatch, currentTeacherId, hasData]);

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-muted p-1.5 text-muted-foreground w-full overflow-x-auto gap-1">
          {TEACHER_TAB_ORDER.map((tabKey) => (
            <TabsTrigger
              key={tabKey}
              value={tabKey}
              className="whitespace-nowrap px-6 py-2 text-sm font-medium min-w-fit"
            >
              {TEACHER_TAB_CONFIGS[tabKey].title}
            </TabsTrigger>
          ))}
        </TabsList>

        {TEACHER_TAB_ORDER.map((tabKey) => {
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
                <TabComponent location={location} teacherId={teacherId} />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
