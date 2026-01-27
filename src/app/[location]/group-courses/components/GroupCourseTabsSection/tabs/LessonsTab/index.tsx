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
import { refreshCourseLessons } from "../../../../[id]/groupCourseDetails.slice";
import { editOnlineType } from "../../../../[id]/groupCourseDetails.api";
import { SubstituteTeacherModal } from "../../../modals/SubstituteTeacherModal";
import { EditOnlineTypeModal } from "../../../modals/EditOnlineTypeModal";
import { toast } from "sonner";
import { isDev } from "@/utils/env";

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
  const [isUpdatingOnlineType, setIsUpdatingOnlineType] = useState(false);

  useEffect(() => {
    // Only fetch if we don't have data for this course yet
    if (currentCourseId !== courseId) {
      dispatch(fetchGroupCourseTabsData({ location, courseId }));
    }
  }, [location, courseId, dispatch, currentCourseId]);

  // Use API response as-is - no formatting
  const formattedData = useMemo(() => {
    return data.map((lesson) => ({
      ...lesson,
      // Use date from API response as-is (no modification)
      date: lesson.date || "N/A",
    }));
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

  const handleEditOnlineSave = async (isOnline: boolean, lessonIds: string[]) => {
    if (isUpdatingOnlineType) return;

    setIsUpdatingOnlineType(true);
    
    try {
      // Convert lessonIds from string[] to number[] for API
      const lessonIdsNumbers = lessonIds.map((id) => parseInt(id, 10));
      
      // Call API to update online type
      const result = await editOnlineType(location, courseId, {
        lessonIds: lessonIdsNumbers,
        online: isOnline ? 1 : 0,
      });

      if (!result || !result.success) {
        throw new Error(result?.message || "Failed to update online type");
      }

      // Update Redux state optimistically
      dispatch(updateLessonsOnlineStatus({ lessonIds, isOnline }));
      
      // Refresh lessons from API to ensure data consistency
      await dispatch(refreshCourseLessons({ location, courseId })).unwrap();
      
      // Refresh tabs data to sync with updated lessons
      dispatch(fetchGroupCourseTabsData({ location, courseId }));

      toast.success(
        `${lessonIds.length} lesson(s) updated to ${isOnline ? "Online" : "In Class"}`
      );
      setSelectedLessonIds(new Set());
    } catch (error) {
      console.error("Error updating online type:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update online type";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingOnlineType(false);
    }
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
                <DropdownMenuItem onClick={isDev() ? handleSubstituteTeacher : () => toast.info("This feature is in development.")}>
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
        isLoading={isUpdatingOnlineType}
      />
    </>
  );
}

