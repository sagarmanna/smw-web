// EvaluationModal.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EvaluationFormData) => void;
  studentName?: string;
}

export interface EvaluationFormData {
  examDate: string;
  mark: string;
  level: string;
  type: string;
  program: string;
  teacher: string;
}

export function EvaluationModal({
  open,
  onOpenChange,
  onSave,
  studentName,
}: EvaluationModalProps) {
  const [formData, setFormData] = React.useState<EvaluationFormData>({
    examDate: "",
    mark: "",
    level: "",
    type: "",
    program: "",
    teacher: "",
  });

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      examDate: "",
      mark: "",
      level: "",
      type: "",
      program: "",
      teacher: "",
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset form
    setFormData({
      examDate: "",
      mark: "",
      level: "",
      type: "",
      program: "",
      teacher: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Exam Result {studentName && `- ${studentName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Row 1: Exam Date and Mark */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="examDate">Exam Date</Label>
              <Input
                id="examDate"
                type="date"
                value={formData.examDate}
                onChange={(e) =>
                  setFormData({ ...formData, examDate: e.target.value })
                }
                placeholder="Select Date"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mark">Mark</Label>
              <Input
                id="mark"
                type="text"
                value={formData.mark}
                onChange={(e) =>
                  setFormData({ ...formData, mark: e.target.value })
                }
                placeholder="Enter mark"
                className="w-full"
              />
            </div>
          </div>

          {/* Row 2: Level and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                type="text"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                placeholder="Enter level"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                type="text"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                placeholder="Enter type"
                className="w-full"
              />
            </div>
          </div>

          {/* Row 3: Program and Teacher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select
                value={formData.program}
                onValueChange={(value) =>
                  setFormData({ ...formData, program: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piano-core">Piano Core</SelectItem>
                  <SelectItem value="piano-advanced">Piano Advanced</SelectItem>
                  <SelectItem value="music-theory">Music Theory</SelectItem>
                  <SelectItem value="violin">Violin</SelectItem>
                  <SelectItem value="guitar">Guitar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              <Select
                value={formData.teacher}
                onValueChange={(value) =>
                  setFormData({ ...formData, teacher: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="art-tatum">Art Tatum</SelectItem>
                  <SelectItem value="ella-fitzgerald">Ella Fitzgerald</SelectItem>
                  <SelectItem value="miles-davis">Miles Davis</SelectItem>
                  <SelectItem value="john-coltrane">John Coltrane</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-cyan-500 hover:bg-cyan-600">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}