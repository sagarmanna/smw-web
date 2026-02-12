"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Printer } from "lucide-react";
import { StudentData } from "../../../../[id]/groupCourseTabConfigs";
import { fetchGroupCourseStudents } from "../../../../[id]/groupCourseTabs.slice";
import { GroupCourseStudentEnrolmentModal } from "../../../modals/GroupCourseStudentEnrolmentModal";
import { EditStudentDiscountModal, parseDiscountFromApi, type EditDiscountFormData } from "../../../modals/EditStudentDiscountModal";
import { EmailModal, type EmailFormData } from "@/components/EmailModal";
import { sendEmail } from "@/lib/api/legacyApiAdapter";
import { getCustomerEmailAddresses } from "@/lib/api/customer.api";
import { getEnrolmentEmailStatement } from "@/app/[location]/enrolments/[id]/enrolment-details.api";
import type { EnrolmentEmailStatementBody } from "@/app/[location]/enrolments/[id]/enrolment-details.api";
import { generateEmailContent } from "@/app/[location]/enrolments/[id]/utils/emailStatementHtmlGenerator";
import { toast } from "sonner";
import { isDev } from "@/utils/env";
import { getEnrolmentDiscountPreview, updateGroupEnrolmentDiscount, getGroupEnrolmentPrintDetails } from "@/app/[location]/enrolments/[id]/enrolment-details.api";
import { generateGroupEnrolmentPrintHtml } from "@/app/[location]/group-courses/utils/groupCoursestPrintUtils";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";

interface StudentsTabProps {
  location: string;
  courseId: number;
}

export function StudentsTab({ location, courseId }: StudentsTabProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const data = useAppSelector((state) => state.groupCourseTabs.studentData);
  const pagination = useAppSelector((state) => state.groupCourseTabs.studentPagination);
  const isLoading = useAppSelector((state) => state.groupCourseTabs.studentsLoading);
  const error = useAppSelector((state) => state.groupCourseTabs.studentsError);
  const [isEnrolmentModalOpen, setIsEnrolmentModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalStudent, setEmailModalStudent] = useState<StudentData | null>(null);
  const [customerEmails, setCustomerEmails] = useState<string[]>([]);
  const [emailStatement, setEmailStatement] = useState<EnrolmentEmailStatementBody | null>(null);
  const [emailStatementLoading, setEmailStatementLoading] = useState(false);
  const [emailStatementError, setEmailStatementError] = useState<string | null>(null);

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRows = pagination?.total || data.length;
  const rowsPerPage = pagination?.limit || data.length || 10;

  // Fetch email statement and customer emails when email modal opens
  useEffect(() => {
    const fetchEmailData = async () => {
      if (isEmailModalOpen && emailModalStudent) {
        // Fetch email statement if enrolmentId is available
        if (emailModalStudent.enrolmentId) {
          setEmailStatementLoading(true);
          setEmailStatementError(null);
          try {
            const result = await getEnrolmentEmailStatement(
              location,
              emailModalStudent.enrolmentId.toString()
            );
            if (result && result.success) {
              setEmailStatement(result.data.body);
              // Set emails from email statement
              setCustomerEmails(result.data.body.emails || []);
            } else {
              setEmailStatementError(result?.message || "Failed to fetch email statement");
              setEmailStatement(null);
            }
          } catch (error) {
            console.error("Error fetching email statement:", error);
            setEmailStatementError(
              error instanceof Error ? error.message : "Failed to fetch email statement"
            );
            setEmailStatement(null);
          } finally {
            setEmailStatementLoading(false);
          }
        } else if (emailModalStudent.customerId) {
          // Fallback to fetching customer emails if no enrolmentId
          try {
            const emails = await getCustomerEmailAddresses(
              location,
              emailModalStudent.customerId
            );
            setCustomerEmails(emails);
          } catch (error) {
            console.error("Error fetching customer emails:", error);
            setCustomerEmails([]);
          }
        }
      } else if (!isEmailModalOpen) {
        // Reset when modal closes
        setCustomerEmails([]);
        setEmailStatement(null);
        setEmailStatementError(null);
      }
    };

    fetchEmailData();
  }, [isEmailModalOpen, emailModalStudent, location]);

  const baseColumns: ColumnDef<StudentData>[] = useMemo(
    () => [
      {
        accessorKey: "studentName",
        header: "Student Name",
        cell: ({ row }) => {
          const { studentName, studentId } = row.original;

          if (!studentId) {
            return studentName || "N/A";
          }

          return (
            <span
              onClick={() => router.push(`/${location}/students/${studentId}`)}
              className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              {studentName}
            </span>
          );
        },
      },
      {
        accessorKey: "customerName",
        header: "Customer Name",
        cell: ({ row }) => {
          const { customerName, customerId } = row.original;

          if (!customerId) {
            return customerName || "N/A";
          }

          return (
            <span
              onClick={() => router.push(`/${location}/customers/${customerId}`)}
              className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              {customerName}
            </span>
          );
        },
      },
      {
        accessorKey: "discount",
        header: "Discount",
      },
    ],
    [router, location]
  );

  const columnsWithActions: ColumnDef<StudentData>[] = useMemo(
    () => [
      ...baseColumns,
      {
        id: "actions",
        header: "",
        cell: ({ row }: { row: { original: StudentData } }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={async () => {
                  // Check validation before opening modal - call preview endpoint
                  try {
                    const enrolmentId = row.original.enrolmentId?.toString();
                    if (!enrolmentId) {
                      toast.error("Enrolment ID is required to edit discount");
                      return;
                    }
                    
                    const previewResponse = await getEnrolmentDiscountPreview(location, enrolmentId);
                    
                    if (!previewResponse || !previewResponse.success) {
                      // Check if it's a validation error (400) or not found error (404)
                      const errorMessage = previewResponse?.message || "Unable to edit discount";
                      const errorCode = previewResponse?.errorCode;
                      
                      // Handle 400 Bad Request - discount can't be edited
                      if (errorCode === "BAD_REQUEST" || errorMessage.includes("can't edit discounts")) {
                        toast.error(errorMessage);
                        return;
                      }
                      
                      // Handle 404 Not Found - enrolment doesn't exist or doesn't belong to location
                      if (errorCode === "NOT_FOUND" || errorMessage.includes("not found") || errorMessage.includes("does not belong")) {
                        toast.error(errorMessage || "Enrolment not found or does not belong to this location");
                        return;
                      }
                      
                      // For other errors, show error but still allow opening modal (might be temporary issue)
                      console.warn("Discount preview error:", errorMessage);
                    }
                    
                    // Validation passed, open modal
                    setSelectedStudent(row.original);
                    setIsDiscountModalOpen(true);
                  } catch (error: unknown) {
                    const apiError = error as {
                      response?: {
                        data?: { message?: string; errorCode?: string };
                        status?: number;
                      };
                      message?: string;
                    };
                    
                    const errorMessage = apiError.response?.data?.message || apiError.message || "Unable to edit discount";
                    const errorCode = apiError.response?.data?.errorCode;
                    const statusCode = apiError.response?.status;
                    
                    // Handle 400 Bad Request
                    if (statusCode === 400 || errorCode === "BAD_REQUEST" || errorMessage.includes("can't edit discounts")) {
                      toast.error(errorMessage);
                      return;
                    }
                    
                    // Handle 404 Not Found
                    if (statusCode === 404 || errorCode === "NOT_FOUND" || errorMessage.includes("not found") || errorMessage.includes("does not belong")) {
                      toast.error(errorMessage || "Enrolment not found or does not belong to this location");
                      return;
                    }
                    
                    // For other errors (network issues, etc.), show warning but allow opening modal
                    console.warn("Error checking discount preview:", errorMessage);
                    toast.warning("Unable to verify discount preview. You can still try to edit the discount.");
                    setSelectedStudent(row.original);
                    setIsDiscountModalOpen(true);
                  }
              }}
            >
              Edit Discount
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                  setEmailModalStudent(row.original);
                  setIsEmailModalOpen(true);
              }}
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={async () => {
                if(isDev()) {
                  const enrolmentId = row.original.enrolmentId?.toString();
                  if (!enrolmentId) {
                    toast.error("Enrolment ID is required to print");
                    return;
                  }

                  try {
                    const printData = await getGroupEnrolmentPrintDetails(location, enrolmentId);
                    
                    if (!printData || !printData.success) {
                      const errorMessage = printData?.message || "Failed to fetch print details";
                      toast.error(errorMessage);
                      return;
                    }

                    const details = printData.data.body;

                    // Validate required data
                    if (!details) {
                      toast.error("Invalid print data received");
                      return;
                    }

                    // Create print window
                    const printWindow = window.open('', '_blank');
                    if (!printWindow) {
                      toast.error("Please allow popups to print");
                      return;
                    }

                    try {
                      // Generate print HTML using utility function (XSS protected)
                      const htmlContent = generateGroupEnrolmentPrintHtml(details);

                      printWindow.document.write(htmlContent);
                      printWindow.document.close();
                    } catch (htmlError) {
                      printWindow.close();
                      console.error("Error generating print HTML:", htmlError);
                      toast.error("Failed to generate print content. Please try again.");
                    }
                  } catch (error) {
                    console.error("Error printing enrolment:", error);
                    const errorMessage =
                      error instanceof Error ? error.message : "Failed to print enrolment details";
                    toast.error(errorMessage);
                  }
                } else {
                  toast.info("This feature is in development.");
                }
              }}
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        ),
        size: 200,
        enableSorting: false,
      },
    ],
    [baseColumns, location]
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Students</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setIsEnrolmentModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
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
            customLoadingState={
              <LoadingAnimation
                size="md"
                text="Loading students..."
                className="py-8"
              />
            }
            customEmptyState={
              !isLoading ? (
                error ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                    <div className="text-4xl">⚠️</div>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                ) : data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                    <div className="text-4xl">👥</div>
                    <span className="text-sm font-medium">No students found</span>
                  </div>
                ) : undefined
              ) : undefined
            }
          />

          {/* Server-side style pagination controls (driven by API pagination) */}
          {!error && totalRows > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (currentPage > 1 && !isLoading) {
                      dispatch(fetchGroupCourseStudents({ location, courseId, page: currentPage - 1 }));
                    }
                  }}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (currentPage < totalPages && !isLoading) {
                      dispatch(fetchGroupCourseStudents({ location, courseId, page: currentPage + 1 }));
                    }
                  }}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <GroupCourseStudentEnrolmentModal
        open={isEnrolmentModalOpen}
        onOpenChange={setIsEnrolmentModalOpen}
        location={location}
        courseId={courseId}
        onEnrolmentComplete={async () => {
          // Refresh student list after enrolment is complete
          await dispatch(fetchGroupCourseStudents({ location, courseId, page: currentPage })).unwrap();
        }}
      />

      <EditStudentDiscountModal
        open={isDiscountModalOpen}
        onOpenChange={setIsDiscountModalOpen}
        onSave={async (discountData: EditDiscountFormData): Promise<boolean> => {
          if (!selectedStudent?.enrolmentId) {
            toast.error("Enrolment ID is required to update discount");
            return false;
          }

          setSavingDiscount(true);
          try {
            // Convert discountType from "fixed"/"percentage" to API format (0 = percentage, 1 = dollar)
            const discountType = discountData.discountType === "percentage" ? 0 : 1;
            
            const response = await updateGroupEnrolmentDiscount(
              location,
              selectedStudent.enrolmentId.toString(),
              {
                discount: discountData.discountValue || "",
                discountType: discountType,
              }
            );

            if (response?.success) {
              toast.success("Discount updated successfully");
              
              // Refresh student list to show updated discount
              await dispatch(fetchGroupCourseStudents({ location, courseId, page: currentPage })).unwrap();
              
              setIsDiscountModalOpen(false);
              setSelectedStudent(null);
              return true;
            } else {
              const errorMessage = response?.message || "Failed to update discount";
              toast.error(errorMessage);
              return false;
            }
          } catch (error) {
            console.error("Error updating discount:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Failed to update discount. Please try again.";
            toast.error(errorMessage);
            return false;
          } finally {
            setSavingDiscount(false);
          }
        }}
        initialData={
          selectedStudent
            ? parseDiscountFromApi(selectedStudent.discount)
            : undefined
        }
        saving={savingDiscount}
        location={location}
        enrolmentId={selectedStudent?.enrolmentId?.toString() || ""}
      />

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
                onClick={() => {
                  if (emailModalStudent?.enrolmentId) {
                    setEmailStatementLoading(true);
                    setEmailStatementError(null);
                    getEnrolmentEmailStatement(location, emailModalStudent.enrolmentId.toString())
                      .then((result) => {
                        if (result && result.success) {
                          setEmailStatement(result.data.body);
                          setCustomerEmails(result.data.body.emails || []);
                          setEmailStatementError(null);
                        } else {
                          setEmailStatementError(result?.message || "Failed to fetch email statement");
                        }
                      })
                      .catch((error) => {
                        setEmailStatementError(
                          error instanceof Error ? error.message : "Failed to fetch email statement"
                        );
                      })
                      .finally(() => {
                        setEmailStatementLoading(false);
                      });
                  }
                }}
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
        open={isEmailModalOpen && !emailStatementLoading && (!emailModalStudent?.enrolmentId || (!!emailStatement && !emailStatementError))}
        onOpenChange={setIsEmailModalOpen}
        onSend={async (emailData: EmailFormData) => {
          const studentId = emailStatement?.enrolment?.studentId || emailModalStudent?.studentId;
          if (!studentId) {
            toast.error("Student ID is required to send email");
            return;
          }

          try {
            const response = await sendEmail(location, {
              objectId: 8, // EMAIL_OBJECT_CUSTOMER_STATEMENT
              userId: studentId,
              to: emailData.recipients,
              subject: emailData.subject,
              content: emailData.content,
            });

            if (response.status) {
              toast.success("Email sent successfully");
              setIsEmailModalOpen(false);
              setEmailModalStudent(null);
            } else {
              toast.success("Email sent successfully");
              setIsEmailModalOpen(false);
              setEmailModalStudent(null);
            }
          } catch (error) {
            console.error("Error sending email:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Failed to send email";
            toast.error(errorMessage);
          }
        }}
        recipientEmails={customerEmails}
        locationName={location}
        initialSubject={emailStatement?.emailTemplate?.subject || "Group Course Statement from Arcadia Academy of Music"}
        initialContent={emailStatement ? generateEmailContent(emailStatement) : ""}
        localStorageKey={`group-course-student-email-${courseId}-${emailModalStudent?.enrolmentId || emailModalStudent?.studentId || 'default'}`}
      />
    </>
  );
}

