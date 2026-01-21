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
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { StudentData } from "../../../../[id]/groupCourseTabConfigs";
import { fetchGroupCourseStudents } from "../../../../[id]/groupCourseTabs.slice";
import { GroupCourseStudentEnrolmentModal } from "../../../modals/GroupCourseStudentEnrolmentModal";
import { EditStudentDiscountModal, parseDiscountFromApi, type EditDiscountFormData } from "../../../modals/EditStudentDiscountModal";
import { EmailModal, type EmailFormData } from "@/components/EmailModal";
import { sendEmail } from "@/lib/api/legacyApiAdapter";
import { getCustomerEmailAddresses } from "@/lib/api/customer.api";
import { toast } from "sonner";

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
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalStudent, setEmailModalStudent] = useState<StudentData | null>(null);
  const [customerEmails, setCustomerEmails] = useState<string[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRows = pagination?.total || data.length;
  const rowsPerPage = pagination?.limit || data.length || 10;

  // Fetch customer emails when email modal opens
  useEffect(() => {
    const fetchCustomerEmails = async () => {
      if (isEmailModalOpen && emailModalStudent?.customerId) {
        setIsLoadingEmails(true);
        try {
          const emails = await getCustomerEmailAddresses(
            location,
            emailModalStudent.customerId
          );
          setCustomerEmails(emails);
        } catch (error) {
          console.error("Error fetching customer emails:", error);
          setCustomerEmails([]);
        } finally {
          setIsLoadingEmails(false);
        }
      } else if (!isEmailModalOpen) {
        // Reset emails when modal closes
        setCustomerEmails([]);
      }
    };

    fetchCustomerEmails();
  }, [isEmailModalOpen, emailModalStudent?.customerId, location]);

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
              onClick={() => {
                setSelectedStudent(row.original);
                setIsDiscountModalOpen(true);
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
    ],
    [baseColumns]
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
            onClick={() => setIsEnrolmentModalOpen(true)}
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
      />

      <EditStudentDiscountModal
        open={isDiscountModalOpen}
        onOpenChange={setIsDiscountModalOpen}
        onSave={(discountData: EditDiscountFormData) => {
          // TODO: Implement API call when backend is ready
          console.log("Discount update data:", {
            studentId: selectedStudent?.studentId,
            courseId,
            location,
            discount: discountData.discountValue,
            discountType: discountData.discountType,
          });
          
          toast.info("Discount update functionality will be available when API is ready");
          setIsDiscountModalOpen(false);
          setSelectedStudent(null);
        }}
        initialData={
          selectedStudent
            ? parseDiscountFromApi(selectedStudent.discount)
            : undefined
        }
        saving={false}
      />

      <EmailModal
        open={isEmailModalOpen}
        onOpenChange={setIsEmailModalOpen}
        onSend={async (emailData: EmailFormData) => {
          if (!emailModalStudent?.studentId) {
            toast.error("Student ID is required to send email");
            return;
          }

          try {
            // Send email using legacy API
            // EmailObject::OBJECT_CUSTOMER_STATEMENT = 8
            const response = await sendEmail(location, {
              objectId: 8, // Customer Statement
              userId: emailModalStudent.studentId,
              to: emailData.recipients,
              subject: emailData.subject,
              content: emailData.content,
            });

            if (response.status) {
              toast.success("Email sent successfully");
              setIsEmailModalOpen(false);
              setEmailModalStudent(null);
            } else {
              const errorMessage = response.message || "Failed to send email";
              toast.error(errorMessage);
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
        initialSubject="Group Course Statement from Arcadia Academy of Music"
        localStorageKey={`group-course-student-email-${courseId}-${emailModalStudent?.studentId || 'default'}`}
      />
    </>
  );
}

