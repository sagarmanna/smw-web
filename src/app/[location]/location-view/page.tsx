import { LocationDetailClient } from "../locations/[slug]/LocationDetailClient";

interface LocationDetailPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function LocationDetailPage({ params }: LocationDetailPageProps) {
  const { location } = await params;
  return <LocationDetailClient location={location} />;
}


