"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

// Reusable component for edit and delete actions

interface EditDeleteActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EditDeleteActions({
  onEdit,
  onDelete,
}: EditDeleteActionsProps) {
  return (
    <div className="absolute right-4 flex items-center gap-2 flex-shrink-0">
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

