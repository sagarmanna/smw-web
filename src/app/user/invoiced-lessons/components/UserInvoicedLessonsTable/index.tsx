"use client";

import * as React from "react";
import { startOfDay, endOfDay, isWithinInterval, format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

import { CustomTable } from "@/components/CustomTable";
import { formatCurrency } from "@/utils/formatCurrency";
import type { DateRange, InvoicedLessonRow } from "../types";

interface UserInvoicedLessonsTableProps {
  lessons: InvoicedLessonRow[];
  dateRange: DateRange;
}

const columns: ColumnDef<InvoicedLessonRow>[] = [
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => {
      const r = row.original;
      if (r.rowType === "dateHeader") {
        return <div className="font-medium text-foreground">{r.time}</div>;
      }
      return <div>{r.time}</div>;
    },
  },
  {
    accessorKey: "program",
    header: "Program",
    cell: ({ row }) =>
      row.original.rowType && row.original.rowType !== "data" ? null : row.original.program,
  },
  {
    accessorKey: "student",
    header: "Student",
    cell: ({ row }) =>
      row.original.rowType && row.original.rowType !== "data" ? null : row.original.student,
  },
  {
    accessorKey: "durationHrs",
    header: "Duration(hrs)",
    cell: ({ row }) =>
      row.original.rowType === "dateHeader" ? null : (
        <div
          className={`text-right ${
            row.original.rowType === "dateTotal" || row.original.rowType === "grandTotal"
              ? "font-semibold"
              : ""
          }`}
        >
          {row.original.durationHrs ? row.original.durationHrs.toString() : ""}
        </div>
      ),
  },
  {
    accessorKey: "ratePerHour",
    header: "Rate/hr",
    cell: ({ row }) =>
      row.original.rowType && row.original.rowType !== "data" ? null : (
        <div className="text-right">{formatCurrency(row.original.ratePerHour)}</div>
      ),
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => (
      <div
        className={`text-right ${
          row.original.rowType === "dateTotal" || row.original.rowType === "grandTotal"
            ? "font-semibold"
            : ""
        }`}
      >
        {formatCurrency(row.original.cost)}
      </div>
    ),
  },
];

export default function UserInvoicedLessonsTable({ lessons, dateRange }: UserInvoicedLessonsTableProps) {
  const filteredRows = React.useMemo(() => {
    const from = startOfDay(dateRange.from);
    const to = endOfDay(dateRange.to);
    return lessons.filter((r) => isWithinInterval(r.date, { start: from, end: to }));
  }, [lessons, dateRange]);

  const tableRows = React.useMemo<InvoicedLessonRow[]>(() => {
    // When there are no lessons, show a single grand total row with $0.00 (matches screenshot).
    if (filteredRows.length === 0) {
      return [
        {
          id: "__grand_total__",
          rowType: "grandTotal",
          date: new Date(),
          time: "",
          program: "",
          student: "",
          durationHrs: 0,
          ratePerHour: 0,
          cost: 0,
        },
      ];
    }

    const grouped = new Map<string, InvoicedLessonRow[]>();
    filteredRows.forEach((r) => {
      const key = format(r.date, "yyyy-MM-dd");
      const existing = grouped.get(key) ?? [];
      existing.push(r);
      grouped.set(key, existing);
    });

    const sortedKeys = Array.from(grouped.keys()).sort();

    const rows: InvoicedLessonRow[] = [];
    let grandDuration = 0;
    let grandCost = 0;

    sortedKeys.forEach((key) => {
      const dayLessons = grouped.get(key) ?? [];
      dayLessons.sort((a, b) => a.time.localeCompare(b.time));

      const dateObj = dayLessons[0]?.date ?? new Date();
      const dateLabel = format(dateObj, "EEEE, MMMM do, yyyy");

      rows.push({
        id: `date-header-${key}`,
        rowType: "dateHeader",
        date: dateObj,
        time: dateLabel,
        program: "",
        student: "",
        durationHrs: 0,
        ratePerHour: 0,
        cost: 0,
      });

      dayLessons.forEach((l) => rows.push(l));

      const dateDuration = dayLessons.reduce((sum, l) => sum + (l.durationHrs || 0), 0);
      const dateCost = dayLessons.reduce((sum, l) => sum + (l.cost || 0), 0);
      grandDuration += dateDuration;
      grandCost += dateCost;

      rows.push({
        id: `date-total-${key}`,
        rowType: "dateTotal",
        date: dateObj,
        time: "",
        program: "",
        student: "",
        durationHrs: Number(dateDuration.toFixed(2)),
        ratePerHour: 0,
        cost: Number(dateCost.toFixed(2)),
      });
    });

    rows.push({
      id: "__grand_total__",
      rowType: "grandTotal",
      date: new Date(),
      time: "",
      program: "",
      student: "",
      durationHrs: Number(grandDuration.toFixed(2)),
      ratePerHour: 0,
      cost: Number(grandCost.toFixed(2)),
    });

    return rows;
  }, [filteredRows]);

  return (
    <CustomTable
      data={tableRows}
      columns={columns}
      enableSorting={false}
      enablePrint={false}
      enableExport={false}
      enableSearch={false}
      enableFilter={false}
      enableDateRangePicker={false}
      // Hide the built-in toolbar row so the page matches the screenshot layout
      className="[&>div:first-child]:hidden"
      rowClassName={(row) => {
        if (row.rowType === "dateHeader") return "bg-muted/40";
        if (row.rowType === "dateTotal") return "bg-muted/10";
        if (row.rowType === "grandTotal") return "bg-amber-50";
        return "";
      }}
    />
  );
}

