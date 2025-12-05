"use client";

import * as React from "react";
import {
  SectionCard,
} from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { Printer, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Evaluation {
  examDate: string;
  mark: string;
  level: string;
  program: string;
  type: string;
  teacher: string;
}

interface StudentEvaluationsCardProps {
  evaluations: Evaluation[];
  onAdd?: () => void;
  onPrint?: () => void;
  isLoading?: boolean;
}

const evaluationColumns = [
  { accessorKey: "examDate", header: "Exam Date" },
  { accessorKey: "mark", header: "Mark" },
  { accessorKey: "level", header: "Level" },
  { accessorKey: "program", header: "Program" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "teacher", header: "Teacher" },
];

export const StudentEvaluationsCard = React.memo(function StudentEvaluationsCard({
  evaluations,
  onAdd,
  onPrint,
  isLoading = false,
}: StudentEvaluationsCardProps) {
  return (
    <SectionCard
      title="Evaluations"
      isLoading={isLoading}
    >
      {evaluations.length > 0 ? (
        <>
          <CustomTable
            data={evaluations}
            columns={evaluationColumns}
            enableSearch={false}
            enableExport={false}
            enableFilter={false}
            enablePrint={false}
            enableSorting={false}
            enableRowsPerPage={false}
          />
          <div className="flex justify-end gap-2 mt-4">
            {onPrint && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrint}
                className="h-8 w-8"
                aria-label="Print evaluations"
              >
                <Printer className="h-4 w-4" />
              </Button>
            )}
            {onAdd && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onAdd}
                className="h-8 w-8"
                aria-label="Add evaluation"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">No evaluations found.</p>
          <div className="flex justify-end gap-2 mt-4">
            {onPrint && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrint}
                className="h-8 w-8"
                aria-label="Print evaluations"
              >
                <Printer className="h-4 w-4" />
              </Button>
            )}
            {onAdd && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onAdd}
                className="h-8 w-8"
                aria-label="Add evaluation"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </>
      )}
    </SectionCard>
  );
});

