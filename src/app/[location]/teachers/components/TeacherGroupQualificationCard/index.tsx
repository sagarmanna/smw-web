"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { TeacherQualification } from "../../types";
import { AddQualificationModal } from "../modals/AddQualificationModal";
import { QualificationList } from "../sections";
import { updateTeacherQualification, deleteTeacherQualification } from "../../[id]/teachers-details.api";
import { createTeacherQualification } from "../../[id]/teachers-details.api";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchQualifications } from "../../[id]/teachers.slice";

interface TeacherGroupQualificationCardProps {
  qualifications: TeacherQualification[];
  onUpdate: React.Dispatch<React.SetStateAction<TeacherQualification[]>>;
  loading?: boolean;
  location: string;
  teacherId: number;
}

export const TeacherGroupQualificationCard = React.memo(
  function TeacherGroupQualificationCard({
    qualifications: propsQualifications,
    onUpdate,
    loading = false,
    location,
    teacherId,
  }: TeacherGroupQualificationCardProps) {
    const dispatch = useAppDispatch();
    const { userInfo } = useAppSelector((state) => state.user);
    const hideRateColumn = userInfo?.role === 'staffmember';
    const isStaffMember = userInfo?.role === 'staffmember';
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [editingQualification, setEditingQualification] = React.useState<TeacherQualification | null>(null);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
    
    // Use qualifications from props (fetched from API)
    const qualifications = React.useMemo(() => {
      return propsQualifications;
    }, [propsQualifications]);

    const handleAddClick = React.useCallback(() => {
      setIsAddModalOpen(true);
    }, []);

    // Pagination calculations
    const totalPages = Math.ceil(qualifications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedQualifications = qualifications.slice(startIndex, endIndex);
    const showPagination = qualifications.length > itemsPerPage;

    const handlePageChange = React.useCallback((page: number) => {
      setCurrentPage(page);
    }, []);

    // Reset to page 1 when qualifications change
    React.useEffect(() => {
      setCurrentPage(1);
    }, [qualifications.length]);

    const handleModalSubmit = React.useCallback(
      async (data: { programs: number[]; rate?: number }) => {
        if (editingQualification) {
          // Update existing qualification via legacy API
          if (data.rate === undefined || data.rate === null) {
            toast.error("Rate is required");
            return;
          }

          try {
            // Convert qualification ID from string to number for API
            const qualificationId = Number(editingQualification.id);
            if (isNaN(qualificationId)) {
              toast.error("Invalid qualification ID");
              return;
            }

            const response = await updateTeacherQualification(
              location,
              teacherId,
              qualificationId,
              {
                rate: data.rate,
              }
            );

            if (response && response.success) {
              toast.success("Qualification updated successfully");
              setIsEditModalOpen(false);
              setEditingQualification(null);
              // Update Redux state directly
              onUpdate((prev) =>
                prev.map((qual) =>
                  qual.id === editingQualification.id
                    ? { ...qual, rate: data.rate }
                    : qual
                )
              );
            } else {
              const errorMessage =
                response?.message || "Failed to update qualification";
              toast.error(errorMessage);
            }
          } catch (error) {
            console.error("Error updating qualification:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Failed to update qualification";
            toast.error(errorMessage);
          }
        } else {
          // Create new qualifications via legacy API
          if (data.rate === undefined || data.rate === null) {
            toast.error("Rate is required");
            return;
          }

          try {
            const response = await createTeacherQualification(
              location,
              teacherId,
              2, // type 2 = group qualification
              {
                programs: data.programs,
                rate: data.rate,
              }
            );

            if (response && response.success) {
              const programCount = data.programs.length;
              toast.success(
                programCount > 1
                  ? `${programCount} qualifications added successfully`
                  : "Qualification added successfully"
              );
              setIsAddModalOpen(false);
              // For create, we need to fetch qualifications to get the IDs from server
              // This is necessary because the API doesn't return the created qualification IDs
              // We'll use fetchQualifications which only fetches qualifications, not all teacher data
              await dispatch(fetchQualifications({ location, teacherId }));
            } else {
              const errorMessage =
                response?.message || "Failed to create qualification";
              toast.error(errorMessage);
            }
          } catch (error) {
            console.error("Error creating qualification:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Failed to create qualification";
            toast.error(errorMessage);
          }
        }
      },
      [onUpdate, editingQualification, location, teacherId, dispatch]
    );

    const handleRowClick = React.useCallback(
      (qualification: TeacherQualification) => {
        setEditingQualification(qualification);
        setIsEditModalOpen(true);
      },
      []
    );

    const handleDelete = React.useCallback(
      async (id: string) => {
        // Find the qualification to verify it exists
        const qualificationToDelete = qualifications.find((qual) => qual.id === id);
        if (!qualificationToDelete) {
          toast.error("Qualification not found");
          return;
        }

        try {
          // Convert qualification ID from string to number for API
          const qualificationId = Number(id);
          if (isNaN(qualificationId)) {
            toast.error("Invalid qualification ID");
            return;
          }

          const response = await deleteTeacherQualification(
            location,
            teacherId,
            qualificationId
          );

          if (response && response.success) {
            toast.success("Qualification deleted successfully");
            setEditingQualification(null);
            setIsEditModalOpen(false);
            // Update Redux state directly - remove the deleted qualification
            onUpdate((prev) => prev.filter((qual) => qual.id !== id));
          } else {
            const errorMessage =
              response?.message || "Failed to delete qualification";
            toast.error(errorMessage);
          }
        } catch (error) {
          console.error("Error deleting qualification:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to delete qualification";
          toast.error(errorMessage);
        }
      },
      [onUpdate, qualifications, location, teacherId]
    );

    const handleViewToggle = React.useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    const handleModalClose = React.useCallback(() => {
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setEditingQualification(null);
    }, []);

    const handleEditModalClose = React.useCallback(() => {
      setIsEditModalOpen(false);
      setEditingQualification(null);
    }, []);

    return (
      <>
        <InfoCard
          title="Group Qualifications"
          onAddClick={isStaffMember ? undefined : handleAddClick}
          showAddButton={!isStaffMember}
          showViewToggle={true}
          isExpanded={isExpanded}
          onViewToggle={handleViewToggle}
          loading={loading}
        >
          {isExpanded && (
            <div className="space-y-2">
              <QualificationList
                qualifications={paginatedQualifications}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                showPagination={showPagination}
                onPageChange={handlePageChange}
                onRowClick={isStaffMember ? undefined : handleRowClick}
                hideRateColumn={hideRateColumn}
              />
            </div>
          )}
        </InfoCard>

        <AddQualificationModal
          open={isAddModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          title="Qualification"
          allowRate={true}
          mode="add"
          programType="group"
          existingQualifications={qualifications}
        />

        <AddQualificationModal
          open={isEditModalOpen}
          onClose={handleEditModalClose}
          onSubmit={handleModalSubmit}
          title="Qualification"
          allowRate={true}
          mode="edit"
          initialData={editingQualification}
          onDelete={handleDelete}
          programType="group"
        />
      </>
    );
  }
);

