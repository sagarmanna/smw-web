import { StudentsListingClient } from "./StudentsListingClient";

interface StudentsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function StudentsPage({ params }: StudentsPageProps) {
  const { location } = await params;
  return <StudentsListingClient location={location} />;
}


