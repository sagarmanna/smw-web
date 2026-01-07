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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EditMessageModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (message: string) => void;
  currentMessage?: string;
}

export function EditMessageModal({
  open,
  onClose,
  onSave,
  currentMessage = "",
}: EditMessageModalProps) {
  const [message, setMessage] = React.useState<string>("");

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setMessage(currentMessage || "");
    }
  }, [open, currentMessage]);

  const handleCancel = () => {
    setMessage(currentMessage || "");
    onClose();
  };

  const handleSave = () => {
    if (!onSave) {
      handleCancel();
      return;
    }

    onSave(message);
    handleCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle id="message-modal-title">Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4" role="region" aria-labelledby="message-modal-title">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message..."
              className="min-h-[200px] resize-y"
              aria-describedby="message-description"
            />
            <p id="message-description" className="sr-only">
              Enter or edit the invoice message
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

