import { ReleaseNotesListingClient } from "./ReleaseNotesListingClient";

interface ReleaseNotesPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function ReleaseNotesPage({ params }: ReleaseNotesPageProps) {
  const { location } = await params;
  return <ReleaseNotesListingClient location={location} />;
}

