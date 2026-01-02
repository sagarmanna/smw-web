import { OwnersListingClient } from "./OwnersListingClient";

interface OwnersPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function OwnersPage({ params }: OwnersPageProps) {
  const { location } = await params;
  return <OwnersListingClient location={location} />;
}
