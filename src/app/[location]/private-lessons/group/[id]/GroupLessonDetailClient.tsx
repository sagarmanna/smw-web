"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { GroupLessonTabsSection } from "../../components/GroupLessonTabsSection";
import { PrivateLessonScheduleCard } from "../../components/PrivateLessonScheduleCard";
import { PrivateLessonCommentsCard } from "../../components/PrivateLessonCommentsCard";
import { PrivateLessonDetailsCard } from "../../components/PrivateLessonDetailsCard";
import { PrivateLessonCostCard } from "../../components/PrivateLessonCostCard";
import { Button } from "@/components/ui/button";
import type { PrivateLessonDetails, PrivateLessonInfo } from "../../types";
import {
  updateCost,
  updatePrivateLessonDetails,
} from "../../[id]/private-lesson-details.api";
import { fetchGroupLessonDetails } from "./group-lesson-details.api";

interface GroupLessonDetailClientProps {
  location: string;
  id: string;
}

export function GroupLessonDetailClient({ location, id }: GroupLessonDetailClientProps) {
  const router = useRouter();
  const [data, setData] = React.useState<PrivateLessonInfo | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingDetails, setSavingDetails] = React.useState(false);

  const refetchLessonInfo = React.useCallback(async (): Promise<boolean> => {
    try {
      const result = await fetchGroupLessonDetails(location, id);
      if (!result.lessonInfo.details.isGroup) {
        setError("This lesson is not a group lesson.");
        return false;
      }
      setData(result.lessonInfo);
      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load group lesson details.");
      return false;
    }
  }, [location, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Group Lessons",
        onClick: () => router.push(`/${location}/private-lessons`),
      },
    ],
    [location, router]
  );

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const result = await fetchGroupLessonDetails(location, id);
        if (!cancelled) {
          if (!result.lessonInfo.details.isGroup) {
            setError("This lesson is not a group lesson.");
          } else {
            setData(result.lessonInfo);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load group lesson details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [location, id]);

  const handleSaveDetails = React.useCallback(
    async (detailsToSave: Partial<PrivateLessonDetails>): Promise<boolean> => {
      try {
        setSavingDetails(true);
        const result = await updatePrivateLessonDetails(location, id, {
          classroomId: detailsToSave.classroomId,
          colorCode: detailsToSave.colorCode,
          isOnline: detailsToSave.online,
        });

        if (!result?.success) {
          toast.error(result?.message || "Failed to update lesson details");
          return false;
        }

        toast.success(result.message || "Details updated successfully");
        return await refetchLessonInfo();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update lesson details");
        return false;
      } finally {
        setSavingDetails(false);
      }
    },
    [location, id, refetchLessonInfo]
  );

  const handleSaveCost = React.useCallback(
    async (costData: { costPerHour?: string; cost?: string; price?: string }): Promise<boolean> => {
      try {
        setSavingDetails(true);
        const teacherRate = parseFloat((costData.costPerHour || "0").replace("$", "").trim());
        if (Number.isNaN(teacherRate)) {
          toast.error("Invalid teacher cost value");
          return false;
        }

        const result = await updateCost(location, id, { teacherRate });
        if (!result?.success) {
          toast.error(result?.message || "Failed to update cost");
          return false;
        }

        toast.success(result.message || "Cost updated successfully");
        return await refetchLessonInfo();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update cost");
        return false;
      } finally {
        setSavingDetails(false);
      }
    },
    [location, id, refetchLessonInfo]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <LoadingAnimation size="lg" text="Loading group lesson..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <ErrorDisplay
          title="Unable to load group lesson"
          error={error ?? "Unknown error"}
          fallbackMessage="An unexpected error occurred. Please try again."
        />
        <Button variant="outline" onClick={() => router.refresh()} className="w-full sm:w-auto">
          Try again
        </Button>
      </div>
    );
  }

  const { details, comments, history, students } = data;

  return (
    <div className="space-y-4">
      <DetailHeaderWithProfile
        breadcrumbItems={breadcrumbItems}
        currentPageTitle={details.program || `Group Lesson #${id}`}
        loading={false}
        actionMenuGroups={[]}
        actionButtonAriaLabel="Group lesson actions"
        showProfileIcon={false}
        profileIconSize="md"
      />

      <div className="space-y-3 sm:space-y-4 mt-4">
        {/* Group Lesson Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            <PrivateLessonDetailsCard
              details={details}
              onSaveDetails={handleSaveDetails}
              savingDetails={savingDetails}
              isLoading={false}
              location={location}
            />

            <PrivateLessonCostCard
              details={details}
              groupCost={data.groupCost}
              onSaveCost={handleSaveCost}
              savingDetails={savingDetails}
              isLoading={false}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
            <PrivateLessonScheduleCard
              details={details}
              isLoading={false}
              location={location}
              hideGenerateInvoice={true}
            />

            <PrivateLessonCommentsCard
              comments={comments}
              isLoading={false}
            />
          </div>
        </div>

        {/* Tabs Section (Students & History) */}
        <GroupLessonTabsSection
          location={location}
          students={students || []}
          history={history}
          historyPagination={null}
          historyLoading={false}
          historyError={null}
          onHistoryPageChange={() => {}}
          onSaveStudentDiscount={async () => true}
          savingDetails={savingDetails}
          isLoading={false}
        />
      </div>
    </div>
  );
}

