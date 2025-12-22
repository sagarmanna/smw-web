"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useAppDispatch } from "@/redux/hooks";
import { addReleaseNote } from "../../releaseNotesListing.slice";
import type { CreateReleaseNoteRequest } from "../../types";
import { format } from "date-fns";

interface AddReleaseNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
}

export function AddReleaseNoteModal({ isOpen, onClose, onSuccess, location }: AddReleaseNoteModalProps) {
  const dispatch = useAppDispatch();
  const [releaseVersion, setReleaseVersion] = useState("");
  const [subject, setSubject] = useState("");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setReleaseVersion("");
      setSubject("");
      setSummary("");
      setNotes("");
      setScheduleDate(undefined);
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!subject.trim()) {
      newErrors.subject = "Subject cannot be blank.";
    } else if (subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters";
    } else if (subject.trim().length > 255) {
      newErrors.subject = "Subject must not exceed 255 characters";
    }

    // Check if summary has actual content (not just empty HTML tags)
    const summaryText = summary.replace(/<[^>]*>/g, "").trim();
    if (!summaryText) {
      newErrors.summary = "Summary cannot be blank.";
    }

    // Check if notes has actual content (not just empty HTML tags)
    const notesText = notes.replace(/<[^>]*>/g, "").trim();
    if (!notesText) {
      newErrors.notes = "Notes cannot be blank.";
    }

    if (!scheduleDate) {
      newErrors.scheduleDate = "Schedule date is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (!scheduleDate) {
        throw new Error("Schedule date is required");
      }

      const payload: CreateReleaseNoteRequest = {
        subject: subject.trim(),
        summary: summary,
        notes: notes,
        scheduleDate: format(scheduleDate, "yyyy-MM-dd"),
      };

      // Call Redux action which will call API and update state
      await dispatch(addReleaseNote({ location, data: payload })).unwrap();

      toast.success("Release note created successfully!");
      onSuccess?.();
      onClose();

      // Reset form
      setReleaseVersion("");
      setSubject("");
      setSummary("");
      setNotes("");
      setScheduleDate(undefined);
    } catch (error: unknown) {
      const apiError = error as { message?: string; errorCode?: string };
      const errorMessage = apiError.message || "Failed to create release note";

      toast.error(errorMessage);

      if (apiError.errorCode === "BAD_REQUEST") {
        console.error("Validation error:", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSubject(value);
    // Clear error when user starts typing
    if (errors.subject) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.subject;
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Release Notes</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="releaseVersion">
                Release Version#
              </Label>
              <Input
                id="releaseVersion"
                value={releaseVersion}
                onChange={(e) => setReleaseVersion(e.target.value)}
                placeholder="Enter release version"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduleDate">
                Schedule date <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                value={scheduleDate}
                onSelect={setScheduleDate}
                placeholder="Select schedule date"
                error={!!errors.scheduleDate}
                errorMessage={errors.scheduleDate}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter subject"
              required
              className={errors.subject ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
          </div>

          <div className="space-y-2">
            <Label>
              Summary <span className="text-red-500">*</span>
            </Label>
            <RichTextEditor
              value={summary}
              onChange={setSummary}
              mode="simple"
              minHeight="200px"
              error={!!errors.summary}
              errorMessage={errors.summary}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Notes <span className="text-red-500">*</span>
            </Label>
            <RichTextEditor
              value={notes}
              onChange={setNotes}
              mode="full"
              minHeight="400px"
              error={!!errors.notes}
              errorMessage={errors.notes}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Publish"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
