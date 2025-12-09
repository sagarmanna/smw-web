"use client";

import * as React from "react";
import {
  SectionCard,
  AddButton,
} from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddEvaluationModal } from "../modals/AddEvaluationModal";
import { StudentEvaluation, StudentBasicDetails } from "../../types";
import { usePrintReport } from "@/hooks/usePrintReport";
import { ColumnDef } from "@tanstack/react-table";

interface StudentEvaluationsCardProps {
  evaluations: StudentEvaluation[];
  onSave?: (evaluation: StudentEvaluation) => Promise<boolean>;
  onDelete?: (evaluation: StudentEvaluation) => Promise<boolean>;
  isLoading?: boolean;
  studentName?: string;
  saving?: boolean;
  location: string;
  details: StudentBasicDetails | null;
}

const evaluationColumns: ColumnDef<StudentEvaluation>[] = [
  { 
    accessorKey: "examDate", 
    header: "Exam Date", 
    meta: { 
      printable: true, 
      printableName: "Exam Date",
      exportFormatter: (value: unknown) => {
        const dateStr = String(value || "");
        if (!dateStr) return "-";
        try {
          // Parse ISO date string (YYYY-MM-DD)
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }
          // If already formatted, return as is
          return dateStr;
        } catch {
          return dateStr;
        }
      }
    } 
  },
  { accessorKey: "mark", header: "Mark", meta: { printable: true, printableName: "Mark" } },
  { accessorKey: "level", header: "Level", meta: { printable: true, printableName: "Level" } },
  { accessorKey: "program", header: "Program", meta: { printable: true, printableName: "Program" } },
  { accessorKey: "type", header: "Type", meta: { printable: true, printableName: "Type" } },
  { accessorKey: "teacher", header: "Teacher", meta: { printable: true, printableName: "Teacher" } },
];

export const StudentEvaluationsCard = React.memo(function StudentEvaluationsCard({
  evaluations,
  onSave,
  onDelete,
  isLoading = false,
  studentName,
  saving = false,
  location,
  details,
}: StudentEvaluationsCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingEvaluation, setEditingEvaluation] = React.useState<StudentEvaluation | null>(null);
  const { handlePrint } = usePrintReport<StudentEvaluation>();

  const handleSave = React.useCallback(
    async (evaluation: StudentEvaluation): Promise<boolean> => {
      if (onSave) {
        return await onSave(evaluation);
      }
      return false;
    },
    [onSave]
  );

  const handlePrintClick = React.useCallback(() => {
    if (!details) return;
    
    handlePrint({
      reportTitle: `Evaluations - ${details.firstName} ${details.lastName}`,
      columns: evaluationColumns,
      data: evaluations,
      location,
    });
  }, [details, evaluations, location, handlePrint]);

  const handleRowClick = React.useCallback((evaluation: StudentEvaluation) => {
    setEditingEvaluation(evaluation);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = React.useCallback((open: boolean) => {
    if (!open) {
      setEditingEvaluation(null);
    }
    setIsModalOpen(open);
  }, []);

  return (
    <>
      <SectionCard
        title="Evaluations"
        isLoading={isLoading}
        headerActions={
          <>
            {details && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePrintClick}
                className="h-8 w-8 text-muted-foreground"
                aria-label="Print evaluations"
              >
                <Printer className="h-4 w-4" />
              </Button>
            )}
            {onSave && (
              <AddButton
                onClick={() => setIsModalOpen(true)}
                ariaLabel="Add evaluation"
              />
            )}
          </>
        }
      >
        {evaluations.length > 0 ? (
          <CustomTable
            data={evaluations}
            columns={evaluationColumns}
            enableSearch={false}
            enableExport={false}
            enableFilter={false}
            enablePrint={false}
            enableSorting={false}
            enableRowsPerPage={false}
            onRowClick={handleRowClick}
            rowClassName="cursor-pointer"
          />
        ) : (
          <p className="text-sm text-muted-foreground">No evaluations found.</p>
        )}
      </SectionCard>

      {onSave && (
        <AddEvaluationModal
          open={isModalOpen}
          onOpenChange={handleModalClose}
          studentName={studentName}
          onSubmit={handleSave}
          onDelete={onDelete}
          saving={saving}
          initialData={editingEvaluation}
          mode={editingEvaluation ? "edit" : "add"}
        />
      )}
    </>
  );
});

