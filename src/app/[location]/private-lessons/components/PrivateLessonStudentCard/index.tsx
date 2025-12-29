"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  SectionCard,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { PrivateLessonDetails } from "../../types";

interface PrivateLessonStudentCardProps {
  details: PrivateLessonDetails | null;
  isLoading?: boolean;
  location: string;
}

export const PrivateLessonStudentCard = React.memo(function PrivateLessonStudentCard({
  details,
  isLoading = false,
  location,
}: PrivateLessonStudentCardProps) {
  const router = useRouter();

  const handleStudentClick = React.useCallback(() => {
    if (details?.studentId) {
      router.push(`/${location}/students/${details.studentId}`);
    }
  }, [details?.studentId, location, router]);

  const handleCustomerClick = React.useCallback(() => {
    if (details?.customerId) {
      router.push(`/${location}/customers/${details.customerId}`);
    }
  }, [details?.customerId, location, router]);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const studentValue = details?.studentId ? (
      <span
        onClick={handleStudentClick}
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
      >
        {details?.student || "N/A"}
      </span>
    ) : (
      details?.student || "N/A"
    );

    const customerValue = details?.customerId ? (
      <span
        onClick={handleCustomerClick}
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
      >
        {details?.customer || "N/A"}
      </span>
    ) : (
      details?.customer || "N/A"
    );

    return [
      {
        label: "Student",
        value: studentValue,
      },
      {
        label: "Customer",
        value: customerValue,
      },
      {
        label: "Phone",
        value: details?.phone || "N/A",
      },
    ];
  }, [details, handleStudentClick, handleCustomerClick]);

  return (
    <SectionCard
      title="Student"
      data={detailRows}
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
    />
  );
});

