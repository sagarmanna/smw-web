"use client";

import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { TabContent } from "@/components/TabContent";
import { unavailabilityColumns } from "../../../../teacherTabConfigs";
import { addUnavailability } from "../../../../[id]/teacherTabs.slice";
import type { UnavailabilityData } from "../../../../teacherTabConfigs";

interface UnavailabilitiesTabProps {
  location: string;
  teacherId: number;
}

export function UnavailabilitiesTab({ location, teacherId }: UnavailabilitiesTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.teacherTabs.unavailabilityData);

  const handleAddUnavailability = () => {
    // TODO: Implement add unavailability modal/API
    const newUnavailability: UnavailabilityData = {
      id: Date.now().toString(),
      fromDateTime: new Date().toLocaleString(),
      toDateTime: new Date().toLocaleString(),
      reason: "New unavailability",
    };
    dispatch(addUnavailability(newUnavailability));
  };

  return (
    <TabContent
      title="Unavailabilities"
      data={data}
      columns={unavailabilityColumns}
      hasAddButton={true}
      onAdd={handleAddUnavailability}
      hasTable={true}
      emptyState="No unavailabilities found."
    />
  );
}

