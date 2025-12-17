"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { GroupCourseDetailsCard } from "../components/GroupCourseDetailsCard";
import { GroupCourseScheduleCard } from "../components/GroupCourseScheduleCard";
import { GroupCourseTabsSection } from "../components/GroupCourseTabsSection";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { usePrintReport } from "@/hooks/usePrintReport";
import { formatLocationName } from "@/utils/textUtils";
import { formatDisplayDate } from "@/utils/dateUtils";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

interface GroupCourseDetailClientProps {
  location: string;
  id: string;
}

export function GroupCourseDetailClient({ location, id }: GroupCourseDetailClientProps) {
  const router = useRouter();
  const courseId = Number(id);

  // Get loading and error from Redux - single source of truth
  const isLoading = useAppSelector((state) => state.groupCourse.isLoading);
  const error = useAppSelector((state) => state.groupCourse.error);
  const courseInfo = useAppSelector((state) => state.groupCourse.courseInfo);
  const lessonData = useAppSelector((state) => state.groupCourseTabs.lessonData);
  
  const { handlePrint: printReport } = usePrintReport();

  // All hooks must be called before any early returns
  const pageTitle = React.useMemo(() => {
    if (!courseInfo) return `Group Course #${id}`;
    return `Group Course / ${courseInfo.course}`;
  }, [courseInfo, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Group Courses",
        onClick: () => router.push(`/${location}/group-courses`),
      },
    ],
    [location, router]
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = React.useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(async () => {
    setIsDeleting(true);
    try {
      // TODO: Implement API call to delete group course
      // const response = await deleteGroupCourse(location, courseId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success("Group course deleted successfully");
      // Redirect to group courses list
      router.push(`/${location}/group-courses`);
    } catch (error: unknown) {
      const errorResponse = error as { errorCode?: string; message?: string };
      const errorMessage = errorResponse.message || "Failed to delete group course";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [location, courseId, router]);

  const handlePrint = React.useCallback(() => {
    if (!courseInfo) return;

    // Format date range
    const dateRange = courseInfo.startDate && courseInfo.endDate
      ? `${formatDisplayDate(courseInfo.startDate)}-${formatDisplayDate(courseInfo.endDate)}`
      : "";

    // Format lessons data for printing - just date without time
    const formattedLessons = lessonData.map((lesson) => {
      let formattedDate = "N/A";
      if (lesson.date) {
        try {
          // Extract just the date part (YYYY-MM-DD)
          const parts = lesson.date.split(' ');
          const datePart = parts[0];
          formattedDate = formatDisplayDate(datePart);
        } catch {
          formattedDate = lesson.date;
        }
      }

      return {
        teacherName: courseInfo.teacher,
        date: formattedDate,
        status: lesson.status,
      };
    });

    // Create custom print HTML to match the exact format
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to print");
      return;
    }

    // Build table rows
    const tableRows = formattedLessons.map((lesson) => {
      return `
        <tr>
          <td>${lesson.teacherName}</td>
          <td>${lesson.date}</td>
          <td>${lesson.status}</td>
        </tr>
      `;
    }).join('');

    // Create HTML content with course details header
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Group Course - ${courseInfo.course}</title>
          <style>
            @page { size: A4; margin: 0.5in; }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              font-size: 12px; 
              color: #000; 
            }
            .course-header {
              margin-bottom: 20px;
            }
            .course-header h1 {
              font-size: 18px;
              font-weight: bold;
              margin: 0 0 8px 0;
            }
            .course-details {
              font-size: 13px;
              margin: 4px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="course-header">
            <h1>${courseInfo.course}</h1>
            <div class="course-details">${dateRange}</div>
            <div class="course-details"><strong>Duration:</strong> ${courseInfo.duration}</div>
            <div class="course-details"><strong>Time:</strong> ${courseInfo.fromTime}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Teacher Name</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }, [courseInfo, lessonData, toast]);

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [
      {
        label: "Action",
        items: [
          {
            label: "Print",
            onClick: handlePrint,
          },
          {
            label: "Delete",
            onClick: handleDeleteClick,
            variant: "destructive",
          },
        ],
      },
    ],
    [handlePrint, handleDeleteClick]
  );

  // Error state - show error but still render cards with skeleton
  const showError = error && !courseInfo;

  if (isLoading && !courseInfo) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading group course..." className="text-center" />
      </div>
    );
  }

  if (!courseInfo && !isLoading) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Group course not found"}
          title="Unable to Load Group Course Details"
          fallbackMessage="An unexpected error occurred while loading the group course details. Please try again later."
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-black -mt-2">
        {showError && (
          <div className="mb-4">
            <ErrorDisplay
              error={error}
              title="Unable to Load Group Course Details"
              fallbackMessage="An unexpected error occurred while loading the group course details. Please try again later."
            />
          </div>
        )}
        
        <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
          loading={isLoading}
          actionMenuGroups={actionMenuGroups}
          actionButtonAriaLabel="Group course actions"
          showProfileIcon={false}
        />

        {/* Main Content - Details and Schedule Cards Side by Side */}
        <div className="space-y-3 sm:space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <GroupCourseDetailsCard
              courseInfo={courseInfo}
              isLoading={isLoading}
            />

            <GroupCourseScheduleCard
              courseInfo={courseInfo}
              isLoading={isLoading}
            />
          </div>

          {/* Tabs Section */}
          <GroupCourseTabsSection location={location} courseId={courseId} />
        </div>
      </div>

      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Are you sure you want to delete this group course?"
        description={`This will permanently delete the group course "${courseInfo?.course}". This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}

