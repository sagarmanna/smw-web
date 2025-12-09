"use client";

import { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { unscheduledLessonColumns, UnscheduledLessonData } from "../../../../[id]/studentTabConfigs";

interface UnscheduledLessonsTabProps {
  location: string;
  studentId: string;
}

export function UnscheduledLessonsTab({ location, studentId }: UnscheduledLessonsTabProps) {
  const data = useAppSelector((state) => state.studentTabs.unscheduledLessonData);
  const isLoading = useAppSelector((state) => state.studentTabs.unscheduledLessonLoading);
  const error = useAppSelector((state) => state.studentTabs.unscheduledLessonError);
  const [showAll, setShowAll] = useState(false);

  const handleChangeProgramTeacher = () => {
    // TODO: Implement change program/teacher functionality
    console.log('Change Program/Teacher');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Unscheduled Lessons</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleChangeProgramTeacher}>
              Change Program/Teacher..
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pt-0">
        {error ? (
          <div className="text-center py-8 text-red-500">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unscheduled-show-all"
                  checked={showAll}
                  onCheckedChange={(checked: boolean) => setShowAll(checked)}
                />
                <label
                  htmlFor="unscheduled-show-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Show All
                </label>
              </div>
            </div>
            <CustomTable
              data={data as UnscheduledLessonData[]}
              columns={unscheduledLessonColumns}
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
                    <span className="text-sm font-medium">No unscheduled lessons found</span>
                  </div>
                ) : undefined
              }
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

