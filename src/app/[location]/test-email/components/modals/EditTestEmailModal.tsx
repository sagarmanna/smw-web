"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { patchTestEmail } from "../../testEmailListing.slice";

interface EditTestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  rowId: number | null;
}

const isValidEmail = (value: string): boolean => {
  // Reasonable (not perfect) email validation for UI
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export function EditTestEmailModal({ isOpen, onClose, location, rowId }: EditTestEmailModalProps) {
  const dispatch = useAppDispatch();
  const rows = useAppSelector((state) => state.testEmailListing.rows);

  const row = React.useMemo(() => {
    if (!rowId) return null;
    return rows.find((r) => r.id === rowId) || null;
  }, [rowId, rows]);

  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && row) {
      setEmail(row.email || "");
      setErrors({});
    }
  }, [isOpen, row]);

  React.useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setErrors({});
      setIsSaving(false);
    }
  }, [isOpen]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const trimmed = email.trim();
    if (!trimmed) next.email = "Email cannot be blank.";
    else if (!isValidEmail(trimmed)) next.email = "Please enter a valid email.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!row || !row.id) {
      toast.error("Test email record not found. Please refresh.");
      return;
    }
    if (!validate()) return;

    setIsSaving(true);
    try {
      await dispatch(
        patchTestEmail({
          location,
          id: row.id,
          data: { email: email.trim() },
        })
      ).unwrap();

      toast.success("Test email updated successfully!");
      onClose();
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : "Failed to update test email";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Test Email</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail" className={errors.email ? "text-red-500" : ""}>
              Email
            </Label>
            <Input
              id="testEmail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.email;
                    return next;
                  });
                }
              }}
              disabled={isSaving}
              className={errors.email ? "border-red-500" : ""}
              placeholder="Enter email"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

