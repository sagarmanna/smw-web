"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { type ActionMenuGroup } from "@/components/DetailHeader";
import { CustomTable } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { formatDisplayDate } from "@/utils/dateUtils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

import {
  createClassroomUnavailability,
  updateClassroomUnavailability,
  deleteClassroomUnavailability,
} from "./classroomDetail.api";
import {
  fetchClassroom,
  fetchUnavailabilities,
  clearClassroomDetail,
} from "./classroomDetail.slice";
import { AddClassroomModal } from "../components/modals/AddClassroomModal";
import {
  AddClassroomUnavailabilityModal,
  type ClassroomUnavailabilityRow,
} from "../components/modals/AddClassroomUnavailabilityModal";

interface ClassroomDetailClientProps {
  location: string;
  id: string;
}

export function ClassroomDetailClient({ location, id }: ClassroomDetailClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const classroomId = Number(id);

  const classroom = useAppSelector((state) => state.classroomDetail.classroom);
  const isLoading = useAppSelector((state) => state.classroomDetail.isLoading);
  const error = useAppSelector((state) => state.classroomDetail.error);
  const unavailabilities = useAppSelector((state) => state.classroomDetail.unavailabilities);
  const isUnavailabilitiesLoading = useAppSelector(
    (state) => state.classroomDetail.isUnavailabilitiesLoading
  );

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isUnavailabilityModalOpen, setIsUnavailabilityModalOpen] = React.useState(false);
  const [editingUnavailability, setEditingUnavailability] = React.useState<ClassroomUnavailabilityRow | null>(null);

  React.useEffect(() => {
    if (!location || !classroomId || Number.isNaN(classroomId)) return;
    dispatch(clearClassroomDetail());
    void dispatch(fetchClassroom({ location, classroomId }));
    void dispatch(fetchUnavailabilities({ location, classroomId }));
  }, [dispatch, location, classroomId]);

  const refetchClassroom = React.useCallback(() => {
    if (!location || !classroomId || Number.isNaN(classroomId)) return;
    void dispatch(fetchClassroom({ location, classroomId }));
  }, [dispatch, location, classroomId]);

  const refetchUnavailabilities = React.useCallback(() => {
    if (!location || !classroomId || Number.isNaN(classroomId)) return;
    void dispatch(fetchUnavailabilities({ location, classroomId }));
  }, [dispatch, location, classroomId]);

  const pageTitle = classroom?.name || `Classroom #${id}`;

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Classrooms",
        onClick: () => router.push(`/${location}/classrooms`),
      },
    ],
    [location, router]
  );

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(() => [], []);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      { label: "Name", value: classroom?.name || "N/A" },
      { label: "Long Name", value: classroom?.description || "N/A" },
    ];
  }, [classroom]);

  const unavailabilityColumns = React.useMemo<ColumnDef<ClassroomUnavailabilityRow>[]>(
    () => [
      {
        accessorKey: "fromDate",
        header: "From Date",
        cell: ({ row }) => <span className="font-medium">{formatDisplayDate(row.original.fromDate)}</span>,
      },
      {
        accessorKey: "toDate",
        header: "To Date",
        cell: ({ row }) => <span className="font-medium">{formatDisplayDate(row.original.toDate)}</span>,
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => <span className="text-sm">{row.original.reason || ""}</span>,
      },
    ],
    []
  );

  const openAddUnavailability = () => {
    setEditingUnavailability(null);
    setIsUnavailabilityModalOpen(true);
  };

  const openEditUnavailability = (row: ClassroomUnavailabilityRow) => {
    setEditingUnavailability(row);
    setIsUnavailabilityModalOpen(true);
  };

  const handleAddUnavailability = React.useCallback(
    async (data: Omit<ClassroomUnavailabilityRow, "id">) => {
      if (!location || !classroomId || Number.isNaN(classroomId)) return;
      try {
        const res = await createClassroomUnavailability(location, classroomId, {
          fromDate: data.fromDate,
          toDate: data.toDate,
          reason: data.reason ?? "",
        });
        if (res.success) {
          toast.success(res.message ?? "Unavailability created successfully");
          refetchUnavailabilities();
        } else {
          toast.error(res.message ?? "Failed to create unavailability");
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to create unavailability");
      }
    },
    [location, classroomId, refetchUnavailabilities]
  );

  const handleUpdateUnavailability = React.useCallback(
    async (data: ClassroomUnavailabilityRow) => {
      if (!location || !classroomId || Number.isNaN(classroomId)) return;
      const idNum = Number(data.id);
      if (Number.isNaN(idNum)) return;
      try {
        const res = await updateClassroomUnavailability(location, classroomId, {
          id: idNum,
          fromDate: data.fromDate,
          toDate: data.toDate,
          reason: data.reason ?? "",
        });
        if (res.success) {
          toast.success(res.message ?? "Unavailability updated successfully");
          refetchUnavailabilities();
        } else {
          toast.error(res.message ?? "Failed to update unavailability");
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update unavailability");
      }
    },
    [location, classroomId, refetchUnavailabilities]
  );

  const handleDeleteUnavailability = React.useCallback(
    async (id: string) => {
      if (!location || !classroomId || Number.isNaN(classroomId)) return;
      const idNum = Number(id);
      if (Number.isNaN(idNum)) return;
      try {
        const res = await deleteClassroomUnavailability(location, classroomId, idNum);
        if (res.success) {
          toast.success(res.message ?? "Unavailability deleted successfully");
          refetchUnavailabilities();
        } else {
          toast.error(res.message ?? "Failed to delete unavailability");
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete unavailability");
      }
    },
    [location, classroomId, refetchUnavailabilities]
  );

  return (
    <div className="px-4 sm:px-6">
      <DetailHeaderWithProfile
        breadcrumbItems={breadcrumbItems}
        currentPageTitle={pageTitle}
        loading={isLoading}
        actionMenuGroups={actionMenuGroups}
        actionButtonAriaLabel="Classroom actions"
        showProfileIcon={false}
      />

      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Details"
          data={detailRows}
          isLoading={isLoading}
          headerActions={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Edit classroom"
              onClick={() => setIsEditModalOpen(true)}
              disabled={isLoading || !classroom}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          }
        />

        <SectionCard
          title="Unavailabilities"
          isLoading={isUnavailabilitiesLoading}
          headerActions={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Add unavailability"
              onClick={openAddUnavailability}
              disabled={isLoading || isUnavailabilitiesLoading || !classroom}
            >
              <Plus className="h-4 w-4" />
            </Button>
          }
        >
          <CustomTable<ClassroomUnavailabilityRow, unknown>
            data={unavailabilities}
            columns={unavailabilityColumns}
            size="compact"
            variant="default"
            stickyHeader={false}
            enableSearch={false}
            enableFilter={false}
            enablePrint={false}
            enableRowsPerPage={false}
            isLoading={isUnavailabilitiesLoading}
            customEmptyState={<div className="py-3 text-sm text-muted-foreground">No unavailabilities</div>}
            onRowClick={openEditUnavailability}
          />
        </SectionCard>
      </div>

      <AddClassroomModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        location={location}
        mode="edit"
        initialData={classroom}
        onAfterAction={(action) => {
          if (action === "delete") {
            router.push(`/${location}/classrooms`);
            return;
          }
          refetchClassroom();
        }}
      />

      <AddClassroomUnavailabilityModal
        open={isUnavailabilityModalOpen}
        onClose={() => setIsUnavailabilityModalOpen(false)}
        mode={editingUnavailability ? "edit" : "add"}
        initialData={editingUnavailability}
        onSubmit={handleAddUnavailability}
        onUpdate={handleUpdateUnavailability}
        onDelete={handleDeleteUnavailability}
      />
    </div>
  );
}

