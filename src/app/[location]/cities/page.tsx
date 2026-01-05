import { CitiesListingClient } from "./CitiesListingClient";

interface CitiesPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function CitiesPage({ params }: CitiesPageProps) {
  const { location } = await params;
  return <CitiesListingClient location={location} />;
}
