import { UnscheduledLessonsListingClient } from "./UnscheduledLessonsListingClient";

interface UnscheduledLessonsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function UnscheduledLessonsPage({ params }: UnscheduledLessonsPageProps) {
  const { location } = await params;
  return <UnscheduledLessonsListingClient location={location} />;
}

