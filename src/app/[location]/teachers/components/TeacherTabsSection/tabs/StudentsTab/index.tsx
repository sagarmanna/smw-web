"use client";

import { useAppSelector } from "@/redux/hooks";
import { TabContent } from "@/components/TabContent";
import { teacherStudentColumns } from "../../../../teacherTabConfigs";

interface StudentsTabProps {
  location: string;
  teacherId: number;
}

export function StudentsTab({ location, teacherId }: StudentsTabProps) {
  const data = useAppSelector((state) => state.teacherTabs.studentData);

  return (
    <TabContent
      title="Students"
      data={data}
      columns={teacherStudentColumns}
      hasAddButton={false}
      hasTable={true}
      emptyState="No students found."
    />
  );
}

