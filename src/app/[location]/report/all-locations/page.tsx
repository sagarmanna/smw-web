import { AllLocationsClient } from "./AllLocationsClient";

interface AllLocationsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function AllLocationsPage({ params }: AllLocationsPageProps) {
  const { location } = await params;
  return <AllLocationsClient location={location} />;
}
