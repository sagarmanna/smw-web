import { ProvincesListingClient } from "./ProvincesListingClient";

interface ProvincesPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function ProvincesPage({ params }: ProvincesPageProps) {
  const { location } = await params;
  return <ProvincesListingClient location={location} />;
}
