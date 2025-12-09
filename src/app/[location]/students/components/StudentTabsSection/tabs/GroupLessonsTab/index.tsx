"use client";

import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { groupLessonColumns, GroupLessonData } from "../../../../[id]/studentTabConfigs";

interface GroupLessonsTabProps {
  location: string;
  studentId: string;
}

export function GroupLessonsTab({ location, studentId }: GroupLessonsTabProps) {
  const data = useAppSelector((state) => state.studentTabs.groupLessonData);
  const isLoading = useAppSelector((state) => state.studentTabs.groupLessonLoading);
  const error = useAppSelector((state) => state.studentTabs.groupLessonError);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Group Lessons</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {error ? (
          <div className="text-center py-8 text-red-500">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <CustomTable
            data={data as GroupLessonData[]}
            columns={groupLessonColumns}
            size="compact"
            variant="striped"
            enableSorting={true}
            enableExport={false}
            enablePrint={false}
            enableSearch={false}
            enableFilter={false}
            className="border-0 w-full"
            isLoading={isLoading}
            customEmptyState={
              !isLoading && data.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                  <div className="text-4xl">📋</div>
                  <span className="text-sm font-medium">No group lessons found</span>
                </div>
              ) : undefined
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

