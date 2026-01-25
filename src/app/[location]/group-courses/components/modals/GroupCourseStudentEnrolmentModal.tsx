"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { getStudentsList, type StudentRow } from "@/app/[location]/students/studentsListing.api";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { toast } from "sonner";
import {
  DiscountDetailModal,
  type DiscountDetailFormData,
} from "@/app/[location]/students/components/StudentEnrolmentsCard/AddGroupModal/DiscountDetailModal";
import {
  LessonDetailModal,
  type LessonDetail,
} from "@/app/[location]/students/components/StudentEnrolmentsCard/AddGroupModal/LessonDetailModal";
import { applyGroupEnrolment, confirmGroupEnrolment, type LessonPreviewDto, fetchGroupCourses, type GroupCourseOption } from "@/app/[location]/students/[id]/students-details.api";
import { fetchGroupCourseStudents } from "@/app/[location]/group-courses/[id]/groupCourseTabs.slice";
import { useAppDispatch } from "@/redux/hooks";

interface GroupCourseStudentEnrolmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  courseId: number;
  onEnrolmentComplete?: () => void;
}

// Group enrolment option structure (simplified since we already know the course)
interface GroupEnrolmentOption {
  id: string;
  course: string;
  teacher: string;
  day: string;
  rate: number;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
}

export function GroupCourseStudentEnrolmentModal({
  open,
  onOpenChange,
  location,
  courseId,
  onEnrolmentComplete,
}: GroupCourseStudentEnrolmentModalProps) {
  const dispatch = useAppDispatch();
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>("");
  const [studentOptions, setStudentOptions] = React.useState<SearchableSelectOption[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = React.useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = React.useState(false);
  const [isLessonDetailModalOpen, setIsLessonDetailModalOpen] = React.useState(false);
  const [discountData, setDiscountData] = React.useState<DiscountDetailFormData | null>(null);
  const [apiLessons, setApiLessons] = React.useState<LessonDetail[] | null>(null);
  const [enrolmentId, setEnrolmentId] = React.useState<number | undefined>(undefined);
  const [groupEnrolmentInfo, setGroupEnrolmentInfo] = React.useState<GroupEnrolmentOption | null>(null);

  // Fetch students when modal opens
  React.useEffect(() => {
    if (open) {
      loadStudents();
    } else {
      // Reset state when modal closes
      setSelectedStudentId("");
      setIsDiscountModalOpen(false);
      setIsLessonDetailModalOpen(false);
      setDiscountData(null);
      setApiLessons(null);
      setEnrolmentId(undefined);
      setGroupEnrolmentInfo(null);
    }
  }, [open]);

  const loadStudents = React.useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const response = await getStudentsList(location, {
        page: 1,
        limit: 1000, // Fetch a large number of students for the dropdown
        showActive: true,
      });

      if (response?.success && response.data?.body) {
        const options: SearchableSelectOption[] = response.data.body.map((student: StudentRow) => ({
          value: student.id.toString(),
          label: `${student.firstName} ${student.lastName}`,
        }));
        setStudentOptions(options);
      } else {
        toast.error(response?.message || "Failed to load students");
        setStudentOptions([]);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      toast.error("Failed to load students");
      setStudentOptions([]);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [location]);

  const handleNext = async () => {
    if (!selectedStudentId) {
      toast.error("Please select a student");
      return;
    }
    
    // Fetch group course details to get complete info (day, startDate, endDate, etc.)
    try {
      const coursesResponse = await fetchGroupCourses(location, selectedStudentId);
      if (coursesResponse?.success && coursesResponse.data) {
        // Find the course matching our courseId
        const matchingCourse = coursesResponse.data.find(
          (course: GroupCourseOption) => course.id === courseId.toString()
        );
        
        if (matchingCourse) {
          // Convert GroupCourseOption to GroupEnrolmentOption
          const groupEnrolment: GroupEnrolmentOption = {
            id: matchingCourse.id,
            course: matchingCourse.course,
            teacher: matchingCourse.teacher,
            day: matchingCourse.day,
            rate: matchingCourse.rate,
            fromTime: matchingCourse.fromTime,
            duration: matchingCourse.duration,
            startDate: matchingCourse.startDate,
            endDate: matchingCourse.endDate,
          };
          setGroupEnrolmentInfo(groupEnrolment);
        } else {
          // Fallback: create minimal group enrolment info
          toast.warning("Could not find complete course details. Some information may be missing.");
          setGroupEnrolmentInfo({
            id: courseId.toString(),
            course: "Group Course",
            teacher: "",
            day: "Monday",
            rate: 0,
            fromTime: "",
            duration: "",
            startDate: "",
            endDate: "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      // Continue with fallback
      setGroupEnrolmentInfo({
        id: courseId.toString(),
        course: "Group Course",
        teacher: "",
        day: "Monday",
        rate: 0,
        fromTime: "",
        duration: "",
        startDate: "",
        endDate: "",
      });
    }
    
    // Open discount detail modal
    setIsDiscountModalOpen(true);
  };

  const handleDiscountPreview = (data: DiscountDetailFormData) => {
    setDiscountData(data);
    // Close discount modal and open lesson detail modal
    setIsDiscountModalOpen(false);
    setIsLessonDetailModalOpen(true);
  };

  const handleApiPreview = async (lessons: LessonPreviewDto[], enrolmentIdFromApi?: number) => {
    // Transform API lessons to LessonDetail format
    const transformedLessons: LessonDetail[] = lessons.map((lesson) => ({
      id: lesson.id.toString(),
      dateTime: lesson.dateTime,
      duration: lesson.duration,
      price: lesson.price,
      discount: lesson.discount,
      total: lesson.total,
    }));
    setApiLessons(transformedLessons);
    if (enrolmentIdFromApi) {
      setEnrolmentId(enrolmentIdFromApi);
    }
    // Close discount modal and open lesson detail modal
    setIsDiscountModalOpen(false);
    setIsLessonDetailModalOpen(true);
  };

  const handleLessonDetailConfirm = async (lessons: LessonDetail[]) => {
    if (!selectedStudentId || !discountData) {
      toast.error("Missing required information");
      return;
    }

    // If we have enrolmentId from API, call confirm API
    if (location && enrolmentId) {
      try {
        const response = await confirmGroupEnrolment(location, enrolmentId);
        if (response?.success) {
          toast.success("Group enrolment confirmed successfully");
          
          // Refresh student list
          if (onEnrolmentComplete) {
            onEnrolmentComplete();
          } else {
            // Fallback: dispatch refresh action
            dispatch(fetchGroupCourseStudents({ location, courseId, page: 1 }));
          }
          
          // Close all modals
          setIsLessonDetailModalOpen(false);
          onOpenChange(false);
        } else {
          toast.error(response?.message || "Failed to confirm group enrolment");
        }
      } catch (error) {
        console.error("Error confirming group enrolment:", error);
        toast.error("Failed to confirm group enrolment");
      }
    } else {
      // Fallback: just close modals (shouldn't happen in normal flow)
      toast.warning("Enrolment ID not available. Please try again.");
      setIsLessonDetailModalOpen(false);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };


  return (
    <>
      <Dialog open={open && !isDiscountModalOpen && !isLessonDetailModalOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Add Group Enrolment
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Student Selection */}
            <div className="space-y-2">
              <Label htmlFor="enrolment-student">Student</Label>
              {isLoadingStudents ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingAnimation size="sm" text="Loading students..." />
                </div>
              ) : (
                <SearchableSelect
                  id="enrolment-student"
                  options={studentOptions}
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                  placeholder="Select Student"
                  searchPlaceholder="Search students..."
                  emptyText="No students available"
                />
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleNext} disabled={!selectedStudentId || isLoadingStudents}>
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discount Detail Modal */}
      {selectedStudentId && (
        <DiscountDetailModal
          open={isDiscountModalOpen}
          onOpenChange={setIsDiscountModalOpen}
          onPreview={handleDiscountPreview}
          onApiPreview={handleApiPreview}
          location={location}
          studentId={selectedStudentId}
          courseId={courseId.toString()}
          onClose={() => {
            // Keep discount modal open if we're going to lesson detail
            if (!isLessonDetailModalOpen) {
              setIsDiscountModalOpen(false);
            }
          }}
        />
      )}

      {/* Lesson Detail Modal - Only show if we have all required data */}
      {selectedStudentId && discountData && groupEnrolmentInfo && (
        <LessonDetailModal
          open={isLessonDetailModalOpen}
          onOpenChange={setIsLessonDetailModalOpen}
          onConfirm={handleLessonDetailConfirm}
          groupEnrolment={groupEnrolmentInfo}
          discountData={discountData}
          apiLessons={apiLessons}
          location={location}
          enrolmentId={enrolmentId}
        />
      )}
    </>
  );
}
