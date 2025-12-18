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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProgramsList, Program } from "../../../teachers/teachers.api";
import { getTeacherView, Teacher } from "../../../schedule/schedule.api";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";

// API functions
const fetchPrograms = async (): Promise<Program[]> => {
  try {
    return await getProgramsList();
  } catch (error) {
    console.error("Error fetching programs:", error);
    return [];
  }
};

const fetchTeachersByProgram = async (location: string, programId: string): Promise<Teacher[]> => {
  try {
    // Use today's date for the API call
    const today = new Date();
    const dateString = format(today, "yyyy-MM-dd");
    
    // Pass 'all-teachers-by-program' type to get all teachers associated with the program
    // Without this type, the API only returns teachers with lessons on the specific date
    const response = await getTeacherView(location, dateString, false, programId, undefined, 'all-teachers-by-program');
    if (response?.success && response.data?.resources) {
      // Map TeacherViewResource (id, title) to Teacher (id, name)
      return response.data.resources.map((t) => ({ id: t.id, name: t.title }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching teachers by program:", error);
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
  const [programsLoaded, setProgramsLoaded] = React.useState(false);
  const [userSelectedProgram, setUserSelectedProgram] = React.useState(false);
  
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
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const resetLocalState = React.useCallback(() => {
    setSelectedProgramId("");
    setSelectedTeacherId("");
    setTeachers([]);
    setPrograms([]);
    setProgramsLoaded(false);
    setUserSelectedProgram(false);
    setIsDatePickerOpen(false);
    setErrors({});
    setTouched({ level: false, teacher: false });
    setShowError(false);
    setShowDeleteConfirm(false);
    setIsDeleting(false);
  }, []);

  // Fetch programs only when user opens the Program dropdown
  const handleProgramDropdownOpen = React.useCallback((isOpen: boolean) => {
    if (isOpen && !programsLoaded && !loadingPrograms) {
      setLoadingPrograms(true);
      fetchPrograms()
        .then((programList) => {
          setPrograms(programList);
          setProgramsLoaded(true);
          // If we had a synthetic program selected, try to match it with a real one
          if (isEditMode && initialData?.program && selectedProgramId === "-1") {
            const matchedProgram = programList.find(
              (p) => p.name === initialData.program || 
                     p.name.toLowerCase() === initialData.program?.toLowerCase()
            );
            if (matchedProgram) {
              setSelectedProgramId(matchedProgram.id.toString());
            }
          }
        })
        .catch((error) => {
           console.error("Error fetching programs:", error);
        })
        .finally(() => {
          setLoadingPrograms(false);
        });
    }
  }, [programsLoaded, loadingPrograms, isEditMode, initialData, selectedProgramId]);

  // Fetch teachers only when user selects a program (after user interaction)
  React.useEffect(() => {
    if (open && location && selectedProgramId && userSelectedProgram && selectedProgramId !== "-1") {
      setLoadingTeachers(true);
      setTeachers([]); // Clear previous teachers
      
      // Clear teacher selection when program changes (only if it's a real program change)
      setSelectedTeacherId("");
      setFormData((prev) => ({ ...prev, teacher: "" }));
      
      fetchTeachersByProgram(location, selectedProgramId)
        .then((teacherList) => {
          setTeachers(teacherList);
        })
        .catch((error) => {
          console.error("Error fetching teachers by program:", error);
          setTeachers([]);
        })
        .finally(() => {
          setLoadingTeachers(false);
        });
    } else if (!selectedProgramId || selectedProgramId === "") {
      // Clear teachers when no program is selected (but preserve if we have synthetic data)
      if (!(isEditMode && initialData?.teacher && selectedProgramId === "-1")) {
        setTeachers([]);
        setSelectedTeacherId("");
        if (!(isEditMode && initialData?.teacher)) {
          setFormData((prev) => ({ ...prev, teacher: "" }));
        }
      }
    }
  }, [open, location, selectedProgramId, userSelectedProgram, isEditMode, initialData]);

  // Initialize form data when modal opens
  // useLayoutEffect prevents a brief flash of stale program/teacher options from a previous open.
  React.useLayoutEffect(() => {
    if (open) {
      resetLocalState();
      
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
        
        // Pre-populate with synthetic options from initialData (no API calls)
        if (initialData.program) {
          // Create a synthetic program option for display
          setPrograms([{ id: -1, name: initialData.program }]);
          setSelectedProgramId("-1");
        }
        if (initialData.teacher) {
          // Create a synthetic teacher option for display
          setTeachers([{ id: -1, name: initialData.teacher }]);
          setSelectedTeacherId("-1");
        }
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
  }, [open, isEditMode, initialData, resetLocalState]);

  // Set program selection when programs are loaded and user has selected a program
  React.useEffect(() => {
    if (open && isEditMode && initialData && programs.length > 0 && programsLoaded && !selectedProgramId && initialData.program) {
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
      
      if (program && program.id !== -1) {
        // Only set if it's a real program (not synthetic)
        setSelectedProgramId(program.id.toString());
      }
    }
  }, [open, isEditMode, initialData, programs, programsLoaded, selectedProgramId]);
  
  // Set teacher selection when teachers are loaded and user has selected a program
  React.useEffect(() => {
    if (open && isEditMode && initialData && teachers.length > 0 && selectedProgramId && initialData.teacher && !selectedTeacherId && userSelectedProgram) {
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
      
      if (teacher && teacher.id !== -1) {
        // Only set if it's a real teacher (not synthetic)
        setSelectedTeacherId(teacher.id.toString());
        // Ensure formData.teacher is set to the matched teacher name
        setFormData((prev) => ({ ...prev, teacher: teacher!.name }));
      } else if (initialData.teacher) {
        // If teacher not found in dropdown but exists in initialData, preserve it in formData
        // This ensures validation passes even if teacher matching fails
        setFormData((prev) => {
          if (!prev.teacher) {
            return { ...prev, teacher: initialData.teacher || "" };
          }
          return prev;
        });
      }
    }
  }, [open, isEditMode, initialData, teachers, selectedProgramId, selectedTeacherId, userSelectedProgram]);

  const validateForm = (): boolean => {
    const newErrors: { level?: string; teacher?: string } = {};

    // Ensure formData has values from initialData if in edit mode and values are missing
    let needsUpdate = false;
    const validatedFormData = { ...formData };
    if (isEditMode && initialData) {
      if (!validatedFormData.level?.trim() && initialData.level) {
        validatedFormData.level = initialData.level;
        needsUpdate = true;
      }
      if (!validatedFormData.teacher?.trim() && initialData.teacher) {
        validatedFormData.teacher = initialData.teacher;
        needsUpdate = true;
      }
      if (!validatedFormData.program?.trim() && initialData.program) {
        validatedFormData.program = initialData.program;
        needsUpdate = true;
      }
      // Update formData if we had to restore values
      if (needsUpdate) {
        setFormData(validatedFormData);
      }
    }

    if (!validatedFormData.level.trim()) {
      newErrors.level = "Level cannot be blank.";
    }

    if (!validatedFormData.teacher.trim()) {
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

    // Get program and teacher IDs
    let programIdNum: number | undefined = undefined;
    let teacherIdNum: number | undefined = undefined;
    
    const programIdParsed = selectedProgramId ? parseInt(selectedProgramId, 10) : undefined;
    const teacherIdParsed = selectedTeacherId ? parseInt(selectedTeacherId, 10) : undefined;
    
    // If we have synthetic IDs (-1), try to find real IDs by matching names
    if (programIdParsed === -1 || !programIdParsed) {
      // Try to find program ID by matching name
      if (formData.program) {
        const matchedProgram = programs.find(
          (p) => p.id !== -1 && (
            p.name === formData.program || 
            p.name.toLowerCase() === formData.program.toLowerCase()
          )
        );
        if (matchedProgram) {
          programIdNum = matchedProgram.id;
        }
      }
    } else {
      programIdNum = programIdParsed;
    }
    
    if (teacherIdParsed === -1 || !teacherIdParsed) {
      // Try to find teacher ID by matching name
      if (formData.teacher) {
        const matchedTeacher = teachers.find(
          (t) => t.id !== -1 && (
            t.name === formData.teacher || 
            t.name.toLowerCase() === formData.teacher.toLowerCase()
          )
        );
        if (matchedTeacher) {
          teacherIdNum = matchedTeacher.id;
        }
      }
    } else {
      teacherIdNum = teacherIdParsed;
    }
    
    // If we still don't have IDs and we're in edit mode, try loading them
    if (isEditMode && initialData && (!programIdNum || !teacherIdNum)) {
      // If program ID is missing, try to load programs and find it
      if (!programIdNum && formData.program && !programsLoaded) {
        try {
          const programList = await fetchPrograms();
          const matchedProgram = programList.find(
            (p) => p.name === formData.program || 
                   p.name.toLowerCase() === formData.program.toLowerCase()
          );
          if (matchedProgram) {
            programIdNum = matchedProgram.id;
          }
        } catch (error) {
          console.error("Error fetching programs for ID lookup:", error);
        }
      }
      
      // If teacher ID is missing and we have a program, try to load teachers and find it
      if (!teacherIdNum && formData.teacher && programIdNum && programIdNum !== -1) {
        try {
          const teacherList = await fetchTeachersByProgram(location, programIdNum.toString());
          const matchedTeacher = teacherList.find(
            (t) => t.name === formData.teacher || 
                   t.name.toLowerCase() === formData.teacher.toLowerCase()
          );
          if (matchedTeacher) {
            teacherIdNum = matchedTeacher.id;
          }
        } catch (error) {
          console.error("Error fetching teachers for ID lookup:", error);
        }
      }
    }
    
    const evaluation: EvaluationWithIds = {
      ...formData,
      examDate: examDateString,
      id: initialData?.id, // Include ID if editing
      programId: programIdNum,
      teacherId: teacherIdNum,
    };

    const success = await onSubmit(evaluation);
    if (success) {
      // Toast notification is handled in the parent component (StudentEvaluationsCard)
      onOpenChange(false);
      // Important: clear dropdown state on programmatic close (Save) to avoid carrying over teacher lists
      // into the next open (e.g. opening Edit right after creating).
      resetLocalState();
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

  // Ensure we reset local dropdown state on *any* close (including programmatic close after Save),
  // not only when the user clicks outside / presses ESC.
  React.useEffect(() => {
    if (!open) {
      resetLocalState();
    }
  }, [open, resetLocalState]);
  
  const handleDeleteClick = React.useCallback(() => {
    if (!isEditMode || !initialData || !onDelete) return;
    setShowDeleteConfirm(true);
  }, [isEditMode, initialData, onDelete]);

  const handleDeleteConfirm = React.useCallback(async () => {
    if (!isEditMode || !initialData || !onDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await onDelete(initialData);
      if (success) {
        // Toast notification is handled in the parent component (StudentEvaluationsCard)
        setShowDeleteConfirm(false);
        onOpenChange(false);
      }
      // Error toast is also handled in the parent component
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      // Error toast is handled in the parent component
    } finally {
      setIsDeleting(false);
    }
  }, [isEditMode, initialData, onDelete, onOpenChange]);

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
    const programName = selectedProgram?.name || "";
    setFormData((prev) => ({ ...prev, program: programName }));
    // Mark that user has selected a program to trigger teacher API call
    setUserSelectedProgram(true);
    // Clear teacher selection when program changes (only if it's a real program, not synthetic)
    if (programId !== "-1") {
      setSelectedTeacherId("");
      setFormData((prev) => ({ ...prev, teacher: "" }));
      setTeachers([]); // Clear teachers immediately
    }
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

  const handleDialogOpenChange = React.useCallback((value: boolean) => {
    if (!value) {
      // Clear local state immediately on close so reopening doesn't momentarily show old options.
      resetLocalState();
    }
    if (!value && !saving) {
      onOpenChange(false);
    }
  }, [onOpenChange, resetLocalState, saving]);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
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
                    defaultMonth={examDate}
                    onSelect={(date) => {
                      if (date) {
                        setExamDate(date);
                        setIsDatePickerOpen(false);
                      }
                    }}
                    captionLayout="dropdown"
                    fromYear={2005}
                    toYear={2125}
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
              <Select
                value={selectedProgramId || undefined}
                onValueChange={handleProgramChange}
                onOpenChange={handleProgramDropdownOpen}
                disabled={loadingPrograms || saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue 
                    placeholder={
                      isEditMode && initialData?.program && !programsLoaded
                        ? initialData.program
                        : loadingPrograms
                        ? "Loading programs..."
                        : "Select Program"
                    } 
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {programs.length > 0 ? (
                    programs.map((program) => (
                      <SelectItem key={program.id} value={program.id.toString()}>
                        {program.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty" disabled>
                      {loadingPrograms ? "Loading programs..." : "No programs found."}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
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
              <Select
                value={selectedTeacherId || undefined}
                onValueChange={(value) => {
                  handleTeacherChange(value);
                  if (value) {
                    setTouched((prev) => ({ ...prev, teacher: true }));
                  }
                }}
                disabled={!selectedProgramId || loadingTeachers || saving}
              >
                <SelectTrigger 
                  className={cn(
                    "w-full",
                    errors.teacher && "border-red-500 focus:ring-red-500"
                  )}
                >
                  <SelectValue 
                    placeholder={
                      isEditMode && initialData?.teacher && !userSelectedProgram
                        ? initialData.teacher
                        : !selectedProgramId
                        ? "Select a program first"
                        : loadingTeachers
                        ? "Loading teachers..."
                        : "Select Teacher"
                    } 
                  />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {teachers.length > 0 ? (
                    teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.name}
                      </SelectItem>
                    ))
                  ) : isEditMode && initialData?.teacher ? (
                    // In edit mode we may intentionally avoid fetching the full teacher list.
                    // If we have a teacher name, render it as a single selectable option instead of "No teachers found".
                    <SelectItem value="-1">{initialData.teacher}</SelectItem>
                  ) : (
                    <SelectItem value="__empty" disabled>
                      {loadingTeachers ? "Loading teachers..." : "No teachers found."}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
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
                  onClick={handleDeleteClick}
                  disabled={saving || isDeleting}
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

      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Evaluation"
        description="Are you sure you want to delete this evaluation? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </Dialog>
  );
}

