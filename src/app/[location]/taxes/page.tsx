import { TaxCodesListingClient } from "./TaxCodesListingClient";

interface TaxesPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function TaxesPage({ params }: TaxesPageProps) {
  const { location } = await params;
  return <TaxCodesListingClient location={location} />;
}
