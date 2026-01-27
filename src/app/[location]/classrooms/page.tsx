import { ClassroomsListingClient } from "./ClassroomsListingClient";

interface ClassroomsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function ClassroomsPage({ params }: ClassroomsPageProps) {
  const { location } = await params;
  return <ClassroomsListingClient location={location} />;
}
