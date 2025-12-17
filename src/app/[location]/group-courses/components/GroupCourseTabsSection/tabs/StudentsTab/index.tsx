"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Mail, Printer } from "lucide-react";
import { studentColumns, StudentData } from "../../../../[id]/groupCourseTabConfigs";
import { fetchGroupCourseTabsData } from "../../../../[id]/groupCourseTabs.slice";

interface StudentsTabProps {
  location: string;
  courseId: number;
}

export function StudentsTab({ location, courseId }: StudentsTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.groupCourseTabs.studentData);
  const isLoading = useAppSelector((state) => state.groupCourseTabs.isLoading);
  const error = useAppSelector((state) => state.groupCourseTabs.error);
  const currentCourseId = useAppSelector((state) => state.groupCourseTabs.currentCourseId);

  useEffect(() => {
    // Only fetch if we don't have data for this course yet
    if (currentCourseId !== courseId) {
      dispatch(fetchGroupCourseTabsData({ location, courseId }));
    }
  }, [location, courseId, dispatch, currentCourseId]);

  const columnsWithActions = [
    ...studentColumns,
    {
      id: "actions",
      header: "",
      cell: ({ row }: { row: { original: StudentData } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => {
              // TODO: Implement edit discount
              console.log("Edit discount for", row.original.studentName);
            }}
          >
            Edit Discount
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              // TODO: Implement email
              console.log("Email", row.original.studentName);
            }}
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              // TODO: Implement print
              console.log("Print", row.original.studentName);
            }}
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 200,
      enableSorting: false,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Students</CardTitle>
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {error ? (
          <div className="text-center py-8 text-red-500">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <CustomTable
            data={data as StudentData[]}
            columns={columnsWithActions}
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
                  <div className="text-4xl">👥</div>
                  <span className="text-sm font-medium">No students found</span>
                </div>
              ) : undefined
            }
          />
        )}
      </CardContent>
    </Card>
  );
}

