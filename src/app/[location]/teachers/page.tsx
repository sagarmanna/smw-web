import { TeachersListingClient } from "./TeachersListingClient";

interface TeachersPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function TeachersPage({ params }: TeachersPageProps) {
  const { location } = await params;
  return <TeachersListingClient location={location} />;
}
