"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { useTeacherDetails } from "../hooks/useTeacherDetails";
import { TeachersDetailCard } from "../components/TeachersDetailCard";

interface TeachersDetailClientProps {
  location: string;
  id: string;
}


export function TeachersDetailClient({ location, id }: TeachersDetailClientProps) {
  const router = useRouter();
  const teacherId = Number(id);

  const {
    loading,
    details,
    saveDetails,
    updatePassword,
    savingDetails,
  } = useTeacherDetails(location, teacherId);


  const pageTitle = React.useMemo(() => {
    const fullName = details
      ? [details.firstName, details.lastName].filter(Boolean).join(" ")
      : "";
    return fullName || `Teacher #${id}`;
  }, [details, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Teachers",
        onClick: () => router.push(`/${location}/teachers`),
      },
    ],
    [location, router]
  );

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [
    {
      label: "Actions",
      items: [
        {
          label: "Delete",
          onClick: () => {
              // TODO: implement delete behaviour
          },
          variant: "destructive",
        },
      ],
    },
    ],
    []
  );

  return (
    <>
      <div className="bg-white dark:bg-black">
      <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
        loading={loading}
          actionMenuGroups={actionMenuGroups}
        actionButtonAriaLabel="Teacher actions"
        showProfileIcon={true}
        profileIconSize="md"
      />

        <div className="mt-4">
          <TeachersDetailCard
            details={details}
            onSaveDetails={saveDetails}
            onUpdatePassword={updatePassword}
            savingDetails={savingDetails}
          />
        </div>
      </div>
    </>
  );
}




