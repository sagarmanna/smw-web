"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { TeacherQualification } from "../../types";
import { AddQualificationModal } from "../modals/AddQualificationModal";
import { QualificationList } from "../sections";
import { createQualification } from "@/lib/api/legacyApiAdapter";
import { toast } from "sonner";

interface TeacherPrivateQualificationCardProps {
  qualifications: TeacherQualification[];
  onUpdate: React.Dispatch<React.SetStateAction<TeacherQualification[]>>;
  loading?: boolean;
  location: string;
  teacherId: number;
  onRefresh?: () => Promise<void>;
}

export const TeacherPrivateQualificationCard = React.memo(
  function TeacherPrivateQualificationCard({
    qualifications: propsQualifications,
    onUpdate,
    loading = false,
    location,
    teacherId,
    onRefresh,
  }: TeacherPrivateQualificationCardProps) {
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
          // TODO: Implement update functionality when needed
          // For now, just update local state
          onUpdate((prev) =>
            prev.map((qual) =>
              qual.id === editingQualification.id
                ? {
                    ...qual,
                    rate: data.rate,
                  }
                : qual
            )
          );
          setIsEditModalOpen(false);
          setEditingQualification(null);
        } else {
          // Create new qualifications via legacy API
          if (!data.rate) {
            toast.error("Rate is required");
            return;
          }

          try {
            const response = await createQualification(
              location,
              teacherId,
              1, // type 1 = private qualification
              {
                programs: data.programs,
                rate: data.rate,
              }
            );

            if (response.status) {
              toast.success("Qualification added successfully");
              setIsAddModalOpen(false);
              // Refresh data from server
              if (onRefresh) {
                await onRefresh();
              }
            } else {
              const errorMessage =
                response.message ||
                response.errors?.join(", ") ||
                "Failed to create qualification";
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
      [onUpdate, editingQualification, location, teacherId, onRefresh]
    );

    const handleRowClick = React.useCallback(
      (qualification: TeacherQualification) => {
        setEditingQualification(qualification);
        setIsEditModalOpen(true);
      },
      []
    );

    const handleDelete = React.useCallback(
      (id: string) => {
        onUpdate((prev) => prev.filter((qual) => qual.id !== id));
        setEditingQualification(null);
      },
      [onUpdate]
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
          title="Private Qualifications"
          onAddClick={handleAddClick}
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
                onRowClick={handleRowClick}
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
          programType="private"
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
          programType="private"
        />
      </>
    );
  }
);

