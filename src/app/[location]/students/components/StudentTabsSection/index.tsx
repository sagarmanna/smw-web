"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchStudentTabsData } from "../../[id]/studentTabs.slice";
import {
  STUDENT_TAB_CONFIGS,
  STUDENT_TAB_ORDER,
} from "../../[id]/studentTabConfigs";
import { TabContent } from "@/components/TabContent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface StudentTabsSectionProps {
  location: string;
  studentId: string;
}

export function StudentTabsSection({ location, studentId }: StudentTabsSectionProps) {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<string>(STUDENT_TAB_ORDER[0]);
  const isLoading = useAppSelector((state) => state.studentTabs.isLoading);
  const error = useAppSelector((state) => state.studentTabs.error);
  const currentStudentId = useAppSelector((state) => state.studentTabs.currentStudentId);
  
  // Get tabs data from Redux
  const privateLessonData = useAppSelector((state) => state.studentTabs.privateLessonData);
  const groupLessonData = useAppSelector((state) => state.studentTabs.groupLessonData);
  const absentLessonData = useAppSelector((state) => state.studentTabs.absentLessonData);
  const unscheduledLessonData = useAppSelector((state) => state.studentTabs.unscheduledLessonData);
  const commentData = useAppSelector((state) => state.studentTabs.commentData);
  const historyData = useAppSelector((state) => state.studentTabs.historyData);

  // Tab data mapping for easy access
  const tabDataMap: Record<string, unknown[]> = {
    privateLessonData,
    groupLessonData,
    absentLessonData,
    unscheduledLessonData,
    commentData,
    historyData,
  };

  // Fetch tabs data only if we don't have data for this student in Redux
  useEffect(() => {
    if (location && studentId) {
      // Only fetch if we don't have data or it's a different student
      if (currentStudentId !== studentId) {
        dispatch(fetchStudentTabsData({ location, studentId }));
      }
    }
  }, [location, studentId, dispatch, currentStudentId]);

  const handleShowMore = (tabKey: string) => {
    // TODO: Implement show more functionality
    console.log('Show more for tab:', tabKey);
  };

  const handleAdd = (tabKey: string) => {
    // TODO: Implement add functionality
    console.log('Add for tab:', tabKey);
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
          const config = STUDENT_TAB_CONFIGS[tabKey];
          const data = tabDataMap[config.dataKey as keyof typeof tabDataMap] || [];
          
          // Define bottom content for comments tab
          const commentsBottomContent = tabKey === "comments" ? (
            <div className="mt-4 flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Type message"
                className="flex-grow"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : undefined;

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
                <TabContent
                  title={config.title}
                  data={data}
                  columns={config.columns || []}
                  loading={isLoading && activeTab === tabKey}
                  hasAddButton={config.hasAddButton}
                  onAdd={() => handleAdd(tabKey)}
                  emptyState={config.emptyState}
                  hasTable={config.hasTable}
                  bottomContent={commentsBottomContent}
                  showMoreButton={config.showMoreButton}
                  onShowMore={() => handleShowMore(tabKey)}
                  showAllCheckbox={config.showAllCheckbox}
                  dropdownItems={config.dropdownItems}
                  dropdownLabel={config.dropdownLabel}
                />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

