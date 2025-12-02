import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Eye, EyeOff } from "lucide-react";

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  showAddButton?: boolean;
  onAddClick?: () => void;
  showViewToggle?: boolean;
  isExpanded?: boolean;
  onViewToggle?: () => void;
  className?: string;
  loading?: boolean;
}

export function InfoCard({ 
  title, 
  children, 
  showAddButton = true, 
  onAddClick,
  showViewToggle = false,
  isExpanded = false,
  onViewToggle,
  className,
  loading = false
}: InfoCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex items-center gap-1">
          {loading ? (
            <>
              {showViewToggle && <Skeleton className="h-8 w-8 rounded-md" />}
              {showAddButton && <Skeleton className="h-8 w-8 rounded-md" />}
            </>
          ) : (
            <>
              {showViewToggle && onViewToggle && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground"
                  onClick={onViewToggle}
                  aria-label={isExpanded ? "Hide details" : "Show details"}
                >
                  {isExpanded ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              )}
              {showAddButton && onAddClick && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={onAddClick}
                  aria-label="Add"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}