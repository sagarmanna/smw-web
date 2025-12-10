"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { StudentEvaluation } from "../../types";
import { Combobox } from "@/components/ui/combobox";
import { toast } from "sonner";
import { getProgramsList, Program } from "../../../teachers/teachers.api";
import { getTeachersList, Teacher } from "../../../schedule/schedule.api";

// API functions
const fetchPrograms = async (): Promise<Program[]> => {
  try {
    return await getProgramsList();
  } catch (error) {
    console.error("Error fetching programs:", error);
    return [];
  }
};

const fetchTeachers = async (location: string): Promise<Teacher[]> => {
  try {
    const response = await getTeachersList(location);
    if (response?.success && response.data) {
      return response.data.map((t) => ({ id: t.id, name: t.name }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
};

interface EvaluationWithIds extends StudentEvaluation {
  programId?: number;
  teacherId?: number;
}

interface AddEvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string;
  location: string;
  onSubmit: (evaluation: EvaluationWithIds) => Promise<boolean>;
  onDelete?: (evaluation: StudentEvaluation) => Promise<boolean>;
  saving?: boolean;
  initialData?: StudentEvaluation | null;
  mode?: "add" | "edit";
}

export function AddEvaluationModal({
  open,
  onOpenChange,
  studentName,
  location,
  onSubmit,
  onDelete,
  saving = false,
  initialData = null,
  mode = "add",
}: AddEvaluationModalProps) {
  const isEditMode = mode === "edit" && initialData !== null;
  const [examDate, setExamDate] = React.useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<Omit<StudentEvaluation, "examDate">>({
    mark: "",
    level: "",
    program: "",
    type: "",
    teacher: "",
  });

  // Dropdown states
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [selectedProgramId, setSelectedProgramId] = React.useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>("");
  const [loadingPrograms, setLoadingPrograms] = React.useState(false);
  const [loadingTeachers, setLoadingTeachers] = React.useState(false);
  
  // Validation states
  const [errors, setErrors] = React.useState<{
    level?: string;
    teacher?: string;
  }>({});
  const [touched, setTouched] = React.useState<{
    level: boolean;
    teacher: boolean;
  }>({
    level: false,
    teacher: false,
  });
  const [showError, setShowError] = React.useState(false);

  // Fetch programs when modal opens
  React.useEffect(() => {
    if (open) {
      setLoadingPrograms(true);
      fetchPrograms()
        .then((programList) => {
          setPrograms(programList);
        })
        .catch((error) => {
          console.error("Error fetching programs:", error);
        })
        .finally(() => {
          setLoadingPrograms(false);
        });
    } else {
      // Clear programs when modal closes
      setPrograms([]);
    }
  }, [open]);

  // Fetch teachers when modal opens
  React.useEffect(() => {
    if (open && location) {
      setLoadingTeachers(true);
      fetchTeachers(location)
        .then((teacherList) => {
          setTeachers(teacherList);
        })
        .catch((error) => {
          console.error("Error fetching teachers:", error);
          setTeachers([]);
        })
        .finally(() => {
          setLoadingTeachers(false);
        });
    } else {
      // Clear teachers when modal closes
        setTeachers([]);
    }
  }, [open, location]);

  // Initialize form data when modal opens
  React.useEffect(() => {
    if (open) {
      // Always reset selections first when modal opens
      setSelectedProgramId("");
      setSelectedTeacherId("");
      setTeachers([]);
      setIsDatePickerOpen(false);
      setErrors({});
      setTouched({ level: false, teacher: false });
      setShowError(false);
      
      if (isEditMode && initialData) {
        // Populate form with existing data for edit mode
        const dateStr = initialData.examDate;
        let dateObj: Date | undefined = undefined;
        if (dateStr) {
          try {
            // Parse ISO date string (YYYY-MM-DD)
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              const [year, month, day] = dateStr.split('-').map(Number);
              dateObj = new Date(year, month - 1, day);
            } else {
              dateObj = new Date(dateStr);
            }
            if (isNaN(dateObj.getTime())) {
              dateObj = undefined;
            }
          } catch {
            dateObj = undefined;
          }
        }
        
        setExamDate(dateObj);
        setFormData({
          mark: initialData.mark || "",
          level: initialData.level || "",
          program: initialData.program || "",
          type: initialData.type || "",
          teacher: initialData.teacher || "",
        });
      } else {
        // Reset form for add mode
        setExamDate(undefined);
        setFormData({
          mark: "",
          level: "",
          program: "",
          type: "",
          teacher: "",
        });
      }
    }
  }, [open, isEditMode, initialData]);

  // Set program selection when programs are loaded and we're in edit mode
  React.useEffect(() => {
    if (open && isEditMode && initialData && programs.length > 0 && !selectedProgramId && initialData.program) {
      // Try exact match first
      let program = programs.find((p) => p.name === initialData.program);
      
      // If not found, try case-insensitive match
      if (!program) {
        program = programs.find((p) => p.name.toLowerCase() === initialData.program?.toLowerCase());
      }
      
      // If still not found, try partial match (contains)
      if (!program && initialData.program) {
        program = programs.find((p) => p.name.toLowerCase().includes(initialData.program.toLowerCase()) || initialData.program.toLowerCase().includes(p.name.toLowerCase()));
      }
      
      if (program) {
        setSelectedProgramId(program.id.toString());
      }
    }
  }, [open, isEditMode, initialData, programs, selectedProgramId]);
  
  // Set teacher selection when teachers are loaded and we're in edit mode
  React.useEffect(() => {
    if (open && isEditMode && initialData && teachers.length > 0 && selectedProgramId && initialData.teacher && !selectedTeacherId) {
      // Try exact match first
      let teacher = teachers.find((t) => t.name === initialData.teacher);
      
      // If not found, try case-insensitive match
      if (!teacher) {
        teacher = teachers.find((t) => t.name.toLowerCase() === initialData.teacher?.toLowerCase());
      }
      
      // If still not found, try partial match (contains)
      if (!teacher && initialData.teacher) {
        teacher = teachers.find((t) => t.name.toLowerCase().includes(initialData.teacher.toLowerCase()) || initialData.teacher.toLowerCase().includes(t.name.toLowerCase()));
      }
      
      if (teacher) {
        setSelectedTeacherId(teacher.id.toString());
      }
    }
  }, [open, isEditMode, initialData, teachers, selectedProgramId, selectedTeacherId]);

  const validateForm = (): boolean => {
    const newErrors: { level?: string; teacher?: string } = {};

    if (!formData.level.trim()) {
      newErrors.level = "Level cannot be blank.";
    }

    if (!formData.teacher.trim()) {
      newErrors.teacher = "Teacher cannot be blank.";
    }

    setErrors(newErrors);
    setShowError(Object.keys(newErrors).length > 0);
    // Mark fields as touched when validation fails
    if (Object.keys(newErrors).length > 0) {
      setTouched((prev) => ({
        ...prev,
        level: newErrors.level ? true : prev.level,
        teacher: newErrors.teacher ? true : prev.teacher,
      }));
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Convert Date to ISO string format (YYYY-MM-DD)
    const examDateString = examDate
      ? format(examDate, "yyyy-MM-dd")
      : "";

    if (!examDateString) {
      return;
    }

    const evaluation: EvaluationWithIds = {
      ...formData,
      examDate: examDateString,
      id: initialData?.id, // Include ID if editing
      programId: selectedProgramId ? parseInt(selectedProgramId, 10) : undefined,
      teacherId: selectedTeacherId ? parseInt(selectedTeacherId, 10) : undefined,
    };

    const success = await onSubmit(evaluation);
    if (success) {
      toast.success(isEditMode ? "Evaluation updated successfully" : "Evaluation saved successfully");
      onOpenChange(false);
      setExamDate(undefined);
      setIsDatePickerOpen(false);
      setFormData({
        mark: "",
        level: "",
        program: "",
        type: "",
        teacher: "",
      });
      setErrors({});
      setTouched({ level: false, teacher: false });
      setShowError(false);
    }
  };
  
  const handleDelete = async () => {
    if (!isEditMode || !initialData || !onDelete) return;
    
    if (window.confirm("Are you sure you want to delete this evaluation?")) {
      const success = await onDelete(initialData);
      if (success) {
        toast.success("Evaluation deleted successfully");
        onOpenChange(false);
      }
    }
  };

  const handleInputChange = (field: keyof Omit<StudentEvaluation, "examDate" | "program" | "teacher">) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (field === "level" && errors.level) {
      setErrors((prev) => ({ ...prev, level: undefined }));
    }
  };

  const handleProgramChange = (programId: string) => {
    setSelectedProgramId(programId);
    const selectedProgram = programs.find((p) => p.id.toString() === programId);
    setFormData((prev) => ({ ...prev, program: selectedProgram?.name || "" }));
    // Clear teacher selection when program changes
    setSelectedTeacherId("");
    setFormData((prev) => ({ ...prev, teacher: "" }));
  };

  const handleTeacherChange = (teacherId: string) => {
    setSelectedTeacherId(teacherId);
    const selectedTeacher = teachers.find((t) => t.id.toString() === teacherId);
    setFormData((prev) => ({ ...prev, teacher: selectedTeacher?.name || "" }));
    // Clear error when teacher is selected
    if (errors.teacher) {
      setErrors((prev) => ({ ...prev, teacher: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && !saving && onOpenChange(false)}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Evaluation" : "Add Evaluation"}</DialogTitle>
          {studentName && (
            <DialogDescription>
              {isEditMode ? "Edit evaluation for" : "Add a new evaluation for"} {studentName}
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examDate">Exam Date</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !examDate && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    <CalIcon className="mr-2 h-4 w-4" />
                    {examDate ? format(examDate, "MMM dd, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={examDate}
                    onSelect={(date) => {
                      setExamDate(date);
                      setIsDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mark">Mark</Label>
              <Input
                id="mark"
                type="text"
                placeholder="Enter mark"
                value={formData.mark}
                onChange={handleInputChange("mark")}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                type="text"
                placeholder="Enter level"
                value={formData.level}
                onChange={handleInputChange("level")}
                onBlur={() => setTouched((prev) => ({ ...prev, level: true }))}
                className={errors.level ? "border-red-500" : ""}
              />
              {(touched.level || showError) && errors.level && (
                <p className="text-sm text-red-600">{errors.level}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Combobox
                options={programs.map((program) => ({
                  value: program.id.toString(),
                  label: program.name,
                }))}
                value={selectedProgramId}
                onValueChange={handleProgramChange}
                placeholder={loadingPrograms ? "Loading programs..." : "Select Program"}
                searchPlaceholder="Search programs..."
                emptyText="No programs found."
                className="w-full"
                disabled={loadingPrograms || saving}
                popoverContentProps={{ className: "w-[var(--radix-popover-trigger-width)]" }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                type="text"
                placeholder="Enter type"
                value={formData.type}
                onChange={handleInputChange("type")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              <div className={errors.teacher ? "border-red-500 rounded-md border p-[1px]" : ""}>
                <Combobox
                  options={teachers.map((teacher) => ({
                    value: teacher.id.toString(),
                    label: teacher.name,
                  }))}
                  value={selectedTeacherId}
                  onValueChange={(value) => {
                    handleTeacherChange(value);
                    if (value) {
                      setTouched((prev) => ({ ...prev, teacher: true }));
                    }
                  }}
                  placeholder={
                    loadingTeachers
                      ? "Loading teachers..."
                      : "Select..."
                  }
                  searchPlaceholder="Search teachers..."
                  emptyText="No teachers found."
                  className={cn(
                    "w-full",
                    errors.teacher && "[&>button]:border-red-500"
                  )}
                  disabled={loadingTeachers || saving}
                  popoverContentProps={{ className: "w-[var(--radix-popover-trigger-width)]" }}
                />
              </div>
              {(touched.teacher || showError) && errors.teacher && (
                <p className="text-sm text-red-600">{errors.teacher}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <div className="flex justify-between w-full">
              {isEditMode && onDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Delete
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !examDate}>
                  {saving ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Save" : "Save Evaluation")}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

