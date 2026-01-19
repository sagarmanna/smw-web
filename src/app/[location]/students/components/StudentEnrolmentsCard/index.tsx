"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  type GroupEnrolmentCompleteData,
} from "./AddGroupModal/AddGroupEnrolmentModal";
import { StudentEnrolment } from "../../types";
import { toast } from "sonner";
import { useAppDispatch } from "@/redux/hooks";
import { fetchStudentEnrolments, setEnrolments } from "../../[id]/students-details.slice";
import {
  createStudentEnrolment,
  type CreateStudentEnrolmentRequest,
} from "../../[id]/students-details.api";

interface StudentEnrolmentsCardProps {
  enrolments: StudentEnrolment[];
  isLoading?: boolean;
  location: string;
  studentId: string;
  customerId?: number;
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
  customerId,
  onRefresh,
}: StudentEnrolmentsCardProps) {
  const router = useRouter();
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
  
  // Merge local enrolments with props enrolments, removing duplicates by ID
  const displayEnrolments = React.useMemo(() => {
    const enrolmentIds = new Set(enrolments.map(e => e.id));
    // Only include local enrolments that don't exist in props enrolments
    const uniqueLocalEnrolments = localEnrolments.filter(e => !enrolmentIds.has(e.id));
    return [...enrolments, ...uniqueLocalEnrolments];
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

  const handleNewEnrolmentNext = async (data: EnrolmentFormData) => {
    try {
      const payload: CreateStudentEnrolmentRequest = {
        programId: Number(data.program),
        programRate: Number(data.ratePerHour || 0),
        duration: data.duration,
        paymentFrequency: data.paymentFrequency,
        paymentFrequencyDiscount: data.paymentFrequencyDiscount
          ? Number(data.paymentFrequencyDiscount)
          : undefined,
        multipleEnrolDiscount: data.multipleEnrolDiscount
          ? Number(data.multipleEnrolDiscount)
          : undefined,
        discountedRatePerMonth: Number(data.discountedRatePerMonth || 0),
        lessonsCount: Number(data.numberOfLessons || 0),
        autoRenew: data.autoRenew,
        startDate: data.startDate || "",
        paymentCycleEffectiveDate: data.paymentCycleEffectiveDate || "",
        isOnline: data.isOnline ?? false,
        teacherId: data.teacherId ? Number(data.teacherId) : 0,
        day: data.day || "",
        startTime: data.startTime || "",
      };

      // Basic client-side validation to avoid bad requests
      if (
        !payload.programId ||
        !payload.lessonsCount ||
        !payload.startDate ||
        !payload.paymentCycleEffectiveDate ||
        !payload.teacherId ||
        !payload.day ||
        !payload.startTime
      ) {
        toast.error("Please complete all enrolment steps before saving.");
        return;
      }

      const result = await createStudentEnrolment(location, studentId, payload);

      if (!result || !result.success || !result.data) {
        toast.error(result?.message || "Failed to create enrolment");
        return;
      }

      const apiEnrolment = result.data;
      const newEnrolment: StudentEnrolment = {
        id: apiEnrolment.id,
        program: apiEnrolment.programName,
        teacher: apiEnrolment.teacherName,
        day: apiEnrolment.day,
        fromTime: apiEnrolment.fromTime,
        duration: apiEnrolment.duration,
        startDate: apiEnrolment.startDate,
        endDate: apiEnrolment.endDate,
      };

      // Add to local enrolments temporarily for immediate UI feedback
      setLocalEnrolments((prev) => [...prev, newEnrolment]);
      setIsNewEnrolmentModalOpen(false);
      toast.success("Enrolment created successfully");

      // Refresh enrolments from API - this will include the newly created enrolment
      // The duplicate filtering in displayEnrolments will prevent showing it twice
      if (onRefresh) {
        try {
          await onRefresh();
        } catch (error) {
          console.error("Failed to refresh enrolments:", error);
        }
      }
      
      // Clear the local enrolment after refresh completes
      // The enrolment from API will now be in the enrolments prop
      setLocalEnrolments((prev) => prev.filter(e => e.id !== newEnrolment.id));
    } catch (error) {
      console.error("Failed to create enrolment:", error);
      toast.error("Failed to create enrolment");
    }
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
      router.push(`/${location}/enrolments/${enrolment.id}`);
    },
    [location, router]
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
        studentId={Number(studentId)}
        onNext={handleNewEnrolmentNext}
        location={location}
        customerId={customerId}
      />

      <AddGroupEnrolmentModal
        open={isAddGroupEnrolmentModalOpen}
        onOpenChange={setIsAddGroupEnrolmentModalOpen}
        onNext={handleGroupEnrolmentNext}
        location={location}
        studentId={studentId}
      />
    </>
  );
});
