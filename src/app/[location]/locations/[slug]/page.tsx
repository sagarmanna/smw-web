import { LocationDetailClient } from "./LocationDetailClient";

interface LocationDetailPageProps {
  params: Promise<{
    location: string;
    slug: string;
  }>;
}

export default async function LocationDetailPage({ params }: LocationDetailPageProps) {
  const { location, slug } = await params;
  return <LocationDetailClient location={location} slug={slug} />;
}


