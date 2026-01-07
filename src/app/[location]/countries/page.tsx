import { CountriesListingClient } from "./CountriesListingClient";

interface CountriesPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function CountriesPage({ params }: CountriesPageProps) {
  const { location } = await params;
  return <CountriesListingClient location={location} />;
}
