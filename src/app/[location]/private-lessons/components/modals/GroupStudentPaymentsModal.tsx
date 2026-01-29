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

interface GroupStudentPaymentsModalProps {
  open: boolean;
  onClose: () => void;
  studentName?: string;
}

const MOCK_PAYMENTS: PrivateLessonPayment[] = [
  {
    id: 1,
    date: "Dec 18, 2025",
    paymentMethod: "Cash",
    number: "",
    amount: "$28.75",
  },
  {
    id: 2,
    date: "Jan 28, 2026",
    paymentMethod: "Credit Used",
    number: "I-99974",
    amount: "-$28.75",
  },
];

export function GroupStudentPaymentsModal({
  open,
  onClose,
  studentName,
}: GroupStudentPaymentsModalProps) {
  const [payments, setPayments] = React.useState<PrivateLessonPayment[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "amount", desc: false },
  ]);
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
      },
    ],
    []
  );

  const fetchPayments = React.useCallback(
    async (currentSorting: SortingState) => {
      setIsLoading(true);
      // Simulate server-side fetch
      await new Promise((resolve) => setTimeout(resolve, 300));

      const data = [...MOCK_PAYMENTS];
      const sort = currentSorting[0];
      if (sort && sort.id === "amount") {
        data.sort((a, b) => {
          const parseAmount = (v: string) =>
            parseFloat(v.replace("$", "").replace(",", ""));
          const aVal = parseAmount(a.amount);
          const bVal = parseAmount(b.amount);
          return aVal - bVal;
        });
        if (sort.desc) {
          data.reverse();
        }
      }

      setPayments(data);
      setIsLoading(false);
    },
    []
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

