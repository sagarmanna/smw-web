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
import { Input } from "@/components/ui/input";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDisplayDate } from "@/utils/dateUtils";
import { Search } from "lucide-react";
import {
  DiscountDetailModal,
  type DiscountDetailFormData,
} from "./DiscountDetailModal";
import {
  LessonDetailModal,
  type LessonDetail,
} from "./LessonDetailModal";
import { fetchGroupCourses, type LessonPreviewDto } from "../../../[id]/students-details.api";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { toast } from "sonner";

export interface GroupEnrolmentOption {
  id: string;
  course: string;
  teacher: string;
  day: string;
  rate: number;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
}

export interface GroupEnrolmentCompleteData {
  groupEnrolment: GroupEnrolmentOption;
  discountData: DiscountDetailFormData;
  lessons: LessonDetail[];
}

interface AddGroupEnrolmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext: (data: GroupEnrolmentCompleteData) => void;
  location: string;
  studentId: string;
}

export function AddGroupEnrolmentModal({
  open,
  onOpenChange,
  onNext,
  location,
  studentId,
}: AddGroupEnrolmentModalProps) {
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [isDiscountModalOpen, setIsDiscountModalOpen] = React.useState(false);
  const [isLessonDetailModalOpen, setIsLessonDetailModalOpen] = React.useState(false);
  const [selectedGroupEnrolment, setSelectedGroupEnrolment] = React.useState<GroupEnrolmentOption | null>(null);
  const [discountData, setDiscountData] = React.useState<DiscountDetailFormData | null>(null);
  const [groupEnrolmentOptions, setGroupEnrolmentOptions] = React.useState<GroupEnrolmentOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [apiLessons, setApiLessons] = React.useState<LessonDetail[] | null>(null);
  const [enrolmentId, setEnrolmentId] = React.useState<number | undefined>(undefined);

  const loadGroupCourses = React.useCallback(async (courseName?: string) => {
    if (!studentId) return;

    setIsLoading(true);
    try {
      const response = await fetchGroupCourses(location, studentId, courseName);
      if (response?.success && response.data) {
        setGroupEnrolmentOptions(response.data);
      } else {
        toast.error(response?.message || "Failed to load group courses");
        setGroupEnrolmentOptions([]);
      }
    } catch (error) {
      console.error("Error loading group courses:", error);
      toast.error("Failed to load group courses");
      setGroupEnrolmentOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [location, studentId]);

  // Fetch group courses when modal opens
  React.useEffect(() => {
    if (open && studentId) {
      loadGroupCourses();
    }
  }, [open, studentId, loadGroupCourses]);

  // Debounced search - fetch courses when search query changes
  React.useEffect(() => {
    if (!open) return;

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      loadGroupCourses(searchQuery.trim() || undefined);
    }, 500); // 500ms debounce

    searchTimeoutRef.current = timeout;

    // Cleanup
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchQuery, open, loadGroupCourses]);

  // Filter data based on search query (client-side fallback, but API handles it)
  const filteredData = React.useMemo(() => {
    return groupEnrolmentOptions;
  }, [groupEnrolmentOptions]);

  // Reset selection when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setSelectedId("");
      setSearchQuery("");
      setIsDiscountModalOpen(false);
      setIsLessonDetailModalOpen(false);
      setSelectedGroupEnrolment(null);
      setDiscountData(null);
      setApiLessons(null);
      setEnrolmentId(undefined);
    } else {
      // Cleanup timeout when modal closes
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    }
  }, [open]);

  const handleNext = () => {
    const selected = groupEnrolmentOptions.find((opt) => opt.id === selectedId);
    if (selected) {
      // Open discount detail modal directly (no API call needed)
      setIsDiscountModalOpen(true);
    }
  };

  const handleDiscountPreview = (data: DiscountDetailFormData) => {
    const selected = groupEnrolmentOptions.find((opt) => opt.id === selectedId);
    if (selected) {
      setSelectedGroupEnrolment(selected);
      setDiscountData(data);
      // Close discount modal and open lesson detail modal
      setIsDiscountModalOpen(false);
      setIsLessonDetailModalOpen(true);
    }
  };

  const handleApiPreview = async (lessons: LessonPreviewDto[], enrolmentIdFromApi?: number) => {
    // Transform API lessons to LessonDetail format
    const transformedLessons: LessonDetail[] = lessons.map((lesson) => ({
      id: lesson.id.toString(),
      dateTime: lesson.dateTime,
      duration: lesson.duration,
      price: lesson.price,
      discount: lesson.discount,
      total: lesson.total,
    }));
    setApiLessons(transformedLessons);
    if (enrolmentIdFromApi) {
      setEnrolmentId(enrolmentIdFromApi);
    }
    // Close discount modal and open lesson detail modal
    setIsDiscountModalOpen(false);
    setIsLessonDetailModalOpen(true);
  };

  const handleLessonDetailConfirm = (lessons: LessonDetail[]) => {
    if (selectedGroupEnrolment && discountData) {
      // Pass complete enrolment data to parent
      const completeData: GroupEnrolmentCompleteData = {
        groupEnrolment: selectedGroupEnrolment,
        discountData: discountData,
        lessons: lessons,
      };
      onNext(completeData);
      // Close all modals
      setIsLessonDetailModalOpen(false);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleRowClick = React.useCallback((row: GroupEnrolmentOption) => {
    setSelectedId(row.id);
  }, []);

  const columns: ColumnDef<GroupEnrolmentOption>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <RadioGroupItem
              value={row.original.id}
              id={`radio-${row.original.id}`}
            />
          </div>
        ),
        size: 50,
        enableSorting: false,
      },
      {
        accessorKey: "course",
        header: "Course",
        cell: ({ row }) => <div className="font-medium">{row.getValue("course")}</div>,
      },
      {
        accessorKey: "teacher",
        header: "Teacher",
      },
      {
        accessorKey: "day",
        header: "Day",
      },
      {
        accessorKey: "rate",
        header: "Rate",
        cell: ({ row }) => (
          <div className="text-right">{formatCurrency(row.getValue("rate"))}</div>
        ),
      },
      {
        accessorKey: "fromTime",
        header: "From Time",
      },
      {
        accessorKey: "duration",
        header: "Duration",
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => formatDisplayDate(row.getValue("startDate")),
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => formatDisplayDate(row.getValue("endDate")),
      },
    ],
    [selectedId]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle>Add Group Enrolment</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4 py-4">
          {/* Search Input */}
          <div className="flex justify-end px-1">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <LoadingAnimation size="md" text="Loading group courses..." />
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No group courses available.</p>
              </div>
            ) : (
              <RadioGroup value={selectedId} onValueChange={setSelectedId}>
                <CustomTable
                  data={filteredData}
                  columns={columns}
                  enableSearch={false}
                  enableExport={false}
                  enableFilter={false}
                  enablePrint={false}
                  enableSorting={false}
                  enableRowsPerPage={false}
                  maxHeight="calc(90vh - 250px)"
                  onRowClick={handleRowClick}
                  rowClassName={(row: GroupEnrolmentOption) =>
                    selectedId === row.id ? "bg-primary/10" : ""
                  }
                />
              </RadioGroup>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selectedId}
          >
            Next
          </Button>
        </DialogFooter>
      </DialogContent>

      <DiscountDetailModal
        open={isDiscountModalOpen}
        onOpenChange={setIsDiscountModalOpen}
        onPreview={handleDiscountPreview}
        onApiPreview={handleApiPreview}
        location={location}
        studentId={studentId}
        courseId={selectedId}
        onClose={() => {
          // Keep discount modal open if we're going to lesson detail
          if (!isLessonDetailModalOpen) {
            setIsDiscountModalOpen(false);
          }
        }}
      />

      {selectedGroupEnrolment && discountData && (
        <LessonDetailModal
          open={isLessonDetailModalOpen}
          onOpenChange={setIsLessonDetailModalOpen}
          onConfirm={handleLessonDetailConfirm}
          groupEnrolment={selectedGroupEnrolment}
          discountData={discountData}
          apiLessons={apiLessons}
          location={location}
          enrolmentId={enrolmentId}
        />
      )}
    </Dialog>
  );
}

