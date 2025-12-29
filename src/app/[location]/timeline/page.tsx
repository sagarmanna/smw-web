import { TimelineListingClient } from "./TimelineListingClient";

interface TimelinePageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { location } = await params;
  return <TimelineListingClient location={location} />;
}

