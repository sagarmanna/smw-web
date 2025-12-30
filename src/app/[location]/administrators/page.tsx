import { AdministratorsListingClient } from "./AdministratorsListingClient";

interface AdministratorsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function AdministratorsPage({ params }: AdministratorsPageProps) {
  const { location } = await params;
  return <AdministratorsListingClient location={location} />;
}