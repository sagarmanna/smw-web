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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EnrolmentDetails } from "../../types";

interface EditEnrolmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  details: EnrolmentDetails | null;
  onSubmit: (details: Partial<EnrolmentDetails>) => Promise<boolean>;
  saving?: boolean;
}

export function EditEnrolmentDetailsModal({
  open,
  onClose,
  details,
  onSubmit,
  saving = false,
}: EditEnrolmentDetailsModalProps) {
  const [formData, setFormData] = React.useState({
    rate: "",
    autoRenewal: false,
    online: false,
  });

  React.useEffect(() => {
    if (details) {
      // Extract numeric value from rate string (e.g., "$20.00" -> "20.00")
      const rateValue = details.rate?.replace(/[^0-9.]/g, "") || "";
      
      setFormData({
        rate: rateValue,
        autoRenewal: details.autoRenewal === "Enabled",
        online: details.online || false,
      });
    } else {
      setFormData({
        rate: "",
        autoRenewal: false,
        online: false,
      });
    }
  }, [details, open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!details) return;
    
    const success = await onSubmit({
      id: details.id,
      rate: formData.rate ? `$${parseFloat(formData.rate).toFixed(2)}` : details.rate,
      autoRenewal: formData.autoRenewal ? "Enabled" : "Disabled",
      online: formData.online,
    });
    
    if (success) {
      onClose();
    }
  };

  const rateLabel = details?.rateFromDate && details?.rateToDate
    ? `Rate From ${details.rateFromDate} To ${details.rateToDate}`
    : "Rate";

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="enrolment-rate" className="font-semibold">
              {rateLabel}
            </Label>
            <Input
              id="enrolment-rate"
              type="number"
              step="0.01"
              min="0"
              value={formData.rate}
              onChange={(e) => setFormData((prev) => ({ ...prev, rate: e.target.value }))}
              placeholder="Enter rate"
              className="focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="enrolment-auto-renew"
              checked={formData.autoRenewal}
              onCheckedChange={(checked) => 
                setFormData((prev) => ({ ...prev, autoRenewal: checked as boolean }))
              }
            />
            <Label 
              htmlFor="enrolment-auto-renew" 
              className="text-sm font-normal cursor-pointer"
            >
              Auto Renew
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="enrolment-online"
              checked={formData.online}
              onCheckedChange={(checked) => 
                setFormData((prev) => ({ ...prev, online: checked as boolean }))
              }
            />
            <Label 
              htmlFor="enrolment-online" 
              className="text-sm font-normal cursor-pointer"
            >
              Online
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

