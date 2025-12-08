"use client";

import * as React from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { TabContent } from "@/components/TabContent";
import { unavailabilityColumns } from "../../../../teacherTabConfigs";
import { addUnavailability, updateUnavailability, deleteUnavailability, fetchTeacherTabsData } from "../../../../[id]/teacherTabs.slice";
import type { UnavailabilityData } from "../../../../teacherTabConfigs";
import { AddUnavailabilityModal } from "../../../modals/AddUnavailabilityModal";

interface UnavailabilitiesTabProps {
  location: string;
  teacherId: number;
}

export function UnavailabilitiesTab({ location, teacherId }: UnavailabilitiesTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.teacherTabs.unavailabilityData);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingData, setEditingData] = React.useState<UnavailabilityData | null>(null);

  const handleAddUnavailability = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleRowClick = (row: UnavailabilityData) => {
    setEditingData(row);
    setIsModalOpen(true);
  };

  const handleSubmitUnavailability = (unavailabilityData: Omit<UnavailabilityData, "id">) => {
    // Note: If API creation is successful, data will be refreshed via onSuccess callback
    // This is a fallback for when API is not used
    const newUnavailability: UnavailabilityData = {
      id: Date.now().toString(),
      ...unavailabilityData,
    };
    dispatch(addUnavailability(newUnavailability));
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleSuccess = React.useCallback(() => {
    // Refresh unavailability data from server
    dispatch(fetchTeacherTabsData({ location, teacherId }));
  }, [dispatch, location, teacherId]);

  const handleUpdateUnavailability = (unavailabilityData: UnavailabilityData) => {
    dispatch(updateUnavailability(unavailabilityData));
    setIsModalOpen(false);
    setEditingData(null);
  };

  const handleDeleteUnavailability = (id: string) => {
    dispatch(deleteUnavailability(id));
    setIsModalOpen(false);
    setEditingData(null);
  };

  return (
    <>
      <TabContent
        title="Unavailabilities"
        data={data}
        columns={unavailabilityColumns}
        hasAddButton={true}
        onAdd={handleAddUnavailability}
        hasTable={true}
        emptyState="No unavailabilities found."
        onRowClick={handleRowClick}
        rowClassName="cursor-pointer"
      />
      <AddUnavailabilityModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitUnavailability}
        onUpdate={handleUpdateUnavailability}
        onDelete={handleDeleteUnavailability}
        existingUnavailabilities={data}
        initialData={editingData}
        mode={editingData ? "edit" : "add"}
        location={location}
        teacherId={teacherId}
        onSuccess={handleSuccess}
      />
    </>
  );
}

