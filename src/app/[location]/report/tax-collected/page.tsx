import { TaxCollectedClient } from "./TaxCollectedClient";

interface TaxCollectedPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function TaxCollectedPage({ params }: TaxCollectedPageProps) {
  const { location } = await params;
  return <TaxCollectedClient location={location} />;
}
