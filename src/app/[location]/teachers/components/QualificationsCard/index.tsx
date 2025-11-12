"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Qualification } from "../../teachers.api";
import { AddQualificationModal, PRIVATE_PROGRAMS, GROUP_PROGRAMS } from "../modals/AddQualificationModal";

interface QualificationsCardProps {
  title: string;
  qualifications: Qualification[];
  onView: () => void;
  onAdd: (qualifications: Array<{ program: string; rate: number }>) => void;
  loading?: boolean;
  type?: "private" | "group";
}

export function QualificationsCard({
  title,
  qualifications,
  onView,
  onAdd,
  loading = false,
  type = "private",
}: QualificationsCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const handleEyeClick = () => {
    setIsExpanded(!isExpanded);
    onView();
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleAddQualifications = (newQualifications: Array<{ program: string; rate: number }>) => {
    onAdd(newQualifications);
  };

  const availablePrograms = type === "group" ? GROUP_PROGRAMS : PRIVATE_PROGRAMS;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleEyeClick}
          >
            {isExpanded ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleAddClick}
          >
            <Plus className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : qualifications.length > 0 ? (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-0 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Name
                    </th>
                    <th className="text-left py-2 px-0 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Rate ($/hr)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {qualifications.map((qual, index) => (
                    <tr
                      key={qual.id}
                      className={
                        index !== qualifications.length - 1
                          ? "border-b border-gray-100 dark:border-gray-800"
                          : ""
                      }
                    >
                      <td className="py-3 px-0 text-sm text-gray-800 dark:text-gray-200">
                        {qual.name}
                      </td>
                      <td className="py-3 px-0 text-sm text-gray-800 dark:text-gray-200">
                        {qual.rate ? `$${qual.rate.toFixed(2)}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-gray-500">
              No qualifications added yet.
            </div>
          )}
        </CardContent>
      )}

      {/* Add Qualification Modal */}
      <AddQualificationModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Qualification"
        onAdd={handleAddQualifications}
        availablePrograms={availablePrograms}
      />
    </Card>
  );
}

