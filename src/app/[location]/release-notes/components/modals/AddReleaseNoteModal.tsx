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

  /**
   * Validates version number format
   * Only accepts semantic versioning format: major.minor.patch (e.g., 2.1.1, 1.0.0, 10.20.30)
   * Rejects: single numbers (1), two segments (1.0), more than three segments (1.2.3.4), leading zeros (2.0.023)
   */
  const isValidVersionFormat = (version: string): boolean => {
    const trimmed = version.trim();
    // Pattern: exactly three segments separated by dots, each segment is a non-zero-padded number
    // Examples: 1.0.0, 2.1.1, 10.20.30
    // Rejects: 1, 1.0, 1.0.0.1, 01.0.0, 2.0.023 (leading zeros)
    const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
    return versionPattern.test(trimmed);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate release version (required and format)
    if (!releaseVersion.trim()) {
      newErrors.releaseVersion = "Release version is required.";
    } else if (!isValidVersionFormat(releaseVersion)) {
      newErrors.releaseVersion = "Invalid version number format.";
    }

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

    // Notes is optional - no validation needed

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

      // Validate version is provided (required field)
      if (!releaseVersion.trim()) {
        setErrors({ releaseVersion: "Release version is required." });
        setIsLoading(false);
        return;
      }

      // Ensure version is always a string (required by API)
      const versionValue = releaseVersion.trim();
      
      const payload: CreateReleaseNoteRequest = {
        subject: subject.trim(),
        summary: summary,
        scheduleDate: format(scheduleDate, "yyyy-MM-dd"),
        version: versionValue, // Required field - validated above
      };

      // Only include notes if it has content (notes is optional)
      if (notes && notes.trim()) {
        payload.notes = notes;
      }

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

  const handleVersionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setReleaseVersion(value);
    
    // Real-time validation feedback
    if (value.trim()) {
      if (!isValidVersionFormat(value)) {
        setErrors((prev) => ({
          ...prev,
          releaseVersion: "Invalid version number format.",
        }));
      } else {
        // Clear error if format is valid
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.releaseVersion;
          return newErrors;
        });
      }
    } else {
      // Clear error if field is empty (will be caught by required validation on submit)
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.releaseVersion;
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
                Release Version# <span className="text-red-500">*</span>
              </Label>
              <Input
                id="releaseVersion"
                type="text"
                value={releaseVersion || ""}
                onChange={handleVersionChange}
                placeholder="Enter release version"
                className={errors.releaseVersion ? "border-red-500" : ""}
                disabled={isLoading}
                required
              />
              {errors.releaseVersion && (
                <p className="text-sm text-red-500">{errors.releaseVersion}</p>
              )}
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
              Notes
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
