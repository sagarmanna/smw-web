export type DateRange = { from: Date; to: Date };

export interface InvoicedLessonRow {
  id: string;
  rowType?: "data" | "dateHeader" | "dateTotal" | "grandTotal";
  date: Date; // used for date-range filtering
  time: string;
  program: string;
  student: string;
  durationHrs: number;
  ratePerHour: number;
  cost: number;
}

