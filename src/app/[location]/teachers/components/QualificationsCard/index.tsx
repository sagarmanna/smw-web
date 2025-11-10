"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Qualification } from "../../teachers.api";

interface QualificationsCardProps {
  title: string;
  qualifications: Qualification[];
  onView: () => void;
  onAdd: () => void;
  loading?: boolean;
}

export function QualificationsCard({
  title,
  qualifications,
  onView,
  onAdd,
  loading = false,
}: QualificationsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onView}
          >
            <Eye className="h-4 w-4 text-gray-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : qualifications.length > 0 ? (
          <div className="space-y-2">
            {qualifications.map((qual) => (
              <div
                key={qual.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
              >
                <div className="font-medium text-sm">{qual.name}</div>
                {qual.description && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {qual.description}
                  </div>
                )}
                {qual.dateObtained && (
                  <div className="text-xs text-gray-500 mt-1">
                    Obtained: {qual.dateObtained}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-gray-500">
            No qualifications added yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

