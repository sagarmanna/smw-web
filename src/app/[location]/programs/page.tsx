import { ProgramsListingClient } from "./ProgramsListingClient";

interface ProgramsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function ProgramsPage({ params }: ProgramsPageProps) {
  const { location } = await params;
  return <ProgramsListingClient location={location} />;
}
