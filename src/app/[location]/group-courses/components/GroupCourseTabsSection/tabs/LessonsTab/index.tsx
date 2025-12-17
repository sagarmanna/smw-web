"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { lessonColumns, LessonData } from "../../../../[id]/groupCourseTabConfigs";
import { fetchGroupCourseTabsData, updateLessonsOnlineStatus } from "../../../../[id]/groupCourseTabs.slice";
import { formatDisplayDate } from "@/utils/dateUtils";
import { SubstituteTeacherModal } from "../../../modals/SubstituteTeacherModal";
import { EditOnlineTypeModal } from "../../../modals/EditOnlineTypeModal";
import { toast } from "sonner";

interface LessonsTabProps {
  location: string;
  courseId: number;
}

export function LessonsTab({ location, courseId }: LessonsTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.groupCourseTabs.lessonData);
  const isLoading = useAppSelector((state) => state.groupCourseTabs.isLoading);
  const error = useAppSelector((state) => state.groupCourseTabs.error);
  const currentCourseId = useAppSelector((state) => state.groupCourseTabs.currentCourseId);

  const [selectedLessonIds, setSelectedLessonIds] = useState<Set<string>>(new Set());
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState(false);
  const [isEditOnlineModalOpen, setIsEditOnlineModalOpen] = useState(false);

  useEffect(() => {
    // Only fetch if we don't have data for this course yet
    if (currentCourseId !== courseId) {
      dispatch(fetchGroupCourseTabsData({ location, courseId }));
    }
  }, [location, courseId, dispatch, currentCourseId]);

  const formattedData = useMemo(() => {
    return data.map((lesson) => {
      // Format: "YYYY-MM-DD HH:MM AM/PM" -> "MMM dd, yyyy @ HH:MM AM/PM"
      if (!lesson.date) return { ...lesson, date: "N/A" };
      
      try {
        // Check if date includes time (format: "YYYY-MM-DD HH:MM AM/PM")
        const parts = lesson.date.split(' ');
        if (parts.length >= 3) {
          const datePart = parts[0];
          const timePart = parts.slice(1).join(' ');
          const formattedDate = formatDisplayDate(datePart);
          return { ...lesson, date: `${formattedDate} @ ${timePart}` };
        } else {
          // Just date, format normally
          return { ...lesson, date: formatDisplayDate(lesson.date) };
        }
      } catch {
        return { ...lesson, date: lesson.date };
      }
    });
  }, [data]);

  const selectedLessons = useMemo(() => {
    return data.filter((lesson) => selectedLessonIds.has(lesson.id));
  }, [data, selectedLessonIds]);

  const handleToggleSelection = (lessonId: string) => {
    setSelectedLessonIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  const handleSelectAll = useCallback(() => {
    if (selectedLessonIds.size === data.length) {
      setSelectedLessonIds(new Set());
    } else {
      setSelectedLessonIds(new Set(data.map((lesson) => lesson.id)));
    }
  }, [data, selectedLessonIds.size]);

  const handleSubstituteTeacher = () => {
    if (selectedLessons.length === 0) {
      toast.error("Please select at least one lesson");
      return;
    }
    setIsSubstituteModalOpen(true);
  };

  const handleEditOnlineType = () => {
    if (selectedLessons.length === 0) {
      toast.error("Please select at least one lesson");
      return;
    }
    setIsEditOnlineModalOpen(true);
  };

  const handleSubstituteSave = (teacherId: string, lessonIds: string[]) => {
    // TODO: Implement API call to substitute teacher
    toast.success(`Substitute teacher assigned to ${lessonIds.length} lesson(s)`);
    setSelectedLessonIds(new Set());
  };

  const handleEditOnlineSave = (isOnline: boolean, lessonIds: string[]) => {
    // Update Redux state immediately
    dispatch(updateLessonsOnlineStatus({ lessonIds, isOnline }));
    
    // TODO: Implement API call to update online type
    toast.success(
      `${lessonIds.length} lesson(s) updated to ${isOnline ? "Online" : "In Class"}`
    );
    setSelectedLessonIds(new Set());
  };

  const columns = useMemo(
    () => [
      {
        id: "select",
        header: () => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={
                data.length > 0 && selectedLessonIds.size === data.length
              }
              onCheckedChange={handleSelectAll}
            />
          </div>
        ),
        cell: ({ row }: { row: { original: LessonData } }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={selectedLessonIds.has(row.original.id)}
              onCheckedChange={() => handleToggleSelection(row.original.id)}
            />
          </div>
        ),
        size: 50,
        enableSorting: false,
      },
      ...lessonColumns,
    ],
    [data.length, selectedLessonIds, handleSelectAll]
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Lessons</CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Action
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSubstituteTeacher}>
                  Substitute Teacher
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEditOnlineType}>
                  Edit Online Type
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <div className="text-center py-8 text-red-500">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <CustomTable
              data={formattedData as LessonData[]}
              columns={columns}
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
                    <div className="text-4xl">📚</div>
                    <span className="text-sm font-medium">No lessons found</span>
                  </div>
                ) : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      <SubstituteTeacherModal
        open={isSubstituteModalOpen}
        onOpenChange={setIsSubstituteModalOpen}
        selectedLessons={selectedLessons}
        onSave={handleSubstituteSave}
      />

      <EditOnlineTypeModal
        open={isEditOnlineModalOpen}
        onOpenChange={setIsEditOnlineModalOpen}
        selectedLessons={selectedLessons}
        onSave={handleEditOnlineSave}
      />
    </>
  );
}

