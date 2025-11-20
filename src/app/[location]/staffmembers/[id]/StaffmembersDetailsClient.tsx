'use client';

import { useAppSelector } from '@/redux/hooks';
import { DetailHeader } from '@/components/DetailHeader';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import { ErrorDisplay } from '@/components/ErrorDisplay';

interface StaffmembersDetailsClientProps {
  location: string;
}

export default function StaffmembersDetailsClient({ location }: StaffmembersDetailsClientProps) {
  const staffMemberInfo = useAppSelector((state) => state.staffMember.staffMemberInfo);
  const isLoading = useAppSelector((state) => state.staffMember.isLoading);
  const error = useAppSelector((state) => state.staffMember.error);

  // Show full-page loading animation while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation 
          size="xl" 
          text="Loading staff member details..." 
          className="text-center"
        />
      </div>  
    );
  }

  // Error state
  if (error) {
    return (
        <ErrorDisplay
          error={error}
          title="Unable to Load Staff Member Details"
          fallbackMessage="An unexpected error occurred while loading the staff member details. Please try again later."
        />
    );
  }

  return (
    <>
      <DetailHeader
        breadcrumbItems={[
          { label: 'Staff Members', href: `/${location}/staffmembers` },
        ]}
        currentPageTitle={staffMemberInfo?.profile?.name || 'Staff Member'}
        showActions={true}
      />

      {/* create details card for the staff member */}
    </>
  );
}

