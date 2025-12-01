"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { TeacherQualification } from "../../types";
import { AddQualificationModal } from "../modals/AddQualificationModal";
import { QualificationList } from "../sections";

// Mock data for private qualifications - matching the image
const MOCK_PRIVATE_QUALIFICATIONS: TeacherQualification[] = [
  {
    id: "1",
    name: "Test65",
    rate: 10.00,
  },
  {
    id: "2",
    name: "test72.5",
    rate: 10.00,
  },
  {
    id: "3",
    name: "Instrument",
    rate: 20.00,
  },
  {
    id: "4",
    name: "xClarinet",
    rate: 36.00,
  },
  {
    id: "5",
    name: "xPiano Contemporary",
    rate: 10.00,
  },
  {
    id: "6",
    name: "xGuitar Core",
    rate: 10.00,
  },
  {
    id: "7",
    name: "xGuitar Contemporary",
    rate: 10.00,
  },
  {
    id: "8",
    name: "xGuitar Hybrid",
    rate: 10.00,
  },
  {
    id: "9",
    name: "xPiano Hybrid",
    rate: undefined,
  },
  {
    id: "10",
    name: "40th Anniversary Vocal",
    rate: 25.00,
  },
  {
    id: "11",
    name: "Rami Test Program",
    rate: 30.00,
  },
];

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
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
    
    // Use mock data if no qualifications provided
    const qualifications = React.useMemo(() => {
      return propsQualifications.length > 0 ? propsQualifications : MOCK_PRIVATE_QUALIFICATIONS;
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
      },
      [onUpdate]
    );

    const handleViewToggle = React.useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    const handleModalClose = React.useCallback(() => {
      setIsAddModalOpen(false);
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
        />
      </>
    );
  }
);

