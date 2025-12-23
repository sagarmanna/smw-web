import { PrivateLessonsListingClient } from "./PrivateLessonsListingClient";

interface PrivateLessonsPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function PrivateLessonsPage({ params }: PrivateLessonsPageProps) {
  const { location } = await params;
  return <PrivateLessonsListingClient location={location} />;
}

