import { InvoicesListingClient } from "./InvoicesListingClient";

interface InvoicesPageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function InvoicesPage({ params }: InvoicesPageProps) {
  const { location } = await params;
  return <InvoicesListingClient location={location} />;
}

