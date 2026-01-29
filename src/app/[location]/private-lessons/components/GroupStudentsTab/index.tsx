"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { GroupLessonStudent } from "../../types";
import { GroupStudentDiscountModal } from "../modals/GroupStudentDiscountModal";
import { GroupStudentPaymentsModal } from "../modals/GroupStudentPaymentsModal";

interface GroupStudentsTabProps {
  students: GroupLessonStudent[];
  isLoading?: boolean;
  onSaveStudentDiscount: (studentId: number, discount: string) => Promise<boolean>;
  savingDiscount?: boolean;
}

export function GroupStudentsTab({
  students,
  isLoading = false,
  onSaveStudentDiscount,
  savingDiscount = false,
}: GroupStudentsTabProps) {
  const [discountModalOpen, setDiscountModalOpen] = React.useState(false);
  const [paymentsModalOpen, setPaymentsModalOpen] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<GroupLessonStudent | null>(null);

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
      const success = await onSaveStudentDiscount(selectedStudent.id, discount);
      if (success) handleDiscountClose();
      return success;
    },
    [selectedStudent, onSaveStudentDiscount, handleDiscountClose]
  );

  const handleViewPaymentClick = React.useCallback((student: GroupLessonStudent) => {
    setSelectedStudent(student);
    setPaymentsModalOpen(true);
  }, []);

  const handlePaymentsClose = React.useCallback(() => {
    setPaymentsModalOpen(false);
    setSelectedStudent(null);
  }, []);

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
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="default"
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white text-xs px-3 py-1"
              onClick={() => handleEditDiscountClick(row.original)}
            >
              Edit Discount
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white text-xs px-3 py-1"
            >
              Create Invoice
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white text-xs px-3 py-1"
              onClick={() => handleViewPaymentClick(row.original)}
            >
              View Payment
            </Button>
          </div>
        ),
      },
    ],
    [handleEditDiscountClick, handleViewPaymentClick]
  );

  return (
    <div>
      <CustomTable
        data={students}
        columns={columns}
        size="compact"
        variant="striped"
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
          studentName={selectedStudent.studentName}
        />
      )}
    </div>
  );
}
