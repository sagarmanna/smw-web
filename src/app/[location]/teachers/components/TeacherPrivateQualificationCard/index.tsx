"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { TeacherQualification } from "../../types";
import { AddQualificationModal } from "../modals/AddQualificationModal";
import { QualificationList } from "../sections";

interface TeacherPrivateQualificationCardProps {
  qualifications: TeacherQualification[];
  onUpdate: React.Dispatch<React.SetStateAction<TeacherQualification[]>>;
  loading?: boolean;
}

export const TeacherPrivateQualificationCard = React.memo(
  function TeacherPrivateQualificationCard({
    qualifications: propsQualifications,
    onUpdate,
    loading = false,
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
      (data: { programs: string[]; rate?: number }) => {
        if (editingQualification) {
          // Update existing qualification
          onUpdate((prev) =>
            prev.map((qual) =>
              qual.id === editingQualification.id
                ? {
                    ...qual,
                    name: data.programs[0] || qual.name,
                    rate: data.rate,
                  }
                : qual
            )
          );
          setIsEditModalOpen(false);
          setEditingQualification(null);
        } else {
          // Transform programs to qualifications and add to the list
          const newQualifications: TeacherQualification[] = data.programs.map(
            (program) => ({
              id: crypto.randomUUID(),
              name: program,
              rate: data.rate,
            })
          );

          // Add all new qualifications to the list
          onUpdate((prev) => [...prev, ...newQualifications]);
          
          setIsAddModalOpen(false);
        }
      },
      [onUpdate, editingQualification]
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
        />
      </>
    );
  }
);

