"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { EmailModal, type EmailFormData } from "@/components/EmailModal";
import { sendEmail } from "@/lib/api/legacyApiAdapter";
import { getCustomerEmailAddresses } from "@/lib/api/customer.api";
import { usePrivateLessonDetails } from "../../private-lessons/hooks/usePrivateLessonDetails";
import { fetchEmailStatement } from "../../private-lessons/[id]/private-lesson-details.slice";
import { generateEmailContent } from "../../private-lessons/[id]/utils/emailStatementHtmlGenerator";
import { PrivateLessonDetailsCard } from "../../private-lessons/components/PrivateLessonDetailsCard";
import { PrivateLessonCostCard } from "../../private-lessons/components/PrivateLessonCostCard";
import { PrivateLessonScheduleCard } from "../../private-lessons/components/PrivateLessonScheduleCard";
import { PrivateLessonCommentsCard } from "../../private-lessons/components/PrivateLessonCommentsCard";
import { GroupLessonTabsSection } from "../../private-lessons/components/GroupLessonTabsSection";
import { toast } from "sonner";

interface GroupLessonDetailClientProps {
  location: string;
  id: string;
}

export function GroupLessonDetailClient({ location, id }: GroupLessonDetailClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const lessonId = id;

  const isLoading = useAppSelector((state) => state.privateLesson?.isLoading || false);
  const error = useAppSelector((state) => state.privateLesson?.error);
  const privateLessonInfo = useAppSelector((state) => state.privateLesson?.privateLessonInfo);

  const {
    details,
    comments,
    history,
    historyPagination,
    historyLoading,
    historyError,
    fetchHistory,
    saveDetails,
    savingDetails,
    saveCost,
    saveGroupStudentDiscount,
    saveUnschedule,
  } = usePrivateLessonDetails(location, lessonId);

  const emailStatement = useAppSelector((state) => state.privateLesson.emailStatement);
  const emailStatementLoading = useAppSelector((state) => state.privateLesson.emailStatementLoading);
  const emailStatementError = useAppSelector((state) => state.privateLesson.emailStatementError);

  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [customerEmails, setCustomerEmails] = React.useState<string[]>([]);

  const emailSubject = React.useMemo(() => {
    return emailStatement?.emailTemplate?.subject || "";
  }, [emailStatement]);

  const emailHeaderHtml = React.useMemo(() => {
    return emailStatement?.emailTemplate?.header?.trim() || "";
  }, [emailStatement]);

  const emailContent = React.useMemo(() => {
    if (!emailStatement) return "";
    return generateEmailContent(emailStatement);
  }, [emailStatement, isEmailModalOpen]);

  const recipientEmails = React.useMemo(() => {
    const toField = emailStatement?.emailTemplate?.to;
    if (toField && toField.trim() !== "") {
      return toField.split(",").map((e) => e.trim()).filter((e) => e);
    }
    return emailStatement?.emails || customerEmails;
  }, [emailStatement, customerEmails]);

  // Redirect to private-lessons if this ID is not a group lesson
  React.useEffect(() => {
    if (details && details.isGroup === false) {
      router.replace(`/${location}/private-lessons/${id}`);
    }
  }, [details?.isGroup, location, id, router]);

  // Fetch customer emails when mail modal opens
  React.useEffect(() => {
    const fetchCustomerEmails = async () => {
      if (isEmailModalOpen && details?.customerId) {
        try {
          const customerId =
            typeof details.customerId === "number"
              ? details.customerId
              : Number(details.customerId);
          if (customerId && !isNaN(customerId)) {
            const emails = await getCustomerEmailAddresses(location, customerId);
            setCustomerEmails(emails);
          } else {
            setCustomerEmails([]);
          }
        } catch {
          setCustomerEmails([]);
        }
      } else if (!isEmailModalOpen) {
        setCustomerEmails([]);
      }
    };
    fetchCustomerEmails();
  }, [isEmailModalOpen, details?.customerId, location]);

  const pageTitle = React.useMemo(() => {
    if (!details) return `Group Lesson #${id}`;
    return details.program || `Group Lesson #${id}`;
  }, [details, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Group Lessons",
        onClick: () => router.push(`/${location}/private-lessons`),
      },
    ],
    [location, router]
  );

  const handleMailClick = React.useCallback(() => {
    if (!emailStatement && !emailStatementLoading) {
      dispatch(fetchEmailStatement({ location, privateLessonId: lessonId }));
    }
    setIsEmailModalOpen(true);
  }, [dispatch, emailStatement, emailStatementLoading, location, lessonId]);

  const handleRetryEmailStatement = React.useCallback(() => {
    dispatch(fetchEmailStatement({ location, privateLessonId: lessonId }));
  }, [dispatch, location, lessonId]);

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [
      {
        label: "Action",
        items: [
          {
            label: "Mail",
            onClick: handleMailClick,
          },
        ],
      },
    ],
    [handleMailClick]
  );

  if (isLoading && !privateLessonInfo) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading group lesson..." className="text-center" />
      </div>
    );
  }

  if (!privateLessonInfo && !isLoading) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Group lesson not found"}
          title="Unable to Load Group Lesson Details"
          fallbackMessage="An unexpected error occurred while loading the group lesson details. Please try again later."
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-black -mt-2">
        {error && privateLessonInfo && (
          <div className="mb-4">
            <ErrorDisplay
              error={error}
              title="Unable to Load Group Lesson Details"
              fallbackMessage="An unexpected error occurred while loading the group lesson details. Please try again later."
            />
          </div>
        )}

        <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
          loading={isLoading}
          actionMenuGroups={actionMenuGroups}
          actionButtonAriaLabel="Group lesson actions"
          showProfileIcon={false}
          profileIconSize="md"
        />

        <div className="space-y-3 sm:space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-3 sm:space-y-4">
              <PrivateLessonDetailsCard
                details={details}
                onSaveDetails={saveDetails}
                savingDetails={savingDetails}
                isLoading={isLoading}
                location={location}
              />
              <PrivateLessonCostCard
                details={details}
                onSaveCost={saveCost}
                savingDetails={savingDetails}
                isLoading={isLoading}
              />
            </div>

            <div className="space-y-3 sm:space-y-4">
              <PrivateLessonScheduleCard
                details={details}
                isLoading={isLoading}
                location={location}
                hideGenerateInvoice={true}
                onUnschedule={saveUnschedule}
              />
              <PrivateLessonCommentsCard
                comments={comments}
                isLoading={isLoading}
              />
            </div>
          </div>

          <GroupLessonTabsSection
            students={privateLessonInfo?.students || []}
            history={history}
            historyPagination={historyPagination}
            historyLoading={historyLoading}
            historyError={historyError}
            onHistoryPageChange={fetchHistory}
            onSaveStudentDiscount={saveGroupStudentDiscount}
            savingDetails={savingDetails}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Email loading overlay */}
      {isEmailModalOpen && emailStatementLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <LoadingAnimation size="md" text="Loading email statement..." />
          </div>
        </div>
      )}

      {/* Email error overlay */}
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

      <EmailModal
        open={isEmailModalOpen && !emailStatementLoading && !!emailStatement && !emailStatementError}
        onOpenChange={setIsEmailModalOpen}
        onSend={async (emailData: EmailFormData) => {
          if (!details?.studentId) {
            toast.error("Student ID is required to send email");
            return;
          }
          try {
            const response = await sendEmail(location, {
              objectId: 8,
              userId: details.studentId,
              to: emailData.recipients,
              subject: emailData.subject,
              content: emailData.content,
            });
            if (response.status) {
              toast.success("Email sent successfully");
              setIsEmailModalOpen(false);
            } else {
              toast.error(response.message || "Failed to send email");
            }
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send email");
          }
        }}
        recipientEmails={recipientEmails}
        locationName={location}
        initialSubject={emailSubject || undefined}
        initialContent={emailContent || undefined}
        headerHtml={emailHeaderHtml || undefined}
        localStorageKey={`group-lesson-email-${id}-${details?.studentId || "default"}`}
      />
    </>
  );
}
