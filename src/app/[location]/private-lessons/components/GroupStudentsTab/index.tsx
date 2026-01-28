"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { GroupLessonStudent } from "../../types";

interface GroupStudentsTabProps {
  students: GroupLessonStudent[];
  isLoading?: boolean;
  location: string;
  lessonId: string;
}

export function GroupStudentsTab({
  students,
  isLoading = false,
  location,
  lessonId,
}: GroupStudentsTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-gray-500">Loading students...</div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="text-gray-500">No students found</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Student Name
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Customer Name
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Due Date
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Gross Price
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Discount
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Net Price
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Owing
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4 text-sm text-gray-900">
                {student.studentName}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {student.customerName}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {student.dueDate}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {student.grossPrice}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {student.discount}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {student.netPrice}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {student.owing}
              </td>
              <td className="py-3 px-4 text-sm text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-3 py-1"
                  >
                    Edit Discount
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1"
                  >
                    Create Invoice
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white text-xs px-3 py-1"
                  >
                    View Payment
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
