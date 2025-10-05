import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  exportType: string | null;
}

export function ExportDialog({ isOpen, onClose, onConfirm, exportType }: ExportDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmation</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p>
            The {exportType?.toUpperCase()} export file will be generated for download.
          </p>
          <p className="text-muted-foreground">
            Disable any popup blockers in your browser to ensure proper download.
          </p>
          <p>Ok to proceed?</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>Ok</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
