import { LocationsListingClient } from "./LocationsListingClient";

interface LocationsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function LocationsPage({ params }: LocationsPageProps) {
  const { location } = await params;
  return <LocationsListingClient location={location} />;
}
