import { StudentsClient } from "./StudentsClient";

interface StudentsPageProps {
  params: Promise<{
    location: Location;
  }>;
}

export default async function StudentsPage({ params }: StudentsPageProps) {
  const { location } = await params;
  return <StudentsClient location={String(location)} />;
}


