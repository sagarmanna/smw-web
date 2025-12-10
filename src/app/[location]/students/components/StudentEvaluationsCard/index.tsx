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
import { addEvaluation, updateEvaluation, removeEvaluation } from "../../[id]/students-details.slice";
import { createStudentEvaluation, getStudentEvaluations, type StudentEvaluationResponse } from "../../[id]/students-details.api";
import { toast } from "sonner";

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
  const { handlePrint } = usePrintReport<StudentEvaluation>();

  // Server-side pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentPageEvaluations, setCurrentPageEvaluations] = React.useState<StudentEvaluation[]>(evaluations);
  const [pagination, setPagination] = React.useState(() => {
    // Initialize from Redux pagination if available, otherwise calculate from evaluations
    if (evaluationsPagination) {
      return evaluationsPagination;
    }
    return {
      page: 1,
      limit: 10,
      total: evaluations.length,
      totalPages: Math.ceil(evaluations.length / 10),
    };
  });
  const [loadingPage, setLoadingPage] = React.useState(false);

  // Initialize current page evaluations from Redux (initial load - page 1)
  // Use ref to track if we've initialized to avoid re-running on prop changes
  const initializedRef = React.useRef(false);
  React.useEffect(() => {
    if (!initializedRef.current && evaluations.length > 0 && currentPage === 1) {
      setCurrentPageEvaluations(evaluations);
      // Use pagination from Redux if available
      if (evaluationsPagination) {
        setPagination(evaluationsPagination);
      }
      initializedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount - use data from Redux (initial load)

  // Fetch evaluations when page changes (server-side pagination)
  const handlePageChange = React.useCallback(async (page: number) => {
    try {
      setLoadingPage(true);
      setCurrentPage(page);
      
      // Fetch the page data from API
      const result = await getStudentEvaluations(location, studentId, page, 10);
      
      if (result && result.success) {
        // Transform API response to StudentEvaluation format
        const transformedEvaluations = result.data.body.map((evaluation) => ({
          id: evaluation.id,
          examDate: evaluation.date,
          mark: evaluation.mark,
          level: evaluation.level,
          program: evaluation.program,
          type: evaluation.type,
          teacher: evaluation.teacher,
        }));
        
        // Update current page evaluations
        setCurrentPageEvaluations(transformedEvaluations);
        
        // Update pagination info from API response
        const apiPagination = result.pagination || result.data.pagination;
        if (apiPagination) {
          setPagination(apiPagination);
        } else {
          // Fallback: calculate from response
          setPagination({
            page,
            limit: 10,
            total: transformedEvaluations.length,
            totalPages: Math.ceil(transformedEvaluations.length / 10),
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch evaluations page:", error);
      toast.error("Failed to load evaluations page");
    } finally {
      setLoadingPage(false);
    }
  }, [location, studentId]);

  // Use current page evaluations for display
  const displayedEvaluations = currentPageEvaluations;

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

        // Call POST API first (following pattern: API call first, then update Redux)
        const result = await createStudentEvaluation(location, studentId, apiData);
        if (!result || !result.success) {
          throw new Error(result?.message || "Failed to save evaluation");
        }

        // Handle response structure - API returns { data: { id, programId, date, mark, level, program, type, teacher } }
        // Check if data is directly in result.data (actual API response structure)
        let apiResponse: StudentEvaluationResponse | undefined;
        
        if (result.data && 'id' in result.data) {
          apiResponse = result.data as unknown as StudentEvaluationResponse;
        } else if (result.data?.body && 'id' in result.data.body) {
          // Fallback: check for nested body structure (if API structure changes)
          apiResponse = result.data.body;
        }

        // Transform API response to StudentEvaluation format
        // IMPORTANT: API response always has empty teacher field (only has teacherId)
        // So we MUST always use the teacher name from form data
        const teacherNameFromForm = evaluation.teacher?.trim() || "";
        
        let transformedEvaluation: StudentEvaluation;
        
        if (apiResponse) {
          // Use API response data, but always use teacher name from form data
          transformedEvaluation = {
            id: apiResponse.id,
            examDate: apiResponse.date,
            mark: apiResponse.mark,
            level: apiResponse.level,
            program: apiResponse.program, // Use API response data only
            type: apiResponse.type,
            teacher: teacherNameFromForm, // Always use teacher name from form data (API doesn't return it)
          };
        } else {
          // Fallback: Use the data we sent (API might not return the created object)
          transformedEvaluation = {
            examDate: evaluation.examDate,
            mark: evaluation.mark,
            level: evaluation.level,
            program: evaluation.program,
            type: evaluation.type,
            teacher: teacherNameFromForm, // Use teacher name from form data
          };
        }
        
        // Final safety check: Ensure teacher name is always present
        if (!transformedEvaluation.teacher) {
          transformedEvaluation.teacher = teacherNameFromForm || "Unknown";
        }

        // Update Redux state after successful API call
        const existingIndex = evaluations.findIndex((e) => e.id === evaluation.id);
        if (existingIndex >= 0) {
          // Update existing
          dispatch(updateEvaluation({ index: existingIndex, evaluation: transformedEvaluation }));
          // Update current page if we're viewing the page with this evaluation
          if (currentPage === 1) {
            setCurrentPageEvaluations((prev) => {
              const pageIndex = prev.findIndex((e) => e.id === evaluation.id);
              if (pageIndex >= 0) {
                const updated = [...prev];
                updated[pageIndex] = transformedEvaluation;
                return updated;
              }
              return prev;
            });
          }
        } else {
          // Add new - always add for new evaluations
          dispatch(addEvaluation(transformedEvaluation));
          // If we're on page 1, add to current page view
          if (currentPage === 1) {
            setCurrentPageEvaluations((prev) => [transformedEvaluation, ...prev]);
            // Update pagination total
            setPagination((prev) => ({
              ...prev,
              total: prev.total + 1,
              totalPages: Math.ceil((prev.total + 1) / prev.limit),
            }));
          }
        }
        
        // Show success message
        toast.success(evaluation.id ? "Evaluation updated successfully" : "Evaluation created successfully");
        
        return true;
      } catch (error) {
        console.error("Failed to save evaluation:", error);
        toast.error(error instanceof Error ? error.message : "Failed to save evaluation. Please try again.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [dispatch, location, studentId, evaluations, currentPage]
  );

  const handleDelete = React.useCallback(
    async (evaluation: StudentEvaluation): Promise<boolean> => {
      try {
        setSaving(true);
        
        // Find the evaluation index
        const existingIndex = evaluations.findIndex((e) => 
          e.id === evaluation.id ||
          (e.examDate === evaluation.examDate && 
           e.level === evaluation.level &&
           e.program === evaluation.program &&
           e.teacher === evaluation.teacher)
        );

        if (existingIndex < 0) {
          toast.error("Evaluation not found");
          return false;
        }

        // No DELETE API available - just remove from Redux state
        // Following the pattern: mutations update Redux state directly
        dispatch(removeEvaluation(existingIndex));
        
        return true;
      } catch (error) {
        console.error("Failed to delete evaluation:", error);
        toast.error("Failed to delete evaluation. Please try again.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [dispatch, evaluations]
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
            <AddButton
              onClick={() => setIsModalOpen(true)}
              ariaLabel="Add evaluation"
            />
          </>
        }
      >
        {displayedEvaluations.length > 0 || loadingPage ? (
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
            isLoading={loadingPage}
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

