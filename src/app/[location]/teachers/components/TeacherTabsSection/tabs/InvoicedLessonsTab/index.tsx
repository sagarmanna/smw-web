"use client";

import { useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer, Search } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { subDays } from "date-fns";
import { invoicedLessonColumns, InvoicedLessonData } from "../../../../teacherTabConfigs";

interface InvoicedLessonsTabProps {
  location: string;
  teacherId: number;
}

export function InvoicedLessonsTab({ location, teacherId }: InvoicedLessonsTabProps) {
  const data = useAppSelector((state) => state.teacherTabs.invoicedLessonData);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Invoiced Lessons</CardTitle>
        <div className="flex items-center gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={(range) => setDateRange(range)}
          />
          <Button variant="outline" size="sm" className="h-8">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Checkbox
            id="summarise-report"
            className="ml-2"
          />
          <label htmlFor="summarise-report" className="text-sm">
            Summarise Report
          </label>
        </div>
      </CardHeader>
      <CardContent>
        <CustomTable
          data={data as InvoicedLessonData[]}
          columns={invoicedLessonColumns}
        />
      </CardContent>
    </Card>
  );
}

