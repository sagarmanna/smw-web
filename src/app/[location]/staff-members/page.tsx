import { StaffMembersListingClient } from "./StaffMembersListingClient";

interface StaffMembersPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function StaffMembersPage({ params }: StaffMembersPageProps) {
  const { location } = await params;
  return <StaffMembersListingClient location={location} />;
}
