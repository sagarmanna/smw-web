"use client";

import * as React from "react";
import {
  SectionCard,
} from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewEnrolmentModal, type EnrolmentFormData } from "././AddPrivateModal/NewEnrolmentModal";
import { 
  AddGroupEnrolmentModal, 
  type GroupEnrolmentCompleteData 
} from "./AddGroupModal/AddGroupEnrolmentModal";
import { StudentEnrolment } from "../../types";
import { useAppDispatch } from "@/redux/hooks";
import { fetchStudentEnrolments, setEnrolments } from "../../[id]/students-details.slice";

interface StudentEnrolmentsCardProps {
  enrolments: StudentEnrolment[];
  isLoading?: boolean;
  location: string;
  studentId: string;
  onRefresh?: () => void;
}

const enrolmentColumns = [
  { accessorKey: "program", header: "Program" },
  { accessorKey: "teacher", header: "Teacher" },
  { accessorKey: "day", header: "Day" },
  { accessorKey: "fromTime", header: "From Time" },
  { accessorKey: "duration", header: "Duration" },
  { accessorKey: "startDate", header: "Start Date" },
  { accessorKey: "endDate", header: "End Date" },
];

export const StudentEnrolmentsCard = React.memo(function StudentEnrolmentsCard({
  enrolments,
  isLoading = false,
  location,
  studentId,
  onRefresh,
}: StudentEnrolmentsCardProps) {
  const dispatch = useAppDispatch();
  const [showAll, setShowAll] = React.useState(false);
  const [isNewEnrolmentModalOpen, setIsNewEnrolmentModalOpen] = React.useState(false);
  const [isAddGroupEnrolmentModalOpen, setIsAddGroupEnrolmentModalOpen] = React.useState(false);
  const [localEnrolments, setLocalEnrolments] = React.useState<StudentEnrolment[]>([]);
  const [isLoadingEnrolments, setIsLoadingEnrolments] = React.useState(false);
  const previousEnrolmentsRef = React.useRef<StudentEnrolment[]>([]);
  const hasInitializedRef = React.useRef(false);
  
  // Store initial enrolments as previous when component first receives data
  React.useEffect(() => {
    if (!hasInitializedRef.current && enrolments.length > 0 && !showAll) {
      previousEnrolmentsRef.current = [...enrolments];
      hasInitializedRef.current = true;
    }
  }, [enrolments, showAll]);
  
  // Merge local enrolments with props enrolments
  const displayEnrolments = React.useMemo(() => {
    return [...enrolments, ...localEnrolments];
  }, [enrolments, localEnrolments]);

  // Handle showAll checkbox change
  const handleShowAllChange = React.useCallback(async (checked: boolean) => {
    if (checked) {
      // Store current enrolments before fetching all
      if (enrolments.length > 0) {
        previousEnrolmentsRef.current = [...enrolments];
      }
      
      // Fetch all enrolments
      setIsLoadingEnrolments(true);
      try {
        setShowAll(true);
        await dispatch(fetchStudentEnrolments({ location, studentId, showAll: true })).unwrap();
      } catch (error) {
        console.error("Failed to fetch all enrolments:", error);
        // Revert checkbox state on error
        setShowAll(false);
      } finally {
        setIsLoadingEnrolments(false);
      }
    } else {
      // Restore previous enrolments
      if (previousEnrolmentsRef.current.length > 0) {
        setShowAll(false);
        dispatch(setEnrolments(previousEnrolmentsRef.current));
      } else {
        // If no previous enrolments, fetch default (showAll=false)
        setIsLoadingEnrolments(true);
        try {
          setShowAll(false);
          await dispatch(fetchStudentEnrolments({ location, studentId, showAll: false })).unwrap();
        } catch (error) {
          console.error("Failed to fetch default enrolments:", error);
        } finally {
          setIsLoadingEnrolments(false);
        }
      }
    }
  }, [dispatch, location, studentId, enrolments]);

  const handleNewEnrolmentNext = (data: EnrolmentFormData) => {
    // TODO: Implement API call to create enrolment
    setIsNewEnrolmentModalOpen(false);
  };

  const handleGroupEnrolmentNext = (data: GroupEnrolmentCompleteData) => {
    // Static implementation - API call ignored
    // Transform GroupEnrolmentOption to StudentEnrolment format
    const newEnrolment: StudentEnrolment = {
      id: Date.now(), // Temporary ID for local state
      program: data.groupEnrolment.course,
      teacher: data.groupEnrolment.teacher,
      day: data.groupEnrolment.day,
      fromTime: data.groupEnrolment.fromTime,
      duration: data.groupEnrolment.duration,
      startDate: data.groupEnrolment.startDate,
      endDate: data.groupEnrolment.endDate,
    };
    
    // Add to local state to display in table
    setLocalEnrolments((prev) => [...prev, newEnrolment]);
    
    // Close modal
    setIsAddGroupEnrolmentModalOpen(false);
    
    // TODO: Implement API call to create group enrolment when ready
    // The data structure is ready for API integration:
    // - data.groupEnrolment: Group enrolment details (course, teacher, day, rate, etc.)
    // - data.discountData: Discount type and value
    // - data.lessons: Array of lesson details with prices, discounts, and totals
    // After API call, call onRefresh() to reload from server
  };

  const handleRowClick = React.useCallback(
    (enrolment: StudentEnrolment) => {
      const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";
      const url = `${legacyBase}/${location}/enrolment/view?id=${enrolment.id}`;
      window.location.href = url;
    },
    [location]
  );

  return (
    <>
      <SectionCard
        title="Enrolments"
        isLoading={isLoading}
        headerActions={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-all-enrolments"
                checked={showAll}
                onCheckedChange={(checked) => handleShowAllChange(checked === true)}
                disabled={isLoadingEnrolments}
              />
              <Label
                htmlFor="show-all-enrolments"
                className="text-sm font-normal cursor-pointer"
              >
                Show All
              </Label>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Enrolment actions"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsNewEnrolmentModalOpen(true)}>
                  Add Private...
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAddGroupEnrolmentModalOpen(true)}>
                  Add Group...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      >
        <CustomTable
          data={displayEnrolments}
          columns={enrolmentColumns}
          enableSearch={false}
          enableExport={false}
          enableFilter={false}
          enablePrint={false}
          enableSorting={false}
          enableRowsPerPage={false}
          isLoading={isLoadingEnrolments}
          customLoadingState={<LoadingAnimation size="md" text="Loading enrolments..." />}
          onRowClick={handleRowClick}
          rowClassName="cursor-pointer"
        />
        {displayEnrolments.length === 0 && !isLoading && !isLoadingEnrolments && (
          <p className="text-sm text-muted-foreground mt-4">No enrolments found.</p>
        )}
      </SectionCard>

      <NewEnrolmentModal
        open={isNewEnrolmentModalOpen}
        onOpenChange={setIsNewEnrolmentModalOpen}
        onNext={handleNewEnrolmentNext}
        location={location}
      />

      <AddGroupEnrolmentModal
        open={isAddGroupEnrolmentModalOpen}
        onOpenChange={setIsAddGroupEnrolmentModalOpen}
        onNext={handleGroupEnrolmentNext}
        location={location}
      />
    </>
  );
});
