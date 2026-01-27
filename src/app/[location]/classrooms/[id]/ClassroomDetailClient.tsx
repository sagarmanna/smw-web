"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";

import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { type ActionMenuGroup } from "@/components/DetailHeader";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";

import { getClassroomById, type ClassroomRow } from "../classrooms.api";
import { AddClassroomModal } from "../components/modals/AddClassroomModal";

interface ClassroomDetailClientProps {
  location: string;
  id: string;
}

export function ClassroomDetailClient({ location, id }: ClassroomDetailClientProps) {
  const router = useRouter();
  const classroomId = Number(id);

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [classroom, setClassroom] = React.useState<ClassroomRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const requestIdRef = React.useRef(0);

  const fetchClassroom = React.useCallback(
    async (options?: { showLoading?: boolean }) => {
      if (!location || !classroomId || Number.isNaN(classroomId)) return;

      const reqId = ++requestIdRef.current;
      const showLoading = options?.showLoading ?? true;

      if (showLoading) setIsLoading(true);
      setError(null);

      try {
        const res = await getClassroomById(location, classroomId);
        // Ignore stale responses
        if (reqId !== requestIdRef.current) return;

        if (res?.success && res.data) {
          setClassroom(res.data);
        } else {
          setClassroom(null);
          setError(res?.message || "Failed to load classroom");
        }
      } catch (e) {
        if (reqId !== requestIdRef.current) return;
        setClassroom(null);
        setError(e instanceof Error ? e.message : "Failed to load classroom");
      } finally {
        if (reqId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [location, classroomId]
  );

  React.useEffect(() => {
    void fetchClassroom({ showLoading: true });
    return () => {
      // Invalidate any in-flight request on unmount/param change
      requestIdRef.current += 1;
    };
  }, [fetchClassroom]);

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
          isLoading={isLoading}
          headerActions={
            <Button type="button" variant="ghost" size="icon" aria-label="Add unavailability" disabled>
              <Plus className="h-4 w-4" />
            </Button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-semibold">From Date</th>
                  <th className="py-2 text-left font-semibold">To Date</th>
                  <th className="py-2 text-left font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 text-muted-foreground" colSpan={3}>
                    No unavailabilities
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
          void fetchClassroom({ showLoading: false });
        }}
      />
    </div>
  );
}

