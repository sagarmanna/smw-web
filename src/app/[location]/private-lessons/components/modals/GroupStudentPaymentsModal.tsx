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
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { PrivateLessonPayment } from "../../types";
import { getGroupLessonPayments } from "../../[id]/private-lesson-details.api";
import { toast } from "sonner";

interface GroupStudentPaymentsModalProps {
  open: boolean;
  onClose: () => void;
  location: string;
  lessonId?: number;
  enrolmentId?: number;
  studentName?: string;
}

export function GroupStudentPaymentsModal({
  open,
  onClose,
  location,
  lessonId,
  enrolmentId,
  studentName,
}: GroupStudentPaymentsModalProps) {
  const [payments, setPayments] = React.useState<PrivateLessonPayment[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const columns = React.useMemo<ColumnDef<PrivateLessonPayment>[]>(
    () => [
      { accessorKey: "date", header: "Date" },
      { accessorKey: "paymentMethod", header: "Payment Method" },
      { accessorKey: "number", header: "Number" },
      {
        accessorKey: "amount",
        header: "Amount",
        enableSorting: true,
        enableSortingRemoval: false,
      },
    ],
    []
  );

  const fetchPayments = React.useCallback(
    async (currentSorting: SortingState) => {
      if (!lessonId || !enrolmentId) {
        setPayments([]);
        return;
      }

      setIsLoading(true);
      try {
        const sort = currentSorting[0];
        const sortField = sort?.id ? String(sort.id) : undefined;
        const order = sort?.id ? (sort.desc ? "desc" : "asc") : undefined;

        const response = await getGroupLessonPayments(
          location,
          String(lessonId),
          String(enrolmentId),
          sortField,
          order
        );

        if (!response?.success) {
          toast.error(response?.message || "Failed to fetch payments");
          setPayments([]);
          return;
        }

        const rows = response.data?.body || [];
        setPayments(
          rows.map((item) => ({
            id: item.id,
            date: item.date || "",
            paymentMethod: item.paymentMethod || "",
            number: item.number || "",
            amount: item.amount || "",
          }))
        );
      } finally {
        setIsLoading(false);
      }
    },
    [enrolmentId, lessonId, location]
  );

  React.useEffect(() => {
    if (open) {
      fetchPayments(sorting);
    } else {
      setPayments([]);
    }
  }, [open, sorting, fetchPayments]);

  const handleSortingChange = React.useCallback((state: SortingState) => {
    setSorting(state);
  }, []);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>
            Payment Details{studentName ? ` - ${studentName}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 border rounded-md overflow-hidden">
          <div className="border-b px-4 py-2 font-semibold text-sm">
            Payments
          </div>
          <div className="px-4 py-2">
            <CustomTable
              data={payments}
              columns={columns}
              size="compact"
              variant="default"
              enableSearch={false}
              enableFilter={false}
              enableExport={false}
              enablePrint={false}
              enableSorting={true}
              manualSorting={true}
              sorting={sorting}
              onSortingChange={handleSortingChange}
              stickyHeader={true}
              maxHeight="320px"
              isLoading={isLoading}
              hideRecordCount={true}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

