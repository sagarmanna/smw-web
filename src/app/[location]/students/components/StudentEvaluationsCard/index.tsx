"use client";

import * as React from "react";
import { useAppDispatch } from "@/redux/hooks";
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
import { fetchEvaluationsPage, setEvaluationsPage } from "../../[id]/students-details.slice";
import { 
  createStudentEvaluation, 
  updateStudentEvaluation,
  deleteStudentEvaluation,
  type StudentEvaluationResponse 
} from "../../[id]/students-details.api";
import { toast } from "sonner";
import { format } from "date-fns";

interface StudentEvaluationsCardProps {
  evaluations: StudentEvaluation[];
  evaluationsPagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading?: boolean;
  studentName?: string;
  location: string;
  studentId: string;
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
  evaluationsPagination,
  isLoading = false,
  studentName,
  location,
  studentId,
  details,
}: StudentEvaluationsCardProps) {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingEvaluation, setEditingEvaluation] = React.useState<StudentEvaluation | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [fetchingPage, setFetchingPage] = React.useState(false);
  const { handlePrint } = usePrintReport<StudentEvaluation>();

  // Server-side pagination: use pagination from API
  const pagination = React.useMemo(() => {
    if (evaluationsPagination) {
      return evaluationsPagination;
    }
    // Fallback if pagination not provided
    return {
      page: 1,
      limit: 10,
      total: evaluations.length,
      totalPages: Math.ceil(evaluations.length / 10),
    };
  }, [evaluationsPagination, evaluations.length]);

  // Server-side pagination: evaluations are already paginated from API
  const displayedEvaluations = React.useMemo(() => {
    return evaluations;
  }, [evaluations]);

  // Handle page change - always fetch from API (server-side pagination)
  const handlePageChange = React.useCallback(async (page: number) => {
    setFetchingPage(true);
    try {
      const limit = pagination.limit || 10;
      await dispatch(fetchEvaluationsPage({ location, studentId, page, limit })).unwrap();
    } catch (error) {
      console.error("Failed to fetch evaluations page:", error);
      toast.error("Failed to load evaluations page");
    } finally {
      setFetchingPage(false);
    }
  }, [dispatch, location, studentId, pagination.limit]);

  const handleSave = React.useCallback(
    async (evaluation: StudentEvaluation & { programId?: number; teacherId?: number }): Promise<boolean> => {
      try {
        setSaving(true);
        
        // Validate required IDs
        if (!evaluation.programId || !evaluation.teacherId) {
          toast.error("Program and Teacher are required");
          return false;
        }

        // Prepare API request data
        const apiData = {
          date: evaluation.examDate,
          mark: parseFloat(evaluation.mark) || 0,
          level: evaluation.level,
          programId: evaluation.programId,
          type: evaluation.type,
          teacherId: evaluation.teacherId,
        };

        // Determine if this is an update or create
        const isUpdate = !!evaluation.id;
        
        if (isUpdate && !evaluation.id) {
          toast.error("Evaluation ID is required for update");
          return false;
        }
        
        // Call API first (following pattern: API call first, then update Redux)
        const result = isUpdate
          ? await updateStudentEvaluation(location, studentId, evaluation.id!, apiData)
          : await createStudentEvaluation(location, studentId, apiData);
        
        if (!result || !result.success) {
          throw new Error(result?.message || `Failed to ${isUpdate ? "update" : "create"} evaluation`);
        }

        // API response structure: { success: true, data: { id, programId, date, mark, level, program, type, teacher } }
        // POST/PUT APIs return the evaluation object directly in result.data
        const apiResponse = result.data as StudentEvaluationResponse;
        
        if (!apiResponse || !apiResponse.id) {
          throw new Error("Invalid response from server");
        }

        // Transform API response to StudentEvaluation format
        // API returns date in format "Dec 20, 2025" - convert to "YYYY-MM-DD" for storage
        let examDateString = evaluation.examDate; // Default to form date
        if (apiResponse.date) {
          try {
            const parsedDate = new Date(apiResponse.date);
            if (!isNaN(parsedDate.getTime())) {
              examDateString = format(parsedDate, "yyyy-MM-dd");
            }
          } catch {
            // If parsing fails, use the original date from form
            examDateString = evaluation.examDate;
          }
        }
        
        // POST API returns teacher as empty string "", PUT returns teacher name
        // Use form data teacher name if API returns empty
        const teacherName = apiResponse.teacher?.trim() || evaluation.teacher?.trim() || "";
        
        const transformedEvaluation: StudentEvaluation = {
          id: apiResponse.id,
          examDate: examDateString,
          mark: apiResponse.mark,
          level: apiResponse.level,
          program: apiResponse.program,
          type: apiResponse.type,
          teacher: teacherName,
        };

        // Update Redux state after successful API call (server-side pagination)
        const existingIndex = evaluations.findIndex((e) => e.id === evaluation.id);
        if (existingIndex >= 0 && evaluationsPagination) {
          // Update existing in current page
          const updatedEvaluations = [...evaluations];
          updatedEvaluations[existingIndex] = transformedEvaluation;
          // Update Redux with new page data
          dispatch(setEvaluationsPage({
            evaluations: updatedEvaluations,
            pagination: evaluationsPagination,
          }));
        } else if (evaluationsPagination) {
          // New evaluation: Refresh current page (evaluation might be on different page)
          setFetchingPage(true);
          try {
            await dispatch(fetchEvaluationsPage({ location, studentId, page: evaluationsPagination.page, limit: evaluationsPagination.limit })).unwrap();
          } finally {
            setFetchingPage(false);
          }
        }
        // Note: The useEffect above will sync currentPageEvaluations with Redux evaluations
        // when on page 1, so the new/updated evaluation will appear immediately
        
        // Show success message
        toast.success(isUpdate ? "Evaluation updated successfully" : "Evaluation created successfully");
        
        return true;
      } catch (error) {
        console.error("Failed to save evaluation:", error);
        toast.error(error instanceof Error ? error.message : "Failed to save evaluation. Please try again.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [dispatch, location, studentId, evaluations, evaluationsPagination, setFetchingPage]
  );

  const handleDelete = React.useCallback(
    async (evaluation: StudentEvaluation): Promise<boolean> => {
      try {
        setSaving(true);
        
        // Find the evaluation by ID
        const existingEvaluation = evaluations.find((e) => 
          e.id === evaluation.id ||
          (e.examDate === evaluation.examDate && 
           e.level === evaluation.level &&
           e.program === evaluation.program &&
           e.teacher === evaluation.teacher)
        );

        if (!existingEvaluation || !existingEvaluation.id) {
          toast.error("Evaluation not found");
          return false;
        }

        // Call DELETE API first (following pattern: API call first, then update Redux)
        const result = await deleteStudentEvaluation(location, studentId, existingEvaluation.id);
        
        if (!result || !result.success) {
          throw new Error(result?.message || "Failed to delete evaluation");
        }

        // Update Redux state after successful API call (server-side pagination)
        const updatedEvaluations = evaluations.filter((e) => e.id !== existingEvaluation.id);
        if (evaluationsPagination) {
          const updatedPagination = {
            ...evaluationsPagination,
            total: Math.max(0, evaluationsPagination.total - 1),
            totalPages: Math.ceil(Math.max(0, evaluationsPagination.total - 1) / evaluationsPagination.limit),
          };
          dispatch(setEvaluationsPage({
            evaluations: updatedEvaluations,
            pagination: updatedPagination,
          }));
        }
        
        toast.success("Evaluation deleted successfully");
        return true;
      } catch (error) {
        console.error("Failed to delete evaluation:", error);
        toast.error(error instanceof Error ? error.message : "Failed to delete evaluation. Please try again.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [dispatch, location, studentId, evaluations, evaluationsPagination]
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
        isLoading={isLoading || fetchingPage}
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
            <AddButton
              onClick={() => setIsModalOpen(true)}
              ariaLabel="Add evaluation"
            />
          </>
        }
      >
        {displayedEvaluations.length > 0 || isLoading ? (
          <CustomTable
            data={displayedEvaluations}
            columns={evaluationColumns}
            enableSearch={false}
            enableExport={false}
            enableFilter={false}
            enablePrint={false}
            enableSorting={false}
            enableRowsPerPage={false}
            serverSidePagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              totalPages: pagination.totalPages,
            }}
            onServerSidePageChange={handlePageChange}
            hideRecordCount={false}
            isLoading={isLoading || fetchingPage}
            onRowClick={handleRowClick}
            rowClassName="cursor-pointer"
          />
        ) : (
          <p className="text-sm text-muted-foreground">No evaluations found.</p>
        )}
      </SectionCard>

      <AddEvaluationModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        studentName={studentName}
        location={location}
        onSubmit={handleSave}
        onDelete={handleDelete}
        saving={saving}
        initialData={editingEvaluation}
        mode={editingEvaluation ? "edit" : "add"}
      />
    </>
  );
});

