"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { GroupLessonStudent } from "../../types";
import { generatePrivateLessonInvoice } from "../../[id]/private-lesson-details.api";
import { GroupStudentDiscountModal } from "../modals/GroupStudentDiscountModal";
import { GroupStudentPaymentsModal } from "../modals/GroupStudentPaymentsModal";

interface GroupStudentsTabProps {
  location: string;
  students: GroupLessonStudent[];
  isLoading?: boolean;
  onSaveStudentDiscount: (studentId: number, discount: string) => Promise<boolean>;
  savingDiscount?: boolean;
}

export function GroupStudentsTab({
  location,
  students,
  isLoading = false,
  onSaveStudentDiscount,
  savingDiscount = false,
}: GroupStudentsTabProps) {
  const router = useRouter();
  const [discountModalOpen, setDiscountModalOpen] = React.useState(false);
  const [paymentsModalOpen, setPaymentsModalOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<GroupLessonStudent | null>(null);

  const isTruthyFlag = React.useCallback((value: unknown): boolean => {
    if (value === true || value === 1) return true;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return normalized === "true" || normalized === "1" || normalized === "yes";
    }
    return false;
  }, []);

  const handleEditDiscountClick = React.useCallback((student: GroupLessonStudent) => {
    setSelectedStudent(student);
    setDiscountModalOpen(true);
  }, []);

  const handleDiscountClose = React.useCallback(() => {
    setDiscountModalOpen(false);
    setSelectedStudent(null);
  }, []);

  const handleDiscountSubmit = React.useCallback(
    async (discount: string): Promise<boolean> => {
      if (!selectedStudent) return false;
      const targetStudentId = selectedStudent.studentId ?? selectedStudent.id;
      const success = await onSaveStudentDiscount(targetStudentId, discount);
      if (success) handleDiscountClose();
      return success;
    },
    [selectedStudent, onSaveStudentDiscount, handleDiscountClose]
  );

  const handleViewPaymentClick = React.useCallback((student: GroupLessonStudent) => {
    if (!student.lessonId || !student.enrolmentId) {
      toast.error("Lesson or enrolment ID is missing for payment details");
      return;
    }
    setSelectedStudent(student);
    setPaymentsModalOpen(true);
  }, []);

  const handlePaymentsClose = React.useCallback(() => {
    setPaymentsModalOpen(false);
    setSelectedStudent(null);
  }, []);

  const handleViewInvoiceClick = React.useCallback(
    (student: GroupLessonStudent) => {
      if (!student.invoiceId) return;
      router.push(`/${location}/invoices/${student.invoiceId}`);
    },
    [router, location]
  );

  const handleCreateInvoiceClick = React.useCallback(
    async (student: GroupLessonStudent) => {
      const lessonId = student.lessonId;
      if (!lessonId) {
        toast.error("Lesson ID is required to create invoice");
        return;
      }

      const response = await generatePrivateLessonInvoice(location, String(lessonId));
      if (!response?.success) {
        toast.error(response?.message || "Failed to create invoice");
        return;
      }

      const invoiceId = response.data?.invoiceId;
      if (invoiceId) {
        router.push(`/${location}/invoices/${invoiceId}`);
        return;
      }

      toast.success(response.message || "Invoice created successfully");
    },
    [location, router]
  );

  const columns = React.useMemo<ColumnDef<GroupLessonStudent>[]>(
    () => [
      {
        accessorKey: "studentName",
        header: () => <div className="text-left">Student Name</div>,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: "customerName",
        header: () => <div className="text-left">Customer Name</div>,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: "dueDate",
        header: () => <div className="text-left">Due Date</div>,
        cell: ({ getValue }) => (
          <div className="text-left">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: "grossPrice",
        header: () => <div className="text-right">Gross Price</div>,
        cell: ({ getValue }) => (
          <div className="text-right">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: "discount",
        header: () => <div className="text-right">Discount</div>,
        cell: ({ getValue }) => (
          <div className="text-right">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: "netPrice",
        header: () => <div className="text-right">Net Price</div>,
        cell: ({ getValue }) => (
          <div className="text-right">{getValue() as string}</div>
        ),
      },
      {
        accessorKey: "owing",
        header: () => <div className="text-right">Owing</div>,
        cell: ({ getValue }) => (
          <div className="text-right">{getValue() as string}</div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right" />,
        cell: ({ row }) => {
          const student = row.original;
          const hasInvoice = isTruthyFlag(student.hasInvoice) || Boolean(student.invoiceId);
          const hasPayment = isTruthyFlag(student.hasPayment);
          const canEditOrCreateInvoice = !hasInvoice;
          const actionButtons: React.ReactNode[] = [];

          if (canEditOrCreateInvoice) {
            actionButtons.push(
              <Button
                key="edit-discount"
                variant="default"
                size="sm"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-sm px-3 py-2"
                onClick={() => handleEditDiscountClick(student)}
              >
                Edit Discount
              </Button>
            );
            actionButtons.push(
              <Button
                key="create-invoice"
                variant="default"
                size="sm"
                className="w-full bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2"
                onClick={() => handleCreateInvoiceClick(student)}
              >
                Create Invoice
              </Button>
            );
          } else if (hasInvoice && student.invoiceId) {
            actionButtons.push(
              <Button
                key="view-invoice"
                variant="default"
                size="sm"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-sm px-3 py-2"
                onClick={() => handleViewInvoiceClick(student)}
              >
                View Invoice
              </Button>
            );
          }

          if (hasPayment) {
            actionButtons.push(
              <Button
                key="view-payment"
                variant="default"
                size="sm"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white text-sm px-3 py-2"
                onClick={() => handleViewPaymentClick(student)}
              >
                View Payment
              </Button>
            );
          }

          return (
            <div className="grid grid-cols-3 gap-2 justify-items-start w-[372px] ml-auto">
              <div className="w-[120px]">
                {actionButtons[0] ?? <div className="h-9" />}
              </div>

              <div className="w-[120px]">
                {actionButtons[1] ?? <div className="h-9" />}
              </div>

              <div className="w-[120px]">
                {actionButtons[2] ?? <div className="h-9" />}
              </div>
            </div>
          );
        },
      },
    ],
    [handleCreateInvoiceClick, handleEditDiscountClick, handleViewInvoiceClick, handleViewPaymentClick, isTruthyFlag]
  );

  return (
    <div>
      <CustomTable
        data={students}
        columns={columns}
        size="compact"
        variant="default"
        enableSorting={false}
        enableExport={false}
        enablePrint={false}
        enableSearch={false}
        enableFilter={false}
        className="border-0 w-full"
        isLoading={isLoading}
        customLoadingState={
          <div role="status" aria-label="Loading students data">
            <LoadingAnimation 
              size="md" 
              text="Loading students..." 
              className="py-8"
            />
          </div>
        }
        customEmptyState={
          !isLoading && students.length === 0 ? (
            <div 
              className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8"
              role="status"
              aria-label="No students found"
            >
              <div className="text-4xl" aria-hidden="true">👥</div>
              <span className="text-sm font-medium">No students found</span>
            </div>
          ) : undefined
        }
      />

      {selectedStudent && (
        <GroupStudentDiscountModal
          open={discountModalOpen}
          onClose={handleDiscountClose}
          discount={selectedStudent.discount || ""}
          onSubmit={handleDiscountSubmit}
          saving={savingDiscount}
        />
      )}

      {selectedStudent && (
        <GroupStudentPaymentsModal
          open={paymentsModalOpen}
          onClose={handlePaymentsClose}
          location={location}
          lessonId={selectedStudent.lessonId}
          enrolmentId={selectedStudent.enrolmentId}
          studentName={selectedStudent.studentName}
        />
      )}
    </div>
  );
}
