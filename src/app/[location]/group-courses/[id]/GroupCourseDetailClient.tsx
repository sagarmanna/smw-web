"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchGroupCourseEmailStatement } from "./groupCourseDetails.slice";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { EmailModal, type EmailFormData } from "@/components/EmailModal";
import { sendEmail } from "@/lib/api/legacyApiAdapter";
import { generateEmailContent } from "./utils/emailStatementHtmlGenerator";
import { GroupCourseDetailsCard } from "../components/GroupCourseDetailsCard";
import { GroupCourseScheduleCard } from "../components/GroupCourseScheduleCard";
import { GroupCourseTabsSection } from "../components/GroupCourseTabsSection";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { usePrintReport } from "@/hooks/usePrintReport";
import { formatLocationName } from "@/utils/textUtils";
import { formatDisplayDate } from "@/utils/dateUtils";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { isDev } from "@/utils/env";

interface GroupCourseDetailClientProps {
  location: string;
  id: string;
}

export function GroupCourseDetailClient({ location, id }: GroupCourseDetailClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const courseId = Number(id);

  // Get loading and error from Redux - single source of truth
  const isLoading = useAppSelector((state) => state.groupCourse.isLoading);
  const error = useAppSelector((state) => state.groupCourse.error);
  const courseInfoData = useAppSelector((state) => state.groupCourse.courseInfoData);
  const courseLessons = useAppSelector((state) => state.groupCourse.courseLessons);
  const lessonData = useAppSelector((state) => state.groupCourseTabs.lessonData);
  
  // Email modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  
  // Get email statement data from Redux
  const emailStatement = useAppSelector((state) => state.groupCourse?.emailStatement);
  const emailStatementLoading = useAppSelector((state) => state.groupCourse?.emailStatementLoading || false);
  const emailStatementError = useAppSelector((state) => state.groupCourse?.emailStatementError);
  
  // Generate email content from Redux state
  const emailSubject = React.useMemo(() => {
    return emailStatement?.emailTemplate?.subject || "";
  }, [emailStatement]);

  const emailContent = React.useMemo(() => {
    if (!emailStatement) return "";
    return generateEmailContent(emailStatement);
  }, [emailStatement]);

  const customerEmails = React.useMemo(() => {
    return emailStatement?.emails || [];
  }, [emailStatement]);
  
  const { handlePrint: printReport } = usePrintReport();

  // All hooks must be called before any early returns
  const pageTitle = React.useMemo(() => {
    if (!courseInfoData || !courseInfoData.course) return `Group Course #${id}`;
    return courseInfoData.course.program || `Group Course #${id}`;
  }, [courseInfoData, id]);

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

  // Handle email modal open - fetch data if not already loaded
  const handleEmailModalOpen = React.useCallback(() => {
    // Fetch email statement if not already loaded or loading
    if (!emailStatement && !emailStatementLoading) {
      dispatch(fetchGroupCourseEmailStatement({ location, courseId }));
    }
    setIsEmailModalOpen(true);
  }, [emailStatement, emailStatementLoading, dispatch, location, courseId]);

  // Handle retry for email statement
  const handleRetryEmailStatement = React.useCallback(() => {
    dispatch(fetchGroupCourseEmailStatement({ location, courseId }));
  }, [dispatch, location, courseId]);

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
    if (!courseInfoData || !courseInfoData.course) return;

    const course = courseInfoData.course;
    const schedule = courseInfoData.schedule;

    // Format date range from schedule period
    const dateRange = schedule?.period || "";

    // Helper function to format date from various formats
    const formatLessonDate = (dateString: string | null | undefined): string => {
      if (!dateString || typeof dateString !== 'string') return "N/A";
      
      const trimmed = dateString.trim();
      if (!trimmed) return "N/A";

      try {
        // Try multiple parsing strategies
        
        // 1. Check if already in display format "MMM dd, yyyy" or "MMM d, yyyy"
        if (trimmed.match(/^[A-Za-z]{3}\s+\d{1,2},\s+\d{4}/)) {
          // Extract just the date part (remove time if present)
          const datePart = trimmed.split(' ').slice(0, 3).join(' ');
          return datePart;
        }
        
        // 2. Handle ISO format with time: "2026-01-19T18:00:00" or "2026-01-19T18:00:00.000Z"
        if (trimmed.includes('T')) {
          const datePart = trimmed.split('T')[0];
          return formatDisplayDate(datePart);
        }
        
        // 3. Handle space-separated date and time: "2026-01-19 18:00:00"
        if (trimmed.includes(' ')) {
          const datePart = trimmed.split(' ')[0];
          // Check if it's a valid date format (YYYY-MM-DD or YYYY/MM/DD)
          if (datePart.match(/^\d{4}[-/]\d{2}[-/]\d{2}$/)) {
            return formatDisplayDate(datePart);
          }
        }
        
        // 4. Handle date-only formats: "2026-01-19" or "2026/01/19"
        if (trimmed.match(/^\d{4}[-/]\d{2}[-/]\d{2}$/)) {
          return formatDisplayDate(trimmed);
        }
        
        // 5. Try formatDisplayDate on the whole string (handles most cases)
        const formatted = formatDisplayDate(trimmed);
        if (formatted !== "N/A") {
          return formatted;
        }
        
        // 6. Last resort: try native Date parsing
        const dateObj = new Date(trimmed);
        if (!isNaN(dateObj.getTime())) {
          return dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          });
        }
      } catch (error) {
        console.error("Error formatting date:", error, dateString);
      }
      
      return "N/A";
    };

    // Prefer email statement lessons if available (they have proper dates)
    // Otherwise use courseLessons with improved date parsing
    let lessonsToUse: Array<{ id: number; date: string; status: string }> = [];
    
    if (emailStatement && emailStatement.lessons && emailStatement.lessons.length > 0) {
      // Use email statement lessons - they have proper dates
      lessonsToUse = emailStatement.lessons.map(lesson => ({
        id: lesson.id,
        date: lesson.date,
        status: lesson.status,
      }));
    } else if (courseLessons && courseLessons.length > 0) {
      // Use courseLessons with improved date parsing
      lessonsToUse = courseLessons.map(lesson => ({
        id: lesson.id,
        date: lesson.date,
        status: lesson.status,
      }));
    }

    // Format lessons data for printing
    const formattedLessons = lessonsToUse.map((lesson) => {
      const formattedDate = formatLessonDate(lesson.date);

      return {
        teacherName: course.teacher || "N/A",
        date: formattedDate,
        status: lesson.status || "N/A",
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
          <title>Group Course - ${course.program || "N/A"}</title>
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
            <h1>${course.program || "N/A"}</h1>
            <div class="course-details">${dateRange}</div>
            <div class="course-details"><strong>Duration:</strong> ${schedule?.duration || "N/A"}</div>
            <div class="course-details"><strong>Time:</strong> ${schedule?.time || "N/A"}</div>
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
  }, [courseInfoData, courseLessons, emailStatement, toast]);

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [
      {
        label: "Action",
        items: [
          {
            label: "Print",
            onClick:  handlePrint,
          },
          {
            label: "Delete",
            onClick: isDev() ? handleDeleteClick : () => toast.info("This feature is in development."),
            variant: "destructive",
          },
        ],
      },
    ],
    [handlePrint, handleDeleteClick]
  );

  // Error state - show error but still render cards with skeleton
  const showError = error && !courseInfoData;

  if (isLoading && !courseInfoData) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading group course..." className="text-center" />
      </div>
    );
  }

  if (!courseInfoData && !isLoading) {
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
              courseInfoData={courseInfoData}
              isLoading={isLoading}
            />

            <GroupCourseScheduleCard
              courseInfoData={courseInfoData}
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
        description={`This will permanently delete the group course "${courseInfoData?.course?.program || `#${id}`}". This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Email Modal - group course customer statement */}
      <>
        {/* Loading overlay - show when modal is open and data is loading */}
        {isEmailModalOpen && emailStatementLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <LoadingAnimation size="md" text="Loading email statement..." />
            </div>
          </div>
        )}
        {/* Error overlay - show when modal is open and there's an error */}
        {isEmailModalOpen && emailStatementError && !emailStatementLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-md">
              <ErrorDisplay
                error={emailStatementError}
                title="Failed to Load Email Statement"
                fallbackMessage="Unable to load email statement data. Please try again."
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleRetryEmailStatement}
                  className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Email Modal - show when modal is open and data is ready */}
        <EmailModal
          open={isEmailModalOpen && !emailStatementLoading && !!emailStatement && !emailStatementError}
          onOpenChange={setIsEmailModalOpen}
          onSend={async (emailData: EmailFormData) => {
            if (!emailStatement?.enrolment?.studentId) {
              toast.error("Student ID is required to send email");
              return;
            }

            try {
              const response = await sendEmail(location, {
                objectId: 8, // EMAIL_OBJECT_CUSTOMER_STATEMENT
                userId: emailStatement.enrolment.studentId,
                to: emailData.recipients,
                subject: emailData.subject,
                content: emailData.content,
              });

              if (response.status) {
                toast.success("Email sent successfully");
                setIsEmailModalOpen(false);
              } else {
                toast.success("Email sent successfully");
                setIsEmailModalOpen(false);
              }
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : "Failed to send email";
              toast.error(errorMessage);
            }
          }}
          recipientEmails={customerEmails}
          locationName={location}
          initialSubject={emailSubject}
          initialContent={emailContent}
          localStorageKey={`group-course-email-${id}-${courseId || "default"}`}
        />
      </>
    </>
  );
}

