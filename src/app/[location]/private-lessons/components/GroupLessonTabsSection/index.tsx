"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupStudentsTab } from "../GroupStudentsTab";
import { PrivateLessonHistoryCard } from "../PrivateLessonHistoryCard";
import { GroupLessonStudent, PrivateLessonHistory } from "../../types";
import { PaginationInfo } from "../../[id]/private-lesson-details.api";

interface GroupLessonTabsSectionProps {
  students: GroupLessonStudent[];
  history: PrivateLessonHistory[];
  historyPagination: PaginationInfo | null;
  historyLoading: boolean;
  historyError: string | null;
  onHistoryPageChange: (page: number) => void;
  onSaveStudentDiscount: (studentId: number, discount: string) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
}

export function GroupLessonTabsSection({
  students,
  history,
  historyPagination,
  historyLoading,
  historyError,
  onHistoryPageChange,
  onSaveStudentDiscount,
  savingDetails = false,
  isLoading = false,
}: GroupLessonTabsSectionProps) {
  const [activeTab, setActiveTab] = React.useState<string>("students");

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-12 items-center justify-start rounded-md bg-muted p-1.5 text-muted-foreground w-full overflow-x-auto gap-1">
          <TabsTrigger
            value="students"
            className="whitespace-nowrap px-6 py-2 text-sm font-medium min-w-fit"
          >
            Students
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="whitespace-nowrap px-6 py-2 text-sm font-medium min-w-fit"
          >
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-4">
          <GroupStudentsTab
            students={students}
            isLoading={isLoading}
            onSaveStudentDiscount={onSaveStudentDiscount}
            savingDiscount={savingDetails}
          />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <PrivateLessonHistoryCard
            history={history}
            isLoading={historyLoading}
            pagination={historyPagination}
            historyLoading={historyLoading}
            historyError={historyError}
            onPageChange={onHistoryPageChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
