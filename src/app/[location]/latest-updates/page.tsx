import { LatestUpdatesClient } from "./LatestUpdatesClient";

interface LatestUpdatesPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function LatestUpdatesPage({ params }: LatestUpdatesPageProps) {
  const { location } = await params;
  return <LatestUpdatesClient location={location} />;
}


