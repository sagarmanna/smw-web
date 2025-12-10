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
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";
import { Pencil } from "lucide-react";
import { parse, isValid } from "date-fns";
import type { GroupEnrolmentOption } from "./AddGroupEnrolmentModal";
import type { DiscountDetailFormData } from "./DiscountDetailModal";
import { EditDiscountModal, type EditDiscountFormData } from "./EditDiscountModal";

export interface LessonDetail {
  id: string;
  dateTime: string;
  duration: string;
  price: number;
  discount: number;
  total: number;
}

interface LessonDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (lessons: LessonDetail[]) => void;
  groupEnrolment: GroupEnrolmentOption;
  discountData: DiscountDetailFormData;
}

const DAY_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function parseDateString(dateStr: string): Date | null {
  try {
    const parsed = parse(dateStr, "MMM dd, yyyy", new Date());
    if (isValid(parsed)) return parsed;
    const parsed2 = parse(dateStr, "MMM d, yyyy", new Date());
    if (isValid(parsed2)) return parsed2;
    const fallback = new Date(dateStr);
    return isValid(fallback) ? fallback : null;
  } catch {
    return null;
  }
}

function generateLessonDates(startDate: string, endDate: string, dayOfWeek: string): Date[] {
  const dates: Date[] = [];
  const start = parseDateString(startDate);
  const end = parseDateString(endDate);
  if (!start || !end) return dates;
  const targetDay = DAY_MAP[dayOfWeek];
  if (targetDay === undefined) return dates;
  const current = new Date(start);
  while (current.getDay() !== targetDay && current <= end) {
    current.setDate(current.getDate() + 1);
  }
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  return dates;
}

function formatDateTime(date: Date, time: string): string {
  return `${date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })} ${time}`;
}

function calculateDiscount(discountData: DiscountDetailFormData, pricePerLesson: number, numberOfLessons: number): number {
  if (discountData.discountType === "fixed") {
    return (parseFloat(discountData.discountValue) || 0) / numberOfLessons;
  }
  return (pricePerLesson * (parseFloat(discountData.discountValue) || 0)) / 100;
}

function calculateNewDiscount(discountFormData: EditDiscountFormData, lessonPrice: number): number {
  const value = parseFloat(discountFormData.discountValue) || 0;
  const discount = discountFormData.discountType === "fixed"
    ? Math.min(value, lessonPrice)
    : (lessonPrice * Math.min(value, 100)) / 100;
  return Math.max(0, discount);
}

export function LessonDetailModal({
  open,
  onOpenChange,
  onConfirm,
  groupEnrolment,
  discountData,
}: LessonDetailModalProps) {
  const [lessons, setLessons] = React.useState<LessonDetail[]>([]);
  const [isEditDiscountModalOpen, setIsEditDiscountModalOpen] = React.useState(false);
  const [editingLesson, setEditingLesson] = React.useState<LessonDetail | null>(null);

  React.useEffect(() => {
    if (!open || !groupEnrolment || !discountData) return;

    const lessonDates = generateLessonDates(
      groupEnrolment.startDate,
      groupEnrolment.endDate,
      groupEnrolment.day
    );

    const numberOfLessons = lessonDates.length;
    const pricePerLesson = groupEnrolment.rate / numberOfLessons;
    const discountPerLesson = calculateDiscount(discountData, pricePerLesson, numberOfLessons);

    setLessons(
      lessonDates.map((date, index) => ({
        id: `lesson-${index}`,
        dateTime: date.toISOString(),
        duration: groupEnrolment.duration,
        price: pricePerLesson,
        discount: discountPerLesson,
        total: pricePerLesson - discountPerLesson,
      }))
    );
  }, [open, groupEnrolment, discountData]);

  const handleEdit = React.useCallback((lesson: LessonDetail) => {
    setEditingLesson(lesson);
    setIsEditDiscountModalOpen(true);
  }, []);

  const handleSaveDiscount = React.useCallback(
    (discountFormData: EditDiscountFormData) => {
      if (!editingLesson) return;
      const newDiscount = calculateNewDiscount(discountFormData, editingLesson.price);
      setLessons((prev) =>
        prev.map((lesson) =>
          lesson.id === editingLesson.id
            ? { ...lesson, discount: newDiscount, total: lesson.price - newDiscount }
            : lesson
        )
      );
      setEditingLesson(null);
    },
    [editingLesson]
  );

  const totals = React.useMemo(
    () =>
      lessons.reduce(
        (acc, l) => ({
          totalPrice: acc.totalPrice + l.price,
          totalDiscount: acc.totalDiscount + l.discount,
          grandTotal: acc.grandTotal + l.total,
        }),
        { totalPrice: 0, totalDiscount: 0, grandTotal: 0 }
      ),
    [lessons]
  );

  const createCurrencyCell = React.useCallback(
    (accessorKey: keyof LessonDetail, isTotal = false) => {
      const CurrencyCell = ({ row }: { row: { original: LessonDetail; getValue: (key: keyof LessonDetail) => number } }) => {
        const isFooter = row.original.id === "footer";
        const value = isFooter ? (row.original as LessonDetail)[accessorKey] as number : row.getValue(accessorKey);
        return (
          <div className={`text-right ${isFooter ? "font-semibold" : isTotal ? "font-medium" : ""}`}>
            {formatCurrency(value)}
          </div>
        );
      };
      CurrencyCell.displayName = `CurrencyCell-${accessorKey}`;
      return CurrencyCell;
    },
    []
  );

  const columns: ColumnDef<LessonDetail>[] = React.useMemo(
    () => [
      {
        accessorKey: "dateTime",
        header: "Date/Time",
        cell: ({ row }) =>
          row.original.id === "footer" ? (
            <div className="font-semibold">{row.original.dateTime || "Total"}</div>
          ) : (
            formatDateTime(new Date(row.getValue("dateTime")), groupEnrolment.fromTime)
          ),
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ row }) => (row.original.id === "footer" ? null : row.getValue("duration")),
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: createCurrencyCell("price"),
      },
      {
        accessorKey: "discount",
        header: "Discount",
        cell: createCurrencyCell("discount"),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: createCurrencyCell("total", true),
      },
      {
        id: "actions",
        header: "Actions",
        size: 80,
        enableSorting: false,
        cell: ({ row }) =>
          row.original.id === "footer" ? null : (
            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => handleEdit(row.original)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          ),
      },
    ],
    [groupEnrolment.fromTime, createCurrencyCell, handleEdit]
  );

  const footerRow: LessonDetail = React.useMemo(
    () => ({
      id: "footer",
      dateTime: "Total",
      duration: "",
      price: totals.totalPrice,
      discount: totals.totalDiscount,
      total: totals.grandTotal,
    }),
    [totals]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Lesson Detail</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden py-4">
          <CustomTable
            data={lessons}
            columns={columns}
            footerRow={footerRow}
            enableSearch={false}
            enableExport={false}
            enableFilter={false}
            enablePrint={false}
            enableSorting={false}
            enableRowsPerPage={false}
            maxHeight="calc(90vh - 300px)"
          />
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onConfirm(lessons);
              onOpenChange(false);
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>

      {editingLesson && (
        <EditDiscountModal
          open={isEditDiscountModalOpen}
          onOpenChange={(open) => {
            setIsEditDiscountModalOpen(open);
            if (!open) setEditingLesson(null);
          }}
          onSave={handleSaveDiscount}
          initialData={{
            discountType: "fixed",
            discountValue: editingLesson.discount.toFixed(2),
          }}
        />
      )}
    </Dialog>
  );
}